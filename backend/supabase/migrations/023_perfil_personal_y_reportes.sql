BEGIN;

-- Perfil personal visible solo para su dueño. Devuelve cumpleaños únicamente a esa persona.
CREATE OR REPLACE FUNCTION algoritmos.api_perfil_personal()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v UUID := auth.uid();
    r RECORD;
BEGIN
    IF v IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
    SELECT u.username, u.nombres, u.apellidos, u.fecha_nacimiento,
           u.gender AS genero, u.created_at,
           (SELECT c.name FROM enrollments e JOIN careers c USING (career_id)
            WHERE e.user_id = u.user_id AND e.active ORDER BY e.enrolled_at DESC LIMIT 1) AS carrera
    INTO r FROM users u WHERE u.user_id = v;
    IF NOT FOUND THEN RAISE EXCEPTION 'No se encontró el perfil'; END IF;
    RETURN jsonb_build_object(
        'username', r.username, 'nombres', r.nombres, 'apellidos', r.apellidos,
        'fechaNacimiento', r.fecha_nacimiento, 'genero', r.genero,
        'fechaRegistro', r.created_at, 'carrera', r.carrera
    );
END;
$function$;

CREATE OR REPLACE FUNCTION algoritmos.api_actualizar_username(p_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v UUID := auth.uid();
    nuevo text := regexp_replace(btrim(COALESCE(p_username, '')), '[[:space:]]+', ' ', 'g');
BEGIN
    IF v IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
    IF length(nuevo) < 2 OR length(nuevo) > 32 OR nuevo !~ '^[[:alnum:]_.-]+$' THEN
        RAISE EXCEPTION 'El nombre de usuario debe tener de 2 a 32 caracteres y solo admite letras, números, punto, guion y guion bajo';
    END IF;
    BEGIN
        UPDATE users SET username = nuevo, display_name = nuevo, updated_at = now() WHERE user_id = v;
    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'Ese nombre de usuario ya está registrado';
    END;
    IF NOT FOUND THEN RAISE EXCEPTION 'No se encontró el perfil'; END IF;
    RETURN jsonb_build_object('username', nuevo, 'usuario', nuevo);
END;
$function$;

-- Solo completa datos ausentes de cuentas antiguas. Los datos ya existentes no se pueden editar.
CREATE OR REPLACE FUNCTION algoritmos.api_completar_datos_personales(
    p_nombres text, p_apellidos text, p_fecha_nacimiento date, p_genero text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v UUID := auth.uid();
    n text := regexp_replace(btrim(COALESCE(p_nombres, '')), '[[:space:]]+', ' ', 'g');
    a text := regexp_replace(btrim(COALESCE(p_apellidos, '')), '[[:space:]]+', ' ', 'g');
    g text := lower(btrim(COALESCE(p_genero, '')));
    r RECORD;
BEGIN
    IF v IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
    IF length(n) NOT BETWEEN 2 AND 80 OR n !~ '^[[:alpha:]][[:alpha:] .''-]*$'
       OR length(a) NOT BETWEEN 2 AND 80 OR a !~ '^[[:alpha:]][[:alpha:] .''-]*$' THEN
        RAISE EXCEPTION 'Escribe nombres y apellidos válidos';
    END IF;
    IF p_fecha_nacimiento IS NULL OR p_fecha_nacimiento > current_date THEN RAISE EXCEPTION 'La fecha de nacimiento no es válida'; END IF;
    IF g NOT IN ('mujer','hombre','no_binario','otro','prefiero_no_decir') THEN RAISE EXCEPTION 'Elige una opción de género'; END IF;
    UPDATE users SET
        nombres = COALESCE(NULLIF(btrim(nombres), ''), n), apellidos = COALESCE(NULLIF(btrim(apellidos), ''), a),
        fecha_nacimiento = COALESCE(fecha_nacimiento, p_fecha_nacimiento),
        gender = COALESCE(NULLIF(btrim(gender), ''), g), updated_at = now()
    WHERE user_id = v
      AND (NULLIF(btrim(nombres), '') IS NULL OR NULLIF(btrim(apellidos), '') IS NULL OR fecha_nacimiento IS NULL OR NULLIF(btrim(gender), '') IS NULL);
    IF NOT FOUND AND NOT EXISTS (SELECT 1 FROM users WHERE user_id = v) THEN RAISE EXCEPTION 'No se encontró el perfil'; END IF;
    SELECT nombres, apellidos, fecha_nacimiento, gender INTO r FROM users WHERE user_id = v;
    IF NULLIF(btrim(r.nombres), '') IS NULL OR NULLIF(btrim(r.apellidos), '') IS NULL OR r.fecha_nacimiento IS NULL OR NULLIF(btrim(r.gender), '') IS NULL THEN
        RAISE EXCEPTION 'No se pudieron completar todos los datos requeridos';
    END IF;
    RETURN jsonb_build_object('nombres', r.nombres, 'apellidos', r.apellidos,
        'fechaNacimiento', r.fecha_nacimiento, 'genero', r.gender);
END;
$function$;

-- Reporte agregado: nunca devuelve nombres, usernames, correos ni fechas de nacimiento individuales.
CREATE OR REPLACE FUNCTION algoritmos.api_reporte_usuarios()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v UUID := auth.uid();
    salida jsonb;
BEGIN
    IF v IS NULL OR NOT EXISTS (
        SELECT 1 FROM user_roles ur JOIN roles r USING (role_id)
        WHERE ur.user_id = v AND r.code = 'administrador'
    ) THEN RAISE EXCEPTION 'Acceso exclusivo para administradores'; END IF;

    SELECT jsonb_build_object(
      'total', (SELECT count(*) FROM users),
      'porGenero', COALESCE((SELECT jsonb_agg(jsonb_build_object('categoria', categoria, 'cantidad', cantidad, 'porcentaje', porcentaje) ORDER BY categoria)
        FROM (SELECT CASE lower(COALESCE(NULLIF(u.gender,''),'sin dato'))
          WHEN 'mujer' THEN 'Mujer' WHEN 'hombre' THEN 'Hombre' WHEN 'no_binario' THEN 'No binario'
          WHEN 'otro' THEN 'Otro' WHEN 'prefiero_no_decir' THEN 'Prefiero no decirlo' ELSE 'Sin dato' END categoria, count(*) cantidad,
          round(count(*) * 100.0 / NULLIF((SELECT count(*) FROM users),0),1) porcentaje FROM users u GROUP BY 1) x), '[]'::jsonb),
      'porEdad', COALESCE((SELECT jsonb_agg(jsonb_build_object('categoria', categoria, 'cantidad', cantidad) ORDER BY orden)
        FROM (SELECT CASE WHEN fecha_nacimiento IS NULL THEN 'Sin dato'
          WHEN extract(year FROM age(current_date, fecha_nacimiento)) < 18 THEN 'Menor de 18'
          WHEN extract(year FROM age(current_date, fecha_nacimiento)) BETWEEN 18 AND 24 THEN '18–24'
          WHEN extract(year FROM age(current_date, fecha_nacimiento)) BETWEEN 25 AND 34 THEN '25–34'
          ELSE '35 o más' END categoria,
          CASE WHEN fecha_nacimiento IS NULL THEN 5
          WHEN extract(year FROM age(current_date, fecha_nacimiento)) < 18 THEN 1
          WHEN extract(year FROM age(current_date, fecha_nacimiento)) BETWEEN 18 AND 24 THEN 2
          WHEN extract(year FROM age(current_date, fecha_nacimiento)) BETWEEN 25 AND 34 THEN 3 ELSE 4 END orden,
          count(*) cantidad FROM users GROUP BY 1,2) x), '[]'::jsonb),
      'porCarrera', COALESCE((SELECT jsonb_agg(jsonb_build_object('categoria', categoria, 'cantidad', cantidad) ORDER BY cantidad DESC)
        FROM (SELECT COALESCE(c.name,'Sin carrera') categoria, count(DISTINCT e.user_id) cantidad
          FROM users u LEFT JOIN enrollments e ON e.user_id=u.user_id AND e.active
          LEFT JOIN careers c ON c.career_id=e.career_id GROUP BY 1) x), '[]'::jsonb),
      'porRol', COALESCE((SELECT jsonb_agg(jsonb_build_object('categoria', categoria, 'cantidad', cantidad) ORDER BY categoria)
        FROM (SELECT COALESCE(r.name,'Sin rol') categoria, count(DISTINCT u.user_id) cantidad
          FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.user_id LEFT JOIN roles r ON r.role_id=ur.role_id GROUP BY 1) x), '[]'::jsonb),
      'registrosMensuales', COALESCE((SELECT jsonb_agg(jsonb_build_object('mes', mes, 'cantidad', cantidad) ORDER BY mes)
        FROM (SELECT to_char(date_trunc('month',created_at),'YYYY-MM') mes, count(*) cantidad
          FROM users WHERE created_at >= date_trunc('month', current_date) - interval '11 months' GROUP BY 1) x), '[]'::jsonb)
    ) INTO salida;
    RETURN salida;
END;
$function$;

REVOKE ALL ON FUNCTION algoritmos.api_perfil_personal() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION algoritmos.api_actualizar_username(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION algoritmos.api_completar_datos_personales(text, text, date, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION algoritmos.api_reporte_usuarios() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION algoritmos.api_perfil_personal() TO authenticated;
GRANT EXECUTE ON FUNCTION algoritmos.api_actualizar_username(text) TO authenticated;
GRANT EXECUTE ON FUNCTION algoritmos.api_completar_datos_personales(text, text, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION algoritmos.api_reporte_usuarios() TO authenticated;

COMMIT;
