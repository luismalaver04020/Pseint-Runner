-- Corrige pruebas que devolvían cero para todos los ejemplos y no detectaban errores.
BEGIN;
UPDATE algoritmos.questions SET prompt='Lee cargos hasta ingresar cero y cuenta cuántos son mayores que 100. No cuentes el cero. Usa Mientras y Si.', expected_answer=$r$Algoritmo ContarCargosSeleccionados
Definir valor, contador Como Entero
contador <- 0
Leer valor
Mientras valor <> 0 Hacer
Si valor > 100 Entonces
contador <- contador + 1
FinSi
Leer valor
FinMientras
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["99","100","101","200","0"],"salida":["2"]},{"entradas":["100","150","0"],"salida":["1"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1807,1971);

UPDATE algoritmos.questions SET prompt='Lee N cargos y cuenta cuántos son mayores que 100. Usa Mientras y Si.', expected_answer=$r$Algoritmo ContarCargosSeleccionados
Definir N, i, valor, contador Como Entero
Leer N
i <- 1
contador <- 0
Mientras i <= N Hacer
Leer valor
Si valor > 100 Entonces
contador <- contador + 1
FinSi
i <- i + 1
FinMientras
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["4","99","100","101","200"],"salida":["2"]},{"entradas":["3","100","150","200"],"salida":["2"]},{"entradas":["2","50","100"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1811,1960);

UPDATE algoritmos.questions SET prompt='Lee cargos hasta ingresar cero y cuenta cuántos son mayores que 100. No cuentes el cero. Usa Repetir-Hasta Que y Si.', expected_answer=$r$Algoritmo ContarCargosSeleccionados
Definir valor, contador Como Entero
contador <- 0
Repetir
Leer valor
Si valor <> 0 Y valor > 100 Entonces
contador <- contador + 1
FinSi
Hasta Que valor = 0
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["99","100","101","200","0"],"salida":["2"]},{"entradas":["100","150","0"],"salida":["1"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1889,1945);

UPDATE algoritmos.questions SET prompt='Lee N pedidos y cuenta cuántos son mayores que 100. Usa Mientras y Si.', expected_answer=$r$Algoritmo ContarPedidosSeleccionados
Definir N, i, valor, contador Como Entero
Leer N
i <- 1
contador <- 0
Mientras i <= N Hacer
Leer valor
Si valor > 100 Entonces
contador <- contador + 1
FinSi
i <- i + 1
FinMientras
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["4","99","100","101","200"],"salida":["2"]},{"entradas":["3","100","150","200"],"salida":["2"]},{"entradas":["2","50","100"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1812,1989);

UPDATE algoritmos.questions SET prompt='Lee pedidos hasta ingresar cero y cuenta cuántos son mayores que 100. No cuentes el cero. Usa Mientras y Si.', expected_answer=$r$Algoritmo ContarPedidosSeleccionados
Definir valor, contador Como Entero
contador <- 0
Leer valor
Mientras valor <> 0 Hacer
Si valor > 100 Entonces
contador <- contador + 1
FinSi
Leer valor
FinMientras
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["99","100","101","200","0"],"salida":["2"]},{"entradas":["100","150","0"],"salida":["1"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1841,1953);

UPDATE algoritmos.questions SET prompt='Lee pedidos hasta ingresar cero y cuenta cuántos son mayores que 100. No cuentes el cero. Usa Repetir-Hasta Que y Si.', expected_answer=$r$Algoritmo ContarPedidosSeleccionados
Definir valor, contador Como Entero
contador <- 0
Repetir
Leer valor
Si valor <> 0 Y valor > 100 Entonces
contador <- contador + 1
FinSi
Hasta Que valor = 0
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["99","100","101","200","0"],"salida":["2"]},{"entradas":["100","150","0"],"salida":["1"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1865,1955);

UPDATE algoritmos.questions SET prompt='Lee lecturas hasta ingresar cero y cuenta cuántas son mayores que 100. No cuentes el cero. Usa Mientras y Si.', expected_answer=$r$Algoritmo ContarLecturasSeleccionados
Definir valor, contador Como Entero
contador <- 0
Leer valor
Mientras valor <> 0 Hacer
Si valor > 100 Entonces
contador <- contador + 1
FinSi
Leer valor
FinMientras
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["99","100","101","200","0"],"salida":["2"]},{"entradas":["100","150","0"],"salida":["1"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1830,1918);

UPDATE algoritmos.questions SET prompt='Lee lecturas hasta ingresar cero y cuenta cuántas son mayores que 100. No cuentes el cero. Usa Repetir-Hasta Que y Si.', expected_answer=$r$Algoritmo ContarLecturasSeleccionados
Definir valor, contador Como Entero
contador <- 0
Repetir
Leer valor
Si valor <> 0 Y valor > 100 Entonces
contador <- contador + 1
FinSi
Hasta Que valor = 0
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["99","100","101","200","0"],"salida":["2"]},{"entradas":["100","150","0"],"salida":["1"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1835,1928);

UPDATE algoritmos.questions SET prompt='Lee puntajes hasta ingresar cero y cuenta cuántos alcanzan 11 puntos. No cuentes el cero. Usa Mientras y Si.', expected_answer=$r$Algoritmo ContarPuntajesSeleccionados
Definir valor, contador Como Entero
contador <- 0
Leer valor
Mientras valor <> 0 Hacer
Si valor >= 11 Entonces
contador <- contador + 1
FinSi
Leer valor
FinMientras
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["10","11","14","0"],"salida":["2"]},{"entradas":["11","9","15","0"],"salida":["2"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1866,1967);

UPDATE algoritmos.questions SET prompt='Lee puntajes hasta ingresar cero y cuenta cuántos alcanzan 11 puntos. No cuentes el cero. Usa Repetir-Hasta Que y Si.', expected_answer=$r$Algoritmo ContarPuntajesSeleccionados
Definir valor, contador Como Entero
contador <- 0
Repetir
Leer valor
Si valor <> 0 Y valor >= 11 Entonces
contador <- contador + 1
FinSi
Hasta Que valor = 0
Escribir contador
FinAlgoritmo$r$, evaluation_config='{"casos":[{"entradas":["10","11","14","0"],"salida":["2"]},{"entradas":["11","9","15","0"],"salida":["2"]},{"entradas":["0"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb WHERE question_id IN (1849,1929);
COMMIT;
