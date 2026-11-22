BEGIN;

-- player_avatar pasa a ser el registro principal del avatar elegido.
-- Se mantiene la copia en player_state para que los consumidores actuales
-- del juego sigan leyendo el mismo avatar mientras se migra cada pantalla.
CREATE OR REPLACE FUNCTION algoritmos.api_guardar_avatar_y_estado(p_avatar jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión';
    END IF;
    IF p_avatar IS NULL OR jsonb_typeof(p_avatar) NOT IN ('object', 'array') THEN
        RAISE EXCEPTION 'La configuración del avatar no es válida';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = v_user_id) THEN
        RAISE EXCEPTION 'No se encontró el perfil del jugador';
    END IF;

    INSERT INTO player_avatar (user_id, avatar_config, updated_at)
    VALUES (v_user_id, p_avatar, now())
    ON CONFLICT (user_id) DO UPDATE
       SET avatar_config = EXCLUDED.avatar_config,
           updated_at = EXCLUDED.updated_at;

    INSERT INTO player_state (user_id, avatar, updated_at)
    VALUES (v_user_id, p_avatar, now())
    ON CONFLICT (user_id) DO UPDATE
       SET avatar = EXCLUDED.avatar,
           updated_at = EXCLUDED.updated_at;

    RETURN jsonb_build_object('guardado', true, 'avatar', p_avatar);
END;
$function$;

REVOKE ALL ON FUNCTION algoritmos.api_guardar_avatar_y_estado(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION algoritmos.api_guardar_avatar_y_estado(jsonb) TO authenticated;

COMMIT;
