-- Align count-based question wording, reference algorithms, and test cases.
-- Earlier versions said "montos inferiores" / "productos con cantidad par"
-- while the hidden evaluator expected sums, rejecting valid counting solutions.
BEGIN;

UPDATE algoritmos.questions
SET prompt = 'Lee montos hasta ingresar cero. Cuenta cuántos son menores que 100; no cuentes el cero. Usa Mientras y Si.',
    expected_answer = $answer$Algoritmo ContarMontosInferioresA100
Definir monto, contador Como Entero
contador <- 0
Leer monto
Mientras monto <> 0 Hacer
    Si monto < 100 Entonces
        contador <- contador + 1
    FinSi
    Leer monto
FinMientras
Escribir contador
FinAlgoritmo$answer$,
    evaluation_config = '{"casos":[{"entradas":["3","-2","4","0"],"salida":["3"]},{"entradas":["4","10","-3","5","0"],"salida":["4"]},{"entradas":["2","0"],"salida":["1"],"visible":false},{"entradas":["100","99","0"],"salida":["1"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id IN (1870, 1897);

UPDATE algoritmos.questions
SET prompt = 'Lee montos hasta ingresar cero. Cuenta cuántos son menores que 100; no cuentes el cero. Usa Repetir-Hasta Que y Si.',
    expected_answer = $answer$Algoritmo ContarMontosInferioresA100
Definir monto, contador Como Entero
contador <- 0
Repetir
    Leer monto
    Si monto <> 0 Y monto < 100 Entonces
        contador <- contador + 1
    FinSi
Hasta Que monto = 0
Escribir contador
FinAlgoritmo$answer$,
    evaluation_config = '{"casos":[{"entradas":["3","-2","4","0"],"salida":["3"]},{"entradas":["4","10","-3","5","0"],"salida":["4"]},{"entradas":["2","0"],"salida":["1"],"visible":false},{"entradas":["100","99","0"],"salida":["1"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id IN (1842, 1910);

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N montos. Suma los montos menores que 100. Usa Mientras y Si.',
    expected_answer = $answer$Algoritmo SumarMontosMenoresQue100
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
FinAlgoritmo$answer$,
    evaluation_config = '{"casos":[{"entradas":["4","3","-2","4","6"],"salida":["11"]},{"entradas":["5","4","10","-3","5","8"],"salida":["24"]},{"entradas":["4","2","0","12","-6"],"salida":["8"],"visible":false},{"entradas":["4","100","99","-1","5"],"salida":["103"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id IN (1871, 1957);

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N cantidades de productos. Cuenta cuántas cantidades son pares y muestra la cantidad. Usa Mientras y Si.',
    expected_answer = $answer$Algoritmo ContarProductosCantidadPar
Definir N, i, cantidad, contador Como Entero
Leer N
i <- 1
contador <- 0
Mientras i <= N Hacer
    Leer cantidad
    Si cantidad MOD 2 = 0 Entonces
        contador <- contador + 1
    FinSi
    i <- i + 1
FinMientras
Escribir contador
FinAlgoritmo$answer$,
    evaluation_config = '{"casos":[{"entradas":["4","3","-2","4","6"],"salida":["3"]},{"entradas":["5","4","10","-3","5","8"],"salida":["3"]},{"entradas":["4","2","0","12","-6"],"salida":["4"],"visible":false},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1940;

-- This related exercise expects the sum of even amounts; make that operation explicit.
UPDATE algoritmos.questions
SET prompt = 'Lee cantidades de productos hasta ingresar cero. Suma las cantidades pares y no incluyas el cero. Usa Repetir-Hasta Que y Si.'
WHERE question_id = 1990;

COMMIT;
