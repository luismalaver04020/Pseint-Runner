BEGIN;
SET LOCAL search_path TO algoritmos, public, extensions;

-- Difícil mantiene dos impactos disponibles: cada choque consume una vida.
UPDATE difficulties
SET life_damage = 1
WHERE code = 'dificil' AND life_damage <> 1;

CREATE OR REPLACE FUNCTION algoritmos.api_config_dificultad(p_difficulty_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'algoritmos', 'public', 'extensions'
AS $function$
DECLARE
    v_config jsonb;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión';
    END IF;

    SELECT jsonb_build_object(
        'code', code,
        'initial_lives', initial_lives,
        'life_damage', life_damage
    )
    INTO v_config
    FROM difficulties
    WHERE code = lower(trim(p_difficulty_code))
    ORDER BY difficulty_id
    LIMIT 1;

    IF v_config IS NULL THEN
        RAISE EXCEPTION 'La dificultad solicitada no está configurada';
    END IF;

    RETURN v_config;
END;
$function$;

REVOKE ALL ON FUNCTION algoritmos.api_config_dificultad(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION algoritmos.api_config_dificultad(text) TO authenticated;

COMMIT;
