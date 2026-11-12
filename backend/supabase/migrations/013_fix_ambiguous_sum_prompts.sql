-- Alinea las preguntas con sus casos de Supabase: el resultado es una suma,
-- no un conteo. La palabra "límite" ahora indica explícitamente 100.
BEGIN;
UPDATE algoritmos.questions SET
 prompt = regexp_replace(prompt, 'Montos inferiores al límite', 'Suma los montos menores que 100', 'gi'),
 expected_answer = $r$Algoritmo SumarMontosMenoresQue100
Definir monto, suma Como Entero
suma <- 0
Leer monto
Mientras monto <> 0 Hacer
Si monto < 100 Entonces
suma <- suma + monto
FinSi
Leer monto
FinMientras
Escribir suma
FinAlgoritmo$r$
WHERE question_id IN (1870,1897) AND label IN ('U3-HC-148','U3-HC-248');
UPDATE algoritmos.questions SET evaluation_config = jsonb_set(evaluation_config, '{casos}', evaluation_config->'casos' || '[{"entradas":["100","99","0"],"salida":["99"],"visible":false}]'::jsonb)
WHERE question_id IN (1870,1897);

UPDATE algoritmos.questions SET
 prompt = regexp_replace(prompt, 'Montos inferiores al límite', 'Suma los montos menores que 100', 'gi'),
 expected_answer = $r$Algoritmo SumarMontosMenoresQue100
Definir monto, suma Como Entero
suma <- 0
Repetir
Leer monto
Si monto <> 0 Y monto < 100 Entonces
suma <- suma + monto
FinSi
Hasta Que monto = 0
Escribir suma
FinAlgoritmo$r$
WHERE question_id IN (1842,1910) AND label IN ('U3-HC-168','U3-HC-268');
UPDATE algoritmos.questions SET evaluation_config = jsonb_set(evaluation_config, '{casos}', evaluation_config->'casos' || '[{"entradas":["100","99","0"],"salida":["99"],"visible":false}]'::jsonb)
WHERE question_id IN (1842,1910);

UPDATE algoritmos.questions SET
 prompt = regexp_replace(prompt, 'Montos inferiores al límite', 'Suma los montos menores que 100', 'gi'),
 expected_answer = $r$Algoritmo SumarMontosMenoresQue100
Definir N, i, monto, suma Como Entero
Leer N
i <- 1
suma <- 0
Mientras i <= N Hacer
Leer monto
Si monto < 100 Entonces
suma <- suma + monto
FinSi
i <- i + 1
FinMientras
Escribir suma
FinAlgoritmo$r$
WHERE question_id IN (1871,1957) AND label IN ('U3-HC-128','U3-HC-228');
UPDATE algoritmos.questions SET evaluation_config = jsonb_set(evaluation_config, '{casos}', evaluation_config->'casos' || '[{"entradas":["4","100","99","-1","5"],"salida":["103"],"visible":false}]'::jsonb)
WHERE question_id IN (1871,1957);

UPDATE algoritmos.questions SET
 prompt = regexp_replace(prompt, 'Productos con cantidad par', 'Suma las cantidades pares de los productos', 'gi'),
 expected_answer = $r$Algoritmo SumarCantidadesPares
Definir cantidad, suma Como Entero
suma <- 0
Repetir
Leer cantidad
Si cantidad <> 0 Y cantidad MOD 2 = 0 Entonces
suma <- suma + cantidad
FinSi
Hasta Que cantidad = 0
Escribir suma
FinAlgoritmo$r$
WHERE question_id = 1823 AND label = 'U3-HC-171';

UPDATE algoritmos.questions SET
 prompt = regexp_replace(prompt, 'Productos con cantidad par', 'Suma las cantidades pares de los productos', 'gi'),
 expected_answer = $r$Algoritmo SumarCantidadesPares
Definir cantidad, suma Como Entero
suma <- 0
Leer cantidad
Mientras cantidad <> 0 Hacer
Si cantidad MOD 2 = 0 Entonces
suma <- suma + cantidad
FinSi
Leer cantidad
FinMientras
Escribir suma
FinAlgoritmo$r$
WHERE question_id IN (1879,1898) AND label IN ('U3-HC-151','U3-HC-251');

UPDATE algoritmos.questions SET
 prompt = regexp_replace(prompt, 'Productos con cantidad par', 'Suma las cantidades pares de los productos', 'gi'),
 expected_answer = $r$Algoritmo SumarCantidadesPares
Definir N, i, cantidad, suma Como Entero
Leer N
i <- 1
suma <- 0
Mientras i <= N Hacer
Leer cantidad
Si cantidad MOD 2 = 0 Entonces
suma <- suma + cantidad
FinSi
i <- i + 1
FinMientras
Escribir suma
FinAlgoritmo$r$
WHERE question_id = 1834 AND label = 'U3-HC-131';

UPDATE algoritmos.questions SET
 prompt = prompt || ' N puede ser 0; en ese caso muestra 0.'
WHERE question_id = 1916 AND label = 'U3-HC-287'
  AND prompt NOT ILIKE '%N puede ser 0%';
COMMIT;
