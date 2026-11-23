BEGIN;

-- Devuelve el perfil completo solicitado solo a cuentas administradoras.
CREATE OR REPLACE FUNCTION algoritmos.api_admin_detalle_usuario(p_username text)
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
        SELECT 1
        FROM user_roles ur
        JOIN roles r USING (role_id)
        WHERE ur.user_id = v AND lower(r.code) IN ('admin', 'administrador')
    ) THEN
        RAISE EXCEPTION 'Acceso exclusivo para administradores';
    END IF;

    SELECT jsonb_build_object(
        'usuario', u.username,
        'correo', u.email,
        'nombres', u.nombres,
        'apellidos', u.apellidos,
        'fechaNacimiento', u.fecha_nacimiento,
        'genero', u.gender,
        'rol', COALESCE((
            SELECT string_agg(DISTINCT r.name, ', ' ORDER BY r.name)
            FROM user_roles ur
            JOIN roles r USING (role_id)
            WHERE ur.user_id = u.user_id
        ), 'Sin rol'),
        'cuenta', u.account_status,
        'fechaRegistro', u.created_at,
        'ultimaConexion', u.last_login_at,
        'carrera', (
            SELECT c.name
            FROM enrollments e
            LEFT JOIN careers c USING (career_id)
            WHERE e.user_id = u.user_id AND e.active
            ORDER BY e.enrolled_at DESC
            LIMIT 1
        ),
        'seccion', (
            SELECT s.section_code
            FROM enrollments e
            JOIN sections s USING (section_id)
            WHERE e.user_id = u.user_id AND e.active
            ORDER BY e.enrolled_at DESC
            LIMIT 1
        ),
        'avatar', COALESCE(
            (SELECT pa.avatar_config FROM player_avatar pa WHERE pa.user_id = u.user_id),
            (SELECT ps.avatar FROM player_state ps WHERE ps.user_id = u.user_id)
        )
    )
    INTO salida
    FROM users u
    WHERE lower(u.username) = lower(btrim(COALESCE(p_username, '')));

    IF salida IS NULL THEN
        RAISE EXCEPTION 'No se encontró el perfil solicitado';
    END IF;

    RETURN salida;
END;
$function$;

REVOKE ALL ON FUNCTION algoritmos.api_admin_detalle_usuario(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION algoritmos.api_admin_detalle_usuario(text) TO authenticated;

COMMIT;
