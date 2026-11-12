-- Aclara las consignas confirmadas por sus pruebas.
-- Conserva los cambios realizados en Supabase desde la exportación:
-- modifica solo textos intactos, reconoce textos ya corregidos y omite conflictos.
BEGIN;
DO $$
DECLARE
    prompt_actual TEXT;
    filas_actualizadas INTEGER;
    preguntas_actualizadas INTEGER := 0;
    preguntas_ya_corregidas INTEGER := 0;
    preguntas_omitidas INTEGER := 0;
BEGIN
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1796 AND label = 'U3-HC-180';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1796, 'U3-HC-180';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: registros entre 5 y 15 hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1796 AND label = 'U3-HC-180';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1796, 'U3-HC-180'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1796, 'U3-HC-180';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["5","15","16","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1796 AND q.label = 'U3-HC-180' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["5","15","16","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1908 AND label = 'U3-HC-221';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1908, 'U3-HC-221';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de control de combinaciones de almacén, resuelve este reto: Control de pares: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta los valores pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1908 AND label = 'U3-HC-221';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1908, 'U3-HC-221'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta los valores pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1908, 'U3-HC-221';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","-2","0","4"],"salida":["3"],"visible":false}'::jsonb, true) WHERE q.question_id = 1908 AND q.label = 'U3-HC-221' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","-2","0","4"]'::jsonb AND prueba.caso->'salida' = '["3"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1940 AND label = 'U3-HC-231';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1940, 'U3-HC-231';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de planificación de mantenimiento, resuelve este reto: Productos con cantidad par: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N cantidades. Suma las cantidades pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1940 AND label = 'U3-HC-231';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1940, 'U3-HC-231'; END IF;
        prompt_actual := 'Lee N y luego N cantidades. Suma las cantidades pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N cantidades. Suma las cantidades pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1940, 'U3-HC-231';
    END IF;
    IF prompt_actual = 'Lee N y luego N cantidades. Suma las cantidades pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","2","3","4"],"salida":["6"],"visible":false}'::jsonb, true) WHERE q.question_id = 1940 AND q.label = 'U3-HC-231' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","2","3","4"]'::jsonb AND prueba.caso->'salida' = '["6"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1772 AND label = 'U3-IC-039';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1772, 'U3-IC-039';
    ELSIF prompt_actual = 'Imprime una progresión desde inicio hasta límite usando un incremento. Resuélvelo usando un ciclo Mientras.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.' WHERE question_id = 1772 AND label = 'U3-IC-039';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1772, 'U3-IC-039'; END IF;
        prompt_actual := 'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1772, 'U3-IC-039';
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1820 AND label = 'U3-HC-134';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1820, 'U3-HC-134';
    ELSIF prompt_actual = 'Notas desaprobatorias: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1820 AND label = 'U3-HC-134';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1820, 'U3-HC-134'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1820, 'U3-HC-134';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","10","11"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1820 AND q.label = 'U3-HC-134' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","10","11"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1824 AND label = 'U3-HC-127';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1824, 'U3-HC-127';
    ELSIF prompt_actual = 'Puntajes que alcanzan el mínimo: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N puntajes. Cuenta los puntajes iguales o superiores a 11. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1824 AND label = 'U3-HC-127';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1824, 'U3-HC-127'; END IF;
        prompt_actual := 'Lee N y luego N puntajes. Cuenta los puntajes iguales o superiores a 11. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N puntajes. Cuenta los puntajes iguales o superiores a 11. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1824, 'U3-HC-127';
    END IF;
    IF prompt_actual = 'Lee N y luego N puntajes. Cuenta los puntajes iguales o superiores a 11. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","10","11"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1824 AND q.label = 'U3-HC-127' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","10","11"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1868 AND label = 'U3-HC-132';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1868, 'U3-HC-132';
    ELSIF prompt_actual = 'Temperaturas bajo cero: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1868 AND label = 'U3-HC-132';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1868, 'U3-HC-132'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1868, 'U3-HC-132';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","-1","0","1"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1868 AND q.label = 'U3-HC-132' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","-1","0","1"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1924 AND label = 'U3-HC-222';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1924, 'U3-HC-222';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de plan de producción por turnos, resuelve este reto: Reporte de impares: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta los valores impares (X MOD 2 <> 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1924 AND label = 'U3-HC-222';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1924, 'U3-HC-222'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta los valores impares (X MOD 2 <> 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores impares (X MOD 2 <> 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1924, 'U3-HC-222';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores impares (X MOD 2 <> 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","1","2","3"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1924 AND q.label = 'U3-HC-222' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","1","2","3"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1816 AND label = 'U3-HC-159';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1816, 'U3-HC-159';
    ELSIF prompt_actual = 'Contadores pares mayores a 2 en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1816 AND label = 'U3-HC-159';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1816, 'U3-HC-159'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1816, 'U3-HC-159';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","4","6","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1816 AND q.label = 'U3-HC-159' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","4","6","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1828 AND label = 'U3-HC-174';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1828, 'U3-HC-174';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: notas desaprobatorias hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1828 AND label = 'U3-HC-174';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1828, 'U3-HC-174'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1828, 'U3-HC-174';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["10","11","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1828 AND q.label = 'U3-HC-174' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["10","11","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1836 AND label = 'U3-HC-162';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1836, 'U3-HC-162';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: reporte de impares hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1836 AND label = 'U3-HC-162';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1836, 'U3-HC-162'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1836, 'U3-HC-162';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["1","2","3","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1836 AND q.label = 'U3-HC-162' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["1","2","3","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1900 AND label = 'U3-HC-259';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1900, 'U3-HC-259';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de resumen de operaciones, resuelve este reto: Contadores pares mayores a 2 en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1900 AND label = 'U3-HC-259';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1900, 'U3-HC-259'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1900, 'U3-HC-259';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","4","6","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1900 AND q.label = 'U3-HC-259' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","4","6","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1920 AND label = 'U3-HC-272';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1920, 'U3-HC-272';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de reporte de consumo, resuelve este reto: Resuelve con REPETIR-HASTA QUE: temperaturas bajo cero hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1920 AND label = 'U3-HC-272';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1920, 'U3-HC-272'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1920, 'U3-HC-272';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1920 AND q.label = 'U3-HC-272' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1952 AND label = 'U3-HC-261';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1952, 'U3-HC-261';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de control de combinaciones de almacén, resuelve este reto: Resuelve con REPETIR-HASTA QUE: control de pares hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1952 AND label = 'U3-HC-261';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1952, 'U3-HC-261'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1952, 'U3-HC-261';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-2","4","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1952 AND q.label = 'U3-HC-261' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-2","4","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1972 AND label = 'U3-HC-279';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1972, 'U3-HC-279';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de resumen de operaciones, resuelve este reto: Resuelve con REPETIR-HASTA QUE: contadores pares mayores a 2 hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1972 AND label = 'U3-HC-279';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1972, 'U3-HC-279'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1972, 'U3-HC-279';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","4","6","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1972 AND q.label = 'U3-HC-279' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","4","6","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1980 AND label = 'U3-HC-280';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1980, 'U3-HC-280';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de taller integrador, resuelve este reto: Resuelve con REPETIR-HASTA QUE: registros entre 5 y 15 hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1980 AND label = 'U3-HC-280';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1980, 'U3-HC-280'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1980, 'U3-HC-280';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["5","15","16","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1980 AND q.label = 'U3-HC-280' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["5","15","16","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1992 AND label = 'U3-HC-241';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1992, 'U3-HC-241';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de control de combinaciones de almacén, resuelve este reto: Control de pares en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1992 AND label = 'U3-HC-241';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1992, 'U3-HC-241'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1992, 'U3-HC-241';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-2","4","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1992 AND q.label = 'U3-HC-241' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-2","4","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1769 AND label = 'U3-IC-099';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1769, 'U3-IC-099';
    ELSIF prompt_actual = 'Taller de repaso final sobre conteo de divisiones exactas: resuelve con un ciclo MIENTRAS. Imprime una progresión desde inicio hasta límite usando un incremento.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.' WHERE question_id = 1769 AND label = 'U3-IC-099';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1769, 'U3-IC-099'; END IF;
        prompt_actual := 'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1769, 'U3-IC-099';
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1801 AND label = 'U3-HC-179';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1801, 'U3-HC-179';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: contadores pares mayores a 2 hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1801 AND label = 'U3-HC-179';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1801, 'U3-HC-179'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1801, 'U3-HC-179';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","4","6","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1801 AND q.label = 'U3-HC-179' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","4","6","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1857 AND label = 'U3-HC-173';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1857, 'U3-HC-173';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: mediciones no negativas hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1857 AND label = 'U3-HC-173';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1857, 'U3-HC-173'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1857, 'U3-HC-173';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-1","1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1857 AND q.label = 'U3-HC-173' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-1","1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1917 AND label = 'U3-HC-256';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1917, 'U3-HC-256';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de control de mediciones, resuelve este reto: Piezas divisibles entre cuatro en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1917 AND label = 'U3-HC-256';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1917, 'U3-HC-256'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1917, 'U3-HC-256';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["4","5","8","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1917 AND q.label = 'U3-HC-256' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["4","5","8","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1861 AND label = 'U3-HC-133';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1861, 'U3-HC-133';
    ELSIF prompt_actual = 'Mediciones no negativas: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N mediciones. Suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1861 AND label = 'U3-HC-133';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1861, 'U3-HC-133'; END IF;
        prompt_actual := 'Lee N y luego N mediciones. Suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N mediciones. Suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1861, 'U3-HC-133';
    END IF;
    IF prompt_actual = 'Lee N y luego N mediciones. Suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","-1","0","1"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1861 AND q.label = 'U3-HC-133' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","-1","0","1"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1885 AND label = 'U3-HC-121';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1885, 'U3-HC-121';
    ELSIF prompt_actual = 'Control de pares: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta los valores pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1885 AND label = 'U3-HC-121';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1885, 'U3-HC-121'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta los valores pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1885, 'U3-HC-121';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores pares (X MOD 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","-2","0","4"],"salida":["3"],"visible":false}'::jsonb, true) WHERE q.question_id = 1885 AND q.label = 'U3-HC-121' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","-2","0","4"]'::jsonb AND prueba.caso->'salida' = '["3"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1901 AND label = 'U3-HC-233';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1901, 'U3-HC-233';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de validación de pedidos, resuelve este reto: Mediciones no negativas: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N mediciones. Suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1901 AND label = 'U3-HC-233';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1901, 'U3-HC-233'; END IF;
        prompt_actual := 'Lee N y luego N mediciones. Suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N mediciones. Suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1901, 'U3-HC-233';
    END IF;
    IF prompt_actual = 'Lee N y luego N mediciones. Suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","-1","0","1"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1901 AND q.label = 'U3-HC-233' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","-1","0","1"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1965 AND label = 'U3-HC-234';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1965, 'U3-HC-234';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de programación de rutas, resuelve este reto: Notas desaprobatorias: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1965 AND label = 'U3-HC-234';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1965, 'U3-HC-234'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1965, 'U3-HC-234';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","10","11"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1965 AND q.label = 'U3-HC-234' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","10","11"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1993 AND label = 'U3-HC-240';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1993, 'U3-HC-240';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de taller integrador, resuelve este reto: Registros entre 5 y 15: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N registros. Cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1993 AND label = 'U3-HC-240';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1993, 'U3-HC-240'; END IF;
        prompt_actual := 'Lee N y luego N registros. Cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N registros. Cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1993, 'U3-HC-240';
    END IF;
    IF prompt_actual = 'Lee N y luego N registros. Cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","5","15","16"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1993 AND q.label = 'U3-HC-240' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","5","15","16"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1805 AND label = 'U3-HC-161';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1805, 'U3-HC-161';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: control de pares hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1805 AND label = 'U3-HC-161';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1805, 'U3-HC-161'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1805, 'U3-HC-161';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-2","4","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1805 AND q.label = 'U3-HC-161' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-2","4","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1825 AND label = 'U3-HC-142';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1825, 'U3-HC-142';
    ELSIF prompt_actual = 'Reporte de impares en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1825 AND label = 'U3-HC-142';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1825, 'U3-HC-142'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1825, 'U3-HC-142';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["1","2","3","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1825 AND q.label = 'U3-HC-142' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["1","2","3","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1833 AND label = 'U3-HC-176';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1833, 'U3-HC-176';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: piezas divisibles entre cuatro hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1833 AND label = 'U3-HC-176';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1833, 'U3-HC-176'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1833, 'U3-HC-176';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["4","5","8","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1833 AND q.label = 'U3-HC-176' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["4","5","8","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1877 AND label = 'U3-HC-172';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1877, 'U3-HC-172';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: temperaturas bajo cero hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1877 AND label = 'U3-HC-172';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1877, 'U3-HC-172'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1877, 'U3-HC-172';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1877 AND q.label = 'U3-HC-172' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1881 AND label = 'U3-HC-153';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1881, 'U3-HC-153';
    ELSIF prompt_actual = 'Mediciones no negativas en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1881 AND label = 'U3-HC-153';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1881, 'U3-HC-153'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1881, 'U3-HC-153';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-1","1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1881 AND q.label = 'U3-HC-153' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-1","1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1905 AND label = 'U3-HC-253';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1905, 'U3-HC-253';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de validación de pedidos, resuelve este reto: Mediciones no negativas en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1905 AND label = 'U3-HC-253';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1905, 'U3-HC-253'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1905, 'U3-HC-253';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-1","1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1905 AND q.label = 'U3-HC-253' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-1","1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1949 AND label = 'U3-HC-254';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1949, 'U3-HC-254';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de programación de rutas, resuelve este reto: Notas desaprobatorias en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1949 AND label = 'U3-HC-254';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1949, 'U3-HC-254'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1949, 'U3-HC-254';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["10","11","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1949 AND q.label = 'U3-HC-254' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["10","11","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1969 AND label = 'U3-HC-252';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1969, 'U3-HC-252';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de reporte de consumo, resuelve este reto: Temperaturas bajo cero en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1969 AND label = 'U3-HC-252';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1969, 'U3-HC-252'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1969, 'U3-HC-252';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1969 AND q.label = 'U3-HC-252' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1973 AND label = 'U3-HC-258';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1973, 'U3-HC-258';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de seguimiento de metas, resuelve este reto: Reservas positivas en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1973 AND label = 'U3-HC-258';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1973, 'U3-HC-258'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1973, 'U3-HC-258';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1973 AND q.label = 'U3-HC-258' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1765 AND label = 'U3-IC-078';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1765, 'U3-IC-078';
    ELSIF prompt_actual = 'Aplicación en la programación de ciclos de mantenimiento: Muestra la tabla de multiplicar de una base hasta un límite indicado. Resuélvelo usando un ciclo Para.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.' WHERE question_id = 1765 AND label = 'U3-IC-078';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1765, 'U3-IC-078'; END IF;
        prompt_actual := 'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1765, 'U3-IC-078';
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1846 AND label = 'U3-HC-141';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1846, 'U3-HC-141';
    ELSIF prompt_actual = 'Control de pares en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1846 AND label = 'U3-HC-141';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1846, 'U3-HC-141'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1846, 'U3-HC-141';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares (x mod 2 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-2","4","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1846 AND q.label = 'U3-HC-141' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-2","4","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1854 AND label = 'U3-HC-138';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1854, 'U3-HC-138';
    ELSIF prompt_actual = 'Reservas positivas: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1854 AND label = 'U3-HC-138';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1854, 'U3-HC-138'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1854, 'U3-HC-138';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","1","0","-1"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1854 AND q.label = 'U3-HC-138' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","1","0","-1"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1890 AND label = 'U3-HC-139';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1890, 'U3-HC-139';
    ELSIF prompt_actual = 'Contadores pares mayores a 2: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1890 AND label = 'U3-HC-139';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1890, 'U3-HC-139'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1890, 'U3-HC-139';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","2","4","6"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1890 AND q.label = 'U3-HC-139' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","2","4","6"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1814 AND label = 'U3-HC-136';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1814, 'U3-HC-136';
    ELSIF prompt_actual = 'Piezas divisibles entre cuatro: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta los valores divisibles entre 4 (X MOD 4 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1814 AND label = 'U3-HC-136';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1814, 'U3-HC-136'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta los valores divisibles entre 4 (X MOD 4 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores divisibles entre 4 (X MOD 4 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1814, 'U3-HC-136';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores divisibles entre 4 (X MOD 4 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","4","5","8"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1814 AND q.label = 'U3-HC-136' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","4","5","8"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1978 AND label = 'U3-HC-236';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1978, 'U3-HC-236';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de control de mediciones, resuelve este reto: Piezas divisibles entre cuatro: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta los valores divisibles entre 4 (X MOD 4 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1978 AND label = 'U3-HC-236';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1978, 'U3-HC-236'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta los valores divisibles entre 4 (X MOD 4 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores divisibles entre 4 (X MOD 4 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1978, 'U3-HC-236';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores divisibles entre 4 (X MOD 4 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","4","5","8"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1978 AND q.label = 'U3-HC-236' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","4","5","8"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1838 AND label = 'U3-HC-154';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1838, 'U3-HC-154';
    ELSIF prompt_actual = 'Notas desaprobatorias en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1838 AND label = 'U3-HC-154';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1838, 'U3-HC-154'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1838, 'U3-HC-154';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["10","11","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1838 AND q.label = 'U3-HC-154' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["10","11","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1862 AND label = 'U3-HC-152';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1862, 'U3-HC-152';
    ELSIF prompt_actual = 'Temperaturas bajo cero en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1862 AND label = 'U3-HC-152';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1862, 'U3-HC-152'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1862, 'U3-HC-152';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1862 AND q.label = 'U3-HC-152' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1942 AND label = 'U3-HC-262';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1942, 'U3-HC-262';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de plan de producción por turnos, resuelve este reto: Resuelve con REPETIR-HASTA QUE: reporte de impares hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1942 AND label = 'U3-HC-262';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1942, 'U3-HC-262'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1942, 'U3-HC-262';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["1","2","3","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1942 AND q.label = 'U3-HC-262' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["1","2","3","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1950 AND label = 'U3-HC-276';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1950, 'U3-HC-276';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de control de mediciones, resuelve este reto: Resuelve con REPETIR-HASTA QUE: piezas divisibles entre cuatro hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1950 AND label = 'U3-HC-276';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1950, 'U3-HC-276'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1950, 'U3-HC-276';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["4","5","8","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1950 AND q.label = 'U3-HC-276' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["4","5","8","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1962 AND label = 'U3-HC-273';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1962, 'U3-HC-273';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de validación de pedidos, resuelve este reto: Resuelve con REPETIR-HASTA QUE: mediciones no negativas hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1962 AND label = 'U3-HC-273';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1962, 'U3-HC-273'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1962, 'U3-HC-273';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las mediciones mayores o iguales que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["-1","1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1962 AND q.label = 'U3-HC-273' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["-1","1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1986 AND label = 'U3-HC-260';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1986, 'U3-HC-260';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de taller integrador, resuelve este reto: Registros entre 5 y 15 en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1986 AND label = 'U3-HC-260';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1986, 'U3-HC-260'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1986, 'U3-HC-260';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["5","15","16","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1986 AND q.label = 'U3-HC-260' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["5","15","16","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1990 AND label = 'U3-HC-271';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1990, 'U3-HC-271';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de planificación de mantenimiento, resuelve este reto: Resuelve con REPETIR-HASTA QUE: productos con cantidad par hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las cantidades pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1990 AND label = 'U3-HC-271';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1990, 'U3-HC-271'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las cantidades pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las cantidades pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1990, 'U3-HC-271';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, suma las cantidades pares (x mod 2 = 0). Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","3","4","0"],"salida":["6"],"visible":false}'::jsonb, true) WHERE q.question_id = 1990 AND q.label = 'U3-HC-271' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","3","4","0"]'::jsonb AND prueba.caso->'salida' = '["6"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1847 AND label = 'U3-HC-160';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1847, 'U3-HC-160';
    ELSIF prompt_actual = 'Registros entre 5 y 15 en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1847 AND label = 'U3-HC-160';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1847, 'U3-HC-160'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1847, 'U3-HC-160';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["5","15","16","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1847 AND q.label = 'U3-HC-160' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["5","15","16","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1855 AND label = 'U3-HC-122';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1855, 'U3-HC-122';
    ELSIF prompt_actual = 'Reporte de impares: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta los valores impares (X MOD 2 <> 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1855 AND label = 'U3-HC-122';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1855, 'U3-HC-122'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta los valores impares (X MOD 2 <> 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores impares (X MOD 2 <> 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1855, 'U3-HC-122';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores impares (X MOD 2 <> 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","1","2","3"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1855 AND q.label = 'U3-HC-122' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","1","2","3"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1931 AND label = 'U3-HC-238';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1931, 'U3-HC-238';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de seguimiento de metas, resuelve este reto: Reservas positivas: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1931 AND label = 'U3-HC-238';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1931, 'U3-HC-238'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1931, 'U3-HC-238';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","1","0","-1"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1931 AND q.label = 'U3-HC-238' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","1","0","-1"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1699 AND label = 'U3-IC-018';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1699, 'U3-IC-018';
    ELSIF prompt_actual = 'Muestra la tabla de multiplicar de una base hasta un límite indicado. Resuélvelo usando un ciclo Para.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.' WHERE question_id = 1699 AND label = 'U3-IC-018';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1699, 'U3-IC-018'; END IF;
        prompt_actual := 'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1699, 'U3-IC-018';
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1859 AND label = 'U3-HC-140';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1859, 'U3-HC-140';
    ELSIF prompt_actual = 'Registros entre 5 y 15: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N registros. Cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1859 AND label = 'U3-HC-140';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1859, 'U3-HC-140'; END IF;
        prompt_actual := 'Lee N y luego N registros. Cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N registros. Cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1859, 'U3-HC-140';
    END IF;
    IF prompt_actual = 'Lee N y luego N registros. Cuenta los registros entre 5 y 15, incluidos ambos límites. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","5","15","16"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1859 AND q.label = 'U3-HC-140' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","5","15","16"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1895 AND label = 'U3-HC-239';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1895, 'U3-HC-239';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de resumen de operaciones, resuelve este reto: Contadores pares mayores a 2: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1895 AND label = 'U3-HC-239';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1895, 'U3-HC-239'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1895, 'U3-HC-239';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","2","4","6"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1895 AND q.label = 'U3-HC-239' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","2","4","6"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1975 AND label = 'U3-HC-227';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1975, 'U3-HC-227';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de seguimiento de indicadores, resuelve este reto: Puntajes que alcanzan el mínimo: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N puntajes. Cuenta los puntajes iguales o superiores a 11. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1975 AND label = 'U3-HC-227';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1975, 'U3-HC-227'; END IF;
        prompt_actual := 'Lee N y luego N puntajes. Cuenta los puntajes iguales o superiores a 11. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N puntajes. Cuenta los puntajes iguales o superiores a 11. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1975, 'U3-HC-227';
    END IF;
    IF prompt_actual = 'Lee N y luego N puntajes. Cuenta los puntajes iguales o superiores a 11. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["2","10","11"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1975 AND q.label = 'U3-HC-227' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["2","10","11"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1991 AND label = 'U3-HC-232';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1991, 'U3-HC-232';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de reporte de consumo, resuelve este reto: Temperaturas bajo cero: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee N y luego N valores enteros. Cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1991 AND label = 'U3-HC-232';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1991, 'U3-HC-232'; END IF;
        prompt_actual := 'Lee N y luego N valores enteros. Cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1991, 'U3-HC-232';
    END IF;
    IF prompt_actual = 'Lee N y luego N valores enteros. Cuenta las temperaturas menores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["3","-1","0","1"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1991 AND q.label = 'U3-HC-232' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["3","-1","0","1"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1815 AND label = 'U3-HC-156';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1815, 'U3-HC-156';
    ELSIF prompt_actual = 'Piezas divisibles entre cuatro en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1815 AND label = 'U3-HC-156';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1815, 'U3-HC-156'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1815, 'U3-HC-156';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores divisibles entre 4 (x mod 4 = 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["4","5","8","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1815 AND q.label = 'U3-HC-156' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["4","5","8","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1827 AND label = 'U3-HC-178';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1827, 'U3-HC-178';
    ELSIF prompt_actual = 'Resuelve con REPETIR-HASTA QUE: reservas positivas hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1827 AND label = 'U3-HC-178';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1827, 'U3-HC-178'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1827, 'U3-HC-178';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1827 AND q.label = 'U3-HC-178' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1851 AND label = 'U3-HC-158';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1851, 'U3-HC-158';
    ELSIF prompt_actual = 'Reservas positivas en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1851 AND label = 'U3-HC-158';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1851, 'U3-HC-158'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1851, 'U3-HC-158';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1851 AND q.label = 'U3-HC-158' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1903 AND label = 'U3-HC-242';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1903, 'U3-HC-242';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de plan de producción por turnos, resuelve este reto: Reporte de impares en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Mientras y una estructura Si.' WHERE question_id = 1903 AND label = 'U3-HC-242';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1903, 'U3-HC-242'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Mientras y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Mientras y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1903, 'U3-HC-242';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores impares (x mod 2 <> 0). Usa un ciclo Mientras y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["1","2","3","0"],"salida":["2"],"visible":false}'::jsonb, true) WHERE q.question_id = 1903 AND q.label = 'U3-HC-242' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["1","2","3","0"]'::jsonb AND prueba.caso->'salida' = '["2"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1919 AND label = 'U3-HC-274';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1919, 'U3-HC-274';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de programación de rutas, resuelve este reto: Resuelve con REPETIR-HASTA QUE: notas desaprobatorias hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1919 AND label = 'U3-HC-274';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1919, 'U3-HC-274'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1919, 'U3-HC-274';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las notas menores que 11. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["10","11","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1919 AND q.label = 'U3-HC-274' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["10","11","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = 1943 AND label = 'U3-HC-278';
    IF NOT FOUND THEN
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): no existe en Supabase', 1943, 'U3-HC-278';
    ELSIF prompt_actual = 'En el segundo escenario avanzado de seguimiento de metas, resuelve este reto: Resuelve con REPETIR-HASTA QUE: reservas positivas hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.' THEN
        UPDATE algoritmos.questions SET prompt = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' WHERE question_id = 1943 AND label = 'U3-HC-278';
        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;
        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', 1943, 'U3-HC-278'; END IF;
        prompt_actual := 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.';
        preguntas_actualizadas := preguntas_actualizadas + 1;
    ELSIF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;
    ELSE
        preguntas_omitidas := preguntas_omitidas + 1;
        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', 1943, 'U3-HC-278';
    END IF;
    IF prompt_actual = 'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta las reservas mayores que cero. Usa un ciclo Repetir-Hasta Que y una estructura Si.' THEN
        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || '{"entradas":["1","0"],"salida":["1"],"visible":false}'::jsonb, true) WHERE q.question_id = 1943 AND q.label = 'U3-HC-278' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = '["1","0"]'::jsonb AND prueba.caso->'salida' = '["1"]'::jsonb);
    END IF;
    RAISE NOTICE 'Resultado: % enunciados actualizados, % ya estaban corregidos y % omitidos para revisión', preguntas_actualizadas, preguntas_ya_corregidas, preguntas_omitidas;
END $$;
COMMIT;
