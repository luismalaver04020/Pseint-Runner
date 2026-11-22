BEGIN;
SET LOCAL search_path TO algoritmos, public, extensions;

-- Completa el almacenamiento nuevo con avatares que estaban guardados en player_state.
INSERT INTO player_avatar (user_id, avatar_config, updated_at)
SELECT user_id, avatar, now()
FROM player_state
WHERE avatar IS NOT NULL AND avatar <> '{}'::jsonb
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION algoritmos.api_obtener_avatar()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_avatar jsonb;
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
    SELECT COALESCE(NULLIF(pa.avatar_config, '{}'::jsonb), ps.avatar)
    INTO v_avatar
    FROM users u
    LEFT JOIN player_avatar pa ON pa.user_id = u.user_id
    LEFT JOIN player_state ps ON ps.user_id = u.user_id
    WHERE u.user_id = v_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'No se encontró el perfil del jugador'; END IF;
    RETURN v_avatar;
END;
$function$;

REVOKE ALL ON FUNCTION algoritmos.api_obtener_avatar() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION algoritmos.api_obtener_avatar() TO authenticated;

COMMIT;
