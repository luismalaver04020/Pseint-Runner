BEGIN;

-- Los formularios ya existentes comparten esta validación. El trigger cubre
-- también altas y cambios que intenten omitir la validación del frontend.
CREATE OR REPLACE FUNCTION algoritmos.validar_genero_registro()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'algoritmos', 'public'
AS $function$
BEGIN
    IF NEW.gender IS NOT NULL AND lower(btrim(NEW.gender)) NOT IN ('hombre', 'mujer') THEN
        RAISE EXCEPTION 'El género debe ser Hombre o Mujer';
    END IF;
    NEW.gender := lower(btrim(NEW.gender));
    RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION algoritmos.validar_genero_registro() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_validar_genero_nuevo_usuario ON algoritmos.users;
CREATE TRIGGER trg_validar_genero_nuevo_usuario
    BEFORE INSERT ON algoritmos.users
    FOR EACH ROW EXECUTE FUNCTION algoritmos.validar_genero_registro();

DROP TRIGGER IF EXISTS trg_validar_genero_actualizado ON algoritmos.users;
CREATE TRIGGER trg_validar_genero_actualizado
    BEFORE UPDATE OF gender ON algoritmos.users
    FOR EACH ROW
    WHEN (NEW.gender IS DISTINCT FROM OLD.gender)
    EXECUTE FUNCTION algoritmos.validar_genero_registro();

COMMIT;
