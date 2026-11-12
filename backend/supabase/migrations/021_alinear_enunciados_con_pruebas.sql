-- Alinea preguntas cuyo banco exportado contiene contradicciones confirmadas:
-- 1) las preguntas de días usaban entradas decimales pese a describir días enteros;
-- 2) las preguntas de suma de positivos omitían que la lista empieza con N.
-- Cada cambio se aplica solo si coincide el identificador y el dato observado.
-- Si el contenido actual de Supabase difiere, se conserva y se informa el conflicto.
BEGIN;

DO $$
DECLARE
    fila RECORD;
    casos_actuales JSONB;
    casos_corregidos JSONB;
    prompt_actual TEXT;
    filas INTEGER;
BEGIN
    -- U1-IC-001 promete enteros, pero algunos casos enviaban decimales.
    -- Sustituye el conjunto contaminado por tres casos enteros claros.
    UPDATE algoritmos.questions
       SET evaluation_config = jsonb_set(
               COALESCE(evaluation_config, '{}'::jsonb),
               '{casos}',
               '[
                 {"entradas":["1","2"],"salida":["Ingrese el primer numero:","Ingrese el segundo numero:","Suma: 3","Resta: -1","Multiplicacion: 2","Division: 0.5"],"visible":true},
                 {"entradas":["-4","2"],"salida":["Ingrese el primer numero:","Ingrese el segundo numero:","Suma: -2","Resta: -6","Multiplicacion: -8","Division: -2"],"visible":true},
                 {"entradas":["12","3"],"salida":["Ingrese el primer numero:","Ingrese el segundo numero:","Suma: 15","Resta: 9","Multiplicacion: 36","Division: 4"],"visible":false}
               ]'::jsonb,
               true
           )
     WHERE question_id = 343
       AND label = 'U1-IC-001'
       AND prompt = 'Desarrolla un algoritmo que solicite dos números enteros y muestre su suma, resta, multiplicación y división. Considera que el segundo número será diferente de cero.'
       AND EXISTS (
           SELECT 1
             FROM jsonb_array_elements(COALESCE(evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso)
            WHERE (caso->'entradas'->>0) ~ '^-?[0-9]+[.,][0-9]+$'
               OR (caso->'entradas'->>1) ~ '^-?[0-9]+[.,][0-9]+$'
       );
    GET DIAGNOSTICS filas = ROW_COUNT;
    IF filas = 1 THEN
        RAISE NOTICE 'U1-IC-001: las pruebas ahora usan solo enteros y divisores distintos de cero.';
    ELSE
        RAISE NOTICE 'U1-IC-001: ya estaba corregida, no existe o cambió desde la exportación; se conserva.';
    END IF;

    -- U2-HC-125: los días se modelan como enteros. Reemplaza la prueba 4.5 por 4
    -- y agrega límites explícitos para confirmar las categorías 2 y 7.
    SELECT question_id, label, prompt, evaluation_config
      INTO fila
      FROM algoritmos.questions
     WHERE question_id = 1520 AND label = 'U2-HC-125';

    IF NOT FOUND THEN
        RAISE NOTICE 'Se omite U2-HC-125: no existe en la base actual.';
    ELSE
        casos_actuales := COALESCE(fila.evaluation_config->'casos', '[]'::jsonb);
        IF fila.prompt = 'Determina el estado de días de entrega (dias): hasta 2, inclusive, muestra «Express»; hasta 7, inclusive, muestra «Regular»; por encima de 7, muestra «Demorada». Usa una estructura Si para evaluar la condición.'
           AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(casos_actuales) AS x(c)
             WHERE c->'entradas' = '["4.5"]'::jsonb
               AND c->'salida' = '["Regular"]'::jsonb
        ) THEN
            SELECT jsonb_agg(
                       CASE WHEN c->'entradas' = '["4.5"]'::jsonb
                                  AND c->'salida' = '["Regular"]'::jsonb
                            THEN jsonb_set(c, '{entradas}', '["4"]'::jsonb, false)
                            ELSE c END
                       ORDER BY ord
                   )
              INTO casos_corregidos
              FROM jsonb_array_elements(casos_actuales) WITH ORDINALITY AS x(c, ord);

            IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(casos_corregidos) AS x(c)
                            WHERE c->'entradas' = '["2"]'::jsonb
                              AND c->'salida' = '["Express"]'::jsonb) THEN
                casos_corregidos := casos_corregidos ||
                    '[{"entradas":["2"],"salida":["Express"],"visible":false}]'::jsonb;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(casos_corregidos) AS x(c)
                            WHERE c->'entradas' = '["7"]'::jsonb
                              AND c->'salida' = '["Regular"]'::jsonb) THEN
                casos_corregidos := casos_corregidos ||
                    '[{"entradas":["7"],"salida":["Regular"],"visible":false}]'::jsonb;
            END IF;
            UPDATE algoritmos.questions
               SET evaluation_config = jsonb_set(COALESCE(evaluation_config, '{}'::jsonb),
                                                 '{casos}', casos_corregidos, true),
                   prompt = 'Lee un número entero no negativo de días de entrega (dias). Si es de 0 a 2, muestra «Express»; si es de 3 a 7, muestra «Regular»; si es mayor que 7, muestra «Demorada». Usa una estructura Si para evaluar la condición.'
             WHERE question_id = 1520 AND label = 'U2-HC-125';
            RAISE NOTICE 'U2-HC-125: se reemplazó 4.5 por 4 y se agregaron límites si faltaban.';
        ELSE
            RAISE NOTICE 'U2-HC-125: cambió el enunciado o la prueba esperada; no se modificó.';
        END IF;
    END IF;

    -- U2-HC-225 tiene el mismo problema de tipo. El 13.5 se vuelve 13;
    -- se agregan las fronteras inclusivas 8 y 19.
    SELECT question_id, label, prompt, evaluation_config
      INTO fila
      FROM algoritmos.questions
     WHERE question_id = 1694 AND label = 'U2-HC-225';

    IF NOT FOUND THEN
        RAISE NOTICE 'Se omite U2-HC-225: no existe en la base actual.';
    ELSE
        casos_actuales := COALESCE(fila.evaluation_config->'casos', '[]'::jsonb);
        IF fila.prompt = 'En el diagnóstico avanzado de dias, hasta 8 inclusive es «Categoría A: Express»; hasta 19 inclusive es «Categoría B: Regular»; por encima es «Categoría C: Demorada». Usa una estructura Si para evaluar la condición.'
           AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(casos_actuales) AS x(c)
             WHERE c->'entradas' = '["13.5"]'::jsonb
               AND c->'salida' = '["Categoría B: Regular"]'::jsonb
        ) THEN
            SELECT jsonb_agg(
                       CASE WHEN c->'entradas' = '["13.5"]'::jsonb
                                  AND c->'salida' = '["Categoría B: Regular"]'::jsonb
                            THEN jsonb_set(c, '{entradas}', '["13"]'::jsonb, false)
                            ELSE c END
                       ORDER BY ord
                   )
              INTO casos_corregidos
              FROM jsonb_array_elements(casos_actuales) WITH ORDINALITY AS x(c, ord);

            IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(casos_corregidos) AS x(c)
                            WHERE c->'entradas' = '["8"]'::jsonb
                              AND c->'salida' = '["Categoría A: Express"]'::jsonb) THEN
                casos_corregidos := casos_corregidos ||
                    '[{"entradas":["8"],"salida":["Categoría A: Express"],"visible":false}]'::jsonb;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(casos_corregidos) AS x(c)
                            WHERE c->'entradas' = '["19"]'::jsonb
                              AND c->'salida' = '["Categoría B: Regular"]'::jsonb) THEN
                casos_corregidos := casos_corregidos ||
                    '[{"entradas":["19"],"salida":["Categoría B: Regular"],"visible":false}]'::jsonb;
            END IF;
            UPDATE algoritmos.questions
               SET evaluation_config = jsonb_set(COALESCE(evaluation_config, '{}'::jsonb),
                                                 '{casos}', casos_corregidos, true),
                   prompt = 'Lee un número entero no negativo de días (dias). Si dias <= 8, muestra «Categoría A: Express»; si dias <= 19, muestra «Categoría B: Regular»; si es mayor que 19, muestra «Categoría C: Demorada». Usa una estructura Si para evaluar la condición.'
             WHERE question_id = 1694 AND label = 'U2-HC-225';
            RAISE NOTICE 'U2-HC-225: se reemplazó 13.5 por 13 y se agregaron límites si faltaban.';
        ELSE
            RAISE NOTICE 'U2-HC-225: cambió el enunciado o la prueba esperada; no se modificó.';
        END IF;
    END IF;

    -- Ambas preguntas describían una lista de tamaño N en sus casos, pero no
    -- indicaban cómo leer su longitud. Se aclara el formato sin cambiar pruebas.
    FOR fila IN
        SELECT question_id, label, prompt
          FROM algoritmos.questions
         WHERE (question_id = 1821 AND label = 'U3-HC-123')
            OR (question_id = 1902 AND label = 'U3-HC-223')
    LOOP
        prompt_actual := fila.prompt;
        IF prompt_actual IN (
            'Suma de positivos: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.',
            'En el segundo escenario avanzado de auditoría cruzada de sensores, resuelve este reto: Suma de positivos: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.'
        ) THEN
            UPDATE algoritmos.questions
               SET prompt = CASE question_id
                   WHEN 1821 THEN 'Lee N y luego exactamente N valores numéricos. Suma solo los valores mayores que cero. Usa un ciclo Mientras y una estructura Si para evaluar la condición.'
                   WHEN 1902 THEN 'Lee N y luego exactamente N valores numéricos. Suma solo los valores mayores que cero. Usa un ciclo Mientras y una estructura Si para evaluar la condición.'
                   ELSE prompt END
             WHERE question_id = fila.question_id AND label = fila.label;
            GET DIAGNOSTICS filas = ROW_COUNT;
            IF filas = 1 THEN
                RAISE NOTICE '%: se aclaró que se leen N valores.', fila.label;
            END IF;
        ELSE
            RAISE NOTICE '%: el enunciado cambió desde la exportación; se conserva sin sobrescribir.', fila.label;
        END IF;
    END LOOP;

    -- Los cuatro retos de tope no especificaban la entrada del tope y sus casos
    -- solo sumaban secuencias completas. Se hacen explícitos el tope, la suma,
    -- el orden de lectura y el ciclo requerido; los casos pasan a comprobar <=.
    FOR fila IN
        SELECT q.question_id, q.label, q.prompt, q.evaluation_config,
               fixes.prompt_anterior, fixes.prompt_nuevo
          FROM algoritmos.questions q
          JOIN (VALUES
            (1850, 'U3-HC-170', 'Resuelve con REPETIR-HASTA QUE: valores que no superan el tope hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.', 'Lee un tope entero y luego una secuencia de números enteros que termina en 0. Sin sumar el 0, suma los valores menores o iguales al tope. Usa Repetir-Hasta Que y una estructura Si.'),
            (1906, 'U3-HC-270', 'En el segundo escenario avanzado de procesamiento de lotes, resuelve este reto: Resuelve con REPETIR-HASTA QUE: valores que no superan el tope hasta que se ingrese cero, sin incluirlo en el cálculo. Usa una estructura Si para evaluar la condición.', 'Lee un tope entero y luego una secuencia de números enteros que termina en 0. Sin sumar el 0, suma los valores menores o iguales al tope. Usa Repetir-Hasta Que y una estructura Si.'),
            (1887, 'U3-HC-150', 'Valores que no superan el tope en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.', 'Lee un tope entero y luego una secuencia de números enteros que termina en 0. Sin sumar el 0, suma los valores menores o iguales al tope. Usa un ciclo Mientras y una estructura Si.'),
            (1925, 'U3-HC-250', 'En el segundo escenario avanzado de procesamiento de lotes, resuelve este reto: Valores que no superan el tope en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.', 'Lee un tope entero y luego una secuencia de números enteros que termina en 0. Sin sumar el 0, suma los valores menores o iguales al tope. Usa un ciclo Mientras y una estructura Si.')
          ) AS fixes(question_id, label, prompt_anterior, prompt_nuevo)
            ON q.question_id = fixes.question_id AND q.label = fixes.label
    LOOP
        casos_actuales := COALESCE(fila.evaluation_config->'casos', '[]'::jsonb);
        IF fila.prompt = fila.prompt_anterior
           AND EXISTS (SELECT 1 FROM jsonb_array_elements(casos_actuales) AS x(c)
                        WHERE c->'entradas' = '["3","-2","4","0"]'::jsonb
                          AND c->'salida' = '["5"]'::jsonb)
           AND EXISTS (SELECT 1 FROM jsonb_array_elements(casos_actuales) AS x(c)
                        WHERE c->'entradas' = '["4","10","-3","5","0"]'::jsonb
                          AND c->'salida' = '["16"]'::jsonb)
           AND EXISTS (SELECT 1 FROM jsonb_array_elements(casos_actuales) AS x(c)
                        WHERE c->'entradas' = '["2","0"]'::jsonb
                          AND c->'salida' = '["2"]'::jsonb) THEN
            UPDATE algoritmos.questions
               SET prompt = fila.prompt_nuevo,
                   evaluation_config = jsonb_set(
                       COALESCE(evaluation_config, '{}'::jsonb),
                       '{casos}',
                       '[
                         {"entradas":["3","-2","4","0"],"salida":["-2"],"visible":true},
                         {"entradas":["5","10","-3","5","0"],"salida":["2"],"visible":true},
                         {"entradas":["2","3","0"],"salida":["0"],"visible":false}
                       ]'::jsonb,
                       true
                   )
             WHERE question_id = fila.question_id AND label = fila.label;
            RAISE NOTICE '%: se especificó el tope y se alinearon sus casos.', fila.label;
        ELSIF fila.prompt = fila.prompt_nuevo THEN
            RAISE NOTICE '%: ya estaba corregida.', fila.label;
        ELSE
            RAISE NOTICE '%: cambió desde la exportación o sus casos no coinciden; se conserva.', fila.label;
        END IF;
    END LOOP;

    -- Reporte de impares es un conteo, no una suma: las salidas del banco son
    -- 1, 2 y 0 para las tres secuencias. Se indica la operación y el formato.
    FOR fila IN
        SELECT q.question_id, q.label, q.prompt,
               fixes.prompt_anterior, fixes.prompt_nuevo
          FROM algoritmos.questions q
          JOIN (VALUES
            (1825, 'U3-HC-142', 'Reporte de impares en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.', 'Lee números enteros hasta ingresar 0. Sin contar el 0, cuenta cuántos números impares ingresaste. Usa un ciclo Mientras y una estructura Si.'),
            (1903, 'U3-HC-242', 'En el segundo escenario avanzado de plan de producción por turnos, resuelve este reto: Reporte de impares en una secuencia de lecturas que termina con cero: calcula el resultado sin procesar el centinela. Resuélvelo usando un ciclo Mientras. Usa una estructura Si para evaluar la condición.', 'Lee números enteros hasta ingresar 0. Sin contar el 0, cuenta cuántos números impares ingresaste. Usa un ciclo Mientras y una estructura Si.'),
            (1855, 'U3-HC-122', 'Reporte de impares: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.', 'Lee N y luego exactamente N números enteros. Cuenta cuántos son impares usando un ciclo Mientras y una estructura Si.'),
            (1924, 'U3-HC-222', 'En el segundo escenario avanzado de plan de producción por turnos, resuelve este reto: Reporte de impares: procesa una lista de datos con un ciclo MIENTRAS y una condición. Usa una estructura Si para evaluar la condición.', 'Lee N y luego exactamente N números enteros. Cuenta cuántos son impares usando un ciclo Mientras y una estructura Si.')
          ) AS fixes(question_id, label, prompt_anterior, prompt_nuevo)
            ON q.question_id = fixes.question_id AND q.label = fixes.label
    LOOP
        IF fila.prompt = fila.prompt_anterior THEN
            UPDATE algoritmos.questions
               SET prompt = fila.prompt_nuevo
             WHERE question_id = fila.question_id AND label = fila.label;
            RAISE NOTICE '%: se aclaró que debe contar impares.', fila.label;
        ELSIF fila.prompt = fila.prompt_nuevo THEN
            RAISE NOTICE '%: ya estaba corregida.', fila.label;
        ELSE
            RAISE NOTICE '%: el enunciado cambió desde la exportación; se conserva.', fila.label;
        END IF;
    END LOOP;
END $$;

COMMIT;
