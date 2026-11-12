-- Los casos de la pregunta esperan Temperatura normal en 80 y alerta desde 81.
-- Se explicita en el enunciado que el umbral es estricto (> 80).
BEGIN;

DO $$
DECLARE
    filas_actualizadas INTEGER;
BEGIN
    UPDATE algoritmos.questions
    SET prompt = 'En la cámara de almacenamiento, muestra «Alerta térmica» si la temperatura es superior a 80 °C; en caso contrario, muestra «Temperatura normal».'
    WHERE question_id = 1459 AND label = 'U2-IC-304';

    GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
    IF filas_actualizadas <> 1 THEN
        RAISE EXCEPTION 'Se esperaba actualizar exactamente U2-IC-304 (1459), se actualizaron % filas', filas_actualizadas;
    END IF;
END $$;

COMMIT;
