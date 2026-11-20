BEGIN;

ALTER TABLE algoritmos.users
    ADD COLUMN IF NOT EXISTS nombres VARCHAR(80),
    ADD COLUMN IF NOT EXISTS apellidos VARCHAR(80),
    ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

-- Recupera los datos enviados por las versiones nuevas del registro que
-- hayan creado el perfil antes de aplicar esta migración.
DO $migration$
DECLARE
    cuenta RECORD;
    nacimiento DATE;
BEGIN
    FOR cuenta IN
        SELECT id, raw_user_meta_data
        FROM auth.users
        WHERE raw_user_meta_data ? 'nombres'
           OR raw_user_meta_data ? 'apellidos'
           OR raw_user_meta_data ? 'fecha_nacimiento'
           OR raw_user_meta_data ? 'genero'
    LOOP
        BEGIN
            nacimiento := NULLIF(cuenta.raw_user_meta_data->>'fecha_nacimiento', '')::DATE;
        EXCEPTION WHEN OTHERS THEN
            nacimiento := NULL;
        END;

        UPDATE algoritmos.users AS perfil
        SET
            nombres = NULLIF(btrim(cuenta.raw_user_meta_data->>'nombres'), ''),
            apellidos = NULLIF(btrim(cuenta.raw_user_meta_data->>'apellidos'), ''),
            fecha_nacimiento = nacimiento,
            gender = NULLIF(btrim(cuenta.raw_user_meta_data->>'genero'), '')
        WHERE perfil.user_id = cuenta.id;
    END LOOP;
END;
$migration$;

CREATE OR REPLACE FUNCTION algoritmos.api_iniciar()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v UUID := auth.uid();
    v_meta JSONB;
    v_email TEXT;
    v_username TEXT;
    v_nombres TEXT;
    v_apellidos TEXT;
    v_fecha_nacimiento DATE;
    v_genero TEXT;
    v_incluye_datos_personales BOOLEAN;
    v_constraint TEXT;
    v_rol TEXT;
    v_career SMALLINT;
    v_code TEXT;
BEGIN
    IF v IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = v) THEN
        SELECT email, raw_user_meta_data
        INTO v_email, v_meta
        FROM auth.users
        WHERE id = v;

        v_meta := COALESCE(v_meta, '{}'::JSONB);
        v_username := btrim(COALESCE(v_meta->>'username', ''));
        IF length(v_username) < 2 THEN
            RAISE EXCEPTION 'Falta el nombre de usuario';
        END IF;
        v_username := left(v_username, 40);

        v_incluye_datos_personales := v_meta ?| ARRAY['nombres', 'apellidos', 'fecha_nacimiento', 'genero'];
        IF v_incluye_datos_personales THEN
            v_nombres := regexp_replace(btrim(COALESCE(v_meta->>'nombres', '')), '[[:space:]]+', ' ', 'g');
            v_apellidos := regexp_replace(btrim(COALESCE(v_meta->>'apellidos', '')), '[[:space:]]+', ' ', 'g');
            IF length(v_nombres) < 2 OR length(v_nombres) > 80
               OR length(v_apellidos) < 2 OR length(v_apellidos) > 80 THEN
                RAISE EXCEPTION 'Completa nombres y apellidos válidos';
            END IF;

            IF NULLIF(btrim(v_meta->>'fecha_nacimiento'), '') IS NULL THEN
                RAISE EXCEPTION 'La fecha de nacimiento no es válida';
            END IF;
            BEGIN
                v_fecha_nacimiento := (v_meta->>'fecha_nacimiento')::DATE;
            EXCEPTION WHEN OTHERS THEN
                RAISE EXCEPTION 'La fecha de nacimiento no es válida';
            END;
            IF v_fecha_nacimiento > current_date THEN
                RAISE EXCEPTION 'La fecha de nacimiento no puede ser posterior a hoy';
            END IF;

            v_genero := lower(btrim(COALESCE(v_meta->>'genero', '')));
            IF v_genero NOT IN ('mujer', 'hombre', 'no_binario', 'otro', 'prefiero_no_decir') THEN
                RAISE EXCEPTION 'Elige una opción de género';
            END IF;
        END IF;

        v_rol := COALESCE(v_meta->>'rol', 'jugador');
        v_code := NULLIF(btrim(COALESCE(v_meta->>'codigo', '')), '');
        SELECT career_id INTO v_career
        FROM careers
        WHERE name = v_meta->>'carrera';

        -- uq_users_username_lower impide duplicados aun si dos altas ocurren a la vez.
        -- No se agrega un sufijo automático: se conserva el nombre que eligió el usuario.
        BEGIN
            INSERT INTO users (
                user_id, username, email, display_name, auth_provider, external_id,
                nombres, apellidos, fecha_nacimiento, gender
            ) VALUES (
                v, v_username, v_email, v_username, 'supabase', v::TEXT,
                v_nombres, v_apellidos, v_fecha_nacimiento, v_genero
            );
        EXCEPTION WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
            IF v_constraint = 'uq_users_username_lower' THEN
                RAISE EXCEPTION 'Ese nombre de usuario ya está registrado';
            END IF;
            RAISE;
        END;

        -- el trigger trg_assign_default_role ya le dio el rol 'jugador'
        IF v_rol = 'docente' THEN
            PERFORM request_teacher_role(v, v_career);
        ELSE
            BEGIN
                PERFORM register_player(v, v_career, v_code);
            EXCEPTION WHEN OTHERS THEN
                PERFORM register_player(v, v_career, NULL);
            END;
        END IF;
    END IF;

    UPDATE users SET last_login_at = now() WHERE user_id = v;
    RETURN api_mi_perfil();
END;
$function$;

COMMIT;
