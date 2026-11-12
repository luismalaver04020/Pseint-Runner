-- Alinea los casos de prueba con las operaciones que describen estas consignas.
BEGIN;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N cantidades de productos. Cuenta cuántas cantidades son pares y muestra el resultado. Usa un ciclo Mientras y una estructura Si.',
    expected_answer = $answer$Algoritmo ContarCantidadesPares
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
WHERE question_id = 1940 AND label = 'U3-HC-231';

UPDATE algoritmos.questions
SET prompt = 'Suma las lecturas positivas de una secuencia terminada al ingresar cero, sin incluir el cero. Usa Repetir-Hasta Que y Si.',
    expected_answer = $answer$Algoritmo SumarLecturasPositivas
Definir lectura, suma Como Entero
suma <- 0
Repetir
    Leer lectura
    Si lectura <> 0 Y lectura > 0 Entonces
        suma <- suma + lectura
    FinSi
Hasta Que lectura = 0
Escribir suma
FinAlgoritmo$answer$,
    evaluation_config = '{"casos":[{"entradas":["3","2","-4","6","0"],"salida":["11"]},{"entradas":["5","5","-3","8","0"],"salida":["18"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1712 AND label = 'U3-IC-052';

UPDATE algoritmos.questions
SET prompt = 'Cuenta las lecturas negativas hasta ingresar cero, sin contar el cero. Usa Repetir-Hasta Que y Si.',
    expected_answer = $answer$Algoritmo ContarLecturasNegativas
Definir lectura, contador Como Entero
contador <- 0
Repetir
    Leer lectura
    Si lectura <> 0 Y lectura < 0 Entonces
        contador <- contador + 1
    FinSi
Hasta Que lectura = 0
Escribir contador
FinAlgoritmo$answer$,
    evaluation_config = '{"casos":[{"entradas":["3","-2","4","0"],"salida":["1"]},{"entradas":["4","-8","-3","5","0"],"salida":["2"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1768 AND label = 'U3-IC-053';

UPDATE algoritmos.questions
SET prompt = 'Suma los valores ingresados hasta recibir cero como centinela. No incluyas el cero. Usa Repetir-Hasta Que.',
    expected_answer = $answer$Algoritmo SumarHastaCero
Definir valor, suma Como Entero
suma <- 0
Repetir
    Leer valor
    Si valor <> 0 Entonces
        suma <- suma + valor
    FinSi
Hasta Que valor = 0
Escribir suma
FinAlgoritmo$answer$,
    evaluation_config = '{"casos":[{"entradas":["12","3","0"],"salida":["15"]},{"entradas":["20","4","0"],"salida":["24"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1780 AND label = 'U3-IC-050';

COMMIT;
