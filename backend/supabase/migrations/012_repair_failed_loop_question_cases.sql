-- Repara ocho preguntas cuyo enunciado, referencia o pruebas no coincidían.

UPDATE algoritmos.questions SET
  expected_answer = $r$
Algoritmo ContarHastaCero
Definir valor, cantidad Como Entero
cantidad <- 0
Repetir
Leer valor
Si valor <> 0 Entonces
cantidad <- cantidad + 1
FinSi
Hasta Que valor = 0
Escribir cantidad
FinAlgoritmo
$r$,
  evaluation_config = '{"casos":[{"entradas":["5","8","3","12","0"],"salida":["4"]},{"entradas":["0"],"salida":["0"]},{"entradas":["-1","4","0"],"salida":["2"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1710 AND label = 'U3-IC-051';

UPDATE algoritmos.questions SET
  prompt = 'Lee cuántos puntajes se evaluarán y luego ingresa cada puntaje. Cuenta cuántos alcanzan 11 puntos usando un ciclo Mientras.',
  expected_answer = $r$
Algoritmo ContarPuntajesAprobatorios
Definir cantidad, valor, aprobados, i Como Entero
Leer cantidad
i <- 1
aprobados <- 0
Mientras i <= cantidad Hacer
Leer valor
Si valor >= 11 Entonces
aprobados <- aprobados + 1
FinSi
i <- i + 1
FinMientras
Escribir aprobados
FinAlgoritmo
$r$,
  evaluation_config = '{"casos":[{"entradas":["4","10","15","8","12"],"salida":["2"]},{"entradas":["3","12","13","9"],"salida":["2"]},{"entradas":["2","5","7"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1723 AND label = 'U3-IC-037';

UPDATE algoritmos.questions SET
  prompt = 'Lee un número n y calcula la suma de los enteros desde 1 hasta n usando un ciclo Mientras.',
  expected_answer = $r$
Algoritmo SumarHastaN
Definir n, i, total Como Entero
Leer n
i <- 1
total <- 0
Mientras i <= n Hacer
total <- total + i
i <- i + 1
FinMientras
Escribir total
FinAlgoritmo
$r$,
  evaluation_config = '{"casos":[{"entradas":["5"],"salida":["15"]},{"entradas":["10"],"salida":["55"]},{"entradas":["1"],"salida":["1"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1726 AND label = 'U3-IC-038';

UPDATE algoritmos.questions SET
  prompt = 'Lee un número n y cuenta cuántos números pares hay desde 1 hasta n usando un ciclo Mientras.',
  expected_answer = $r$
Algoritmo ContarParesHastaN
Definir n, i, cantidad Como Entero
Leer n
i <- 1
cantidad <- 0
Mientras i <= n Hacer
Si i MOD 2 = 0 Entonces
cantidad <- cantidad + 1
FinSi
i <- i + 1
FinMientras
Escribir cantidad
FinAlgoritmo
$r$,
  evaluation_config = '{"casos":[{"entradas":["5"],"salida":["2"]},{"entradas":["4"],"salida":["2"]},{"entradas":["1"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1728 AND label = 'U3-IC-097';

UPDATE algoritmos.questions SET
  prompt = 'Lee un valor inicial, un límite y un incremento. Muestra la progresión sin superar el límite usando Repetir-Hasta Que.',
  expected_answer = $r$
Algoritmo MostrarProgresion
Definir inicio, limite, incremento Como Entero
Leer inicio, limite, incremento
Repetir
Escribir inicio
inicio <- inicio + incremento
Hasta Que inicio > limite
FinAlgoritmo
$r$,
  evaluation_config = '{"casos":[{"entradas":["1","5","2"],"salida":["1","3","5"]},{"entradas":["2","8","3"],"salida":["2","5","8"]},{"entradas":["3","10","4"],"salida":["3","7"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1731 AND label = 'U3-IC-059';

UPDATE algoritmos.questions SET
  prompt = 'Lee un valor inicial, un límite y un incremento. Muestra la progresión sin superar el límite usando un ciclo Mientras.',
  expected_answer = $r$
Algoritmo MostrarProgresionMientras
Definir inicio, limite, incremento Como Entero
Leer inicio, limite, incremento
Mientras inicio <= limite Hacer
Escribir inicio
inicio <- inicio + incremento
FinMientras
FinAlgoritmo
$r$,
  evaluation_config = '{"casos":[{"entradas":["1","5","2"],"salida":["1","3","5"]},{"entradas":["2","8","3"],"salida":["2","5","8"]},{"entradas":["3","10","4"],"salida":["3","7"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","MIENTRAS"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1738 AND label = 'U3-IC-098';

UPDATE algoritmos.questions SET
  prompt = 'Lee un límite n y un divisor d. Suma los múltiplos positivos de d que no superan n usando Repetir-Hasta Que.',
  expected_answer = $r$
Algoritmo SumarMultiplos
Definir n, d, multiplo, total Como Entero
Leer n, d
multiplo <- d
total <- 0
Repetir
Si multiplo <= n Entonces
total <- total + multiplo
multiplo <- multiplo + d
FinSi
Hasta Que multiplo > n
Escribir total
FinAlgoritmo
$r$,
  evaluation_config = '{"casos":[{"entradas":["10","3"],"salida":["18"]},{"entradas":["8","2"],"salida":["20"]},{"entradas":["20","5"],"salida":["50"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1762 AND label = 'U3-IC-048';

UPDATE algoritmos.questions SET
  expected_answer = $r$
Algoritmo ContarDivisionesEntreDos
Definir n, divisiones Como Entero
Leer n
divisiones <- 0
Repetir
Si n > 1 Entonces
n <- Trunc(n / 2)
divisiones <- divisiones + 1
FinSi
Hasta Que n <= 1
Escribir divisiones
FinAlgoritmo
$r$,
  evaluation_config = '{"casos":[{"entradas":["8"],"salida":["3"]},{"entradas":["5"],"salida":["2"]},{"entradas":["1"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1787 AND label = 'U3-IC-046';

UPDATE algoritmos.questions SET
  expected_answer = $r$
Proceso AreaCirculo
Definir radio, area Como Real
Leer radio
area <- PI * radio * radio
Escribir area
FinProceso
$r$,
  evaluation_config = '{"casos":[{"entradas":["1"],"salida":["3.141592653589793"]},{"entradas":["2"],"salida":["12.566370614359172"]},{"entradas":["3"],"salida":["28.274333882308138"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1118 AND label = 'U1-DC-076';

UPDATE algoritmos.questions SET
  expected_answer = $r$
Proceso VolumenCilindro
Definir radio, altura, volumen Como Real
Leer radio, altura
volumen <- PI * radio * radio * altura
Escribir volumen
FinProceso
$r$,
  evaluation_config = '{"casos":[{"entradas":["1","2"],"salida":["6.283185307179586"]},{"entradas":["2","3"],"salida":["37.69911184307752"]},{"entradas":["3","1"],"salida":["28.274333882308138"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1121 AND label = 'U1-DC-079';

UPDATE algoritmos.questions SET
  expected_answer = $r$
Proceso AreaYPerimetroCirculo
Definir radio, area, perimetro Como Real
Leer radio
area <- PI * radio * radio
perimetro <- 2 * PI * radio
Escribir area
Escribir perimetro
FinProceso
$r$,
  evaluation_config = '{"casos":[{"entradas":["1"],"salida":["3.141592653589793","6.283185307179586"]},{"entradas":["2"],"salida":["12.566370614359172","12.566370614359172"]},{"entradas":["3"],"salida":["28.274333882308138","18.84955592153876"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1137 AND label = 'U1-DC-095';

UPDATE algoritmos.questions SET
  expected_answer = $r$
Proceso PromedioYDiferencia
Definir a, b, c, promedio, diferencia Como Real
Leer a, b, c
promedio <- (a + b + c) / 3
diferencia <- Max(a, Max(b, c)) - Min(a, Min(b, c))
Escribir promedio
Escribir diferencia
FinProceso
$r$,
  evaluation_config = '{"casos":[{"entradas":["10","20","30"],"salida":["20","20"]},{"entradas":["5","5","15"],"salida":["8.333333333333333","10"]},{"entradas":["8","12","16"],"salida":["12","8"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1142 AND label = 'U1-DC-100';

UPDATE algoritmos.questions SET
  expected_answer = $r$
Proceso VentaConDescuentoEImpuesto
Definir precio, cantidad, porcentajeDescuento, porcentajeImpuesto Como Real
Definir subtotal, descuento, subtotalDescuento, impuesto, total Como Real
Leer precio, cantidad, porcentajeDescuento, porcentajeImpuesto
subtotal <- precio * cantidad
descuento <- subtotal * porcentajeDescuento / 100
subtotalDescuento <- subtotal - descuento
impuesto <- subtotalDescuento * porcentajeImpuesto / 100
total <- subtotalDescuento + impuesto
Escribir subtotal
Escribir descuento
Escribir subtotalDescuento
Escribir impuesto
Escribir total
FinProceso
$r$,
  evaluation_config = '{"casos":[{"entradas":["100","2","10","18"],"salida":["200","20","180","32.4","212.4"]},{"entradas":["50","4","20","10"],"salida":["200","40","160","16","176"]},{"entradas":["80","3","25","18"],"salida":["240","60","180","32.4","212.4"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1150 AND label = 'U1-DC-125';

UPDATE algoritmos.questions SET
  expected_answer = $r$
Proceso SepararCifras
Definir numero, centenas, decenas, unidades Como Entero
Leer numero
centenas <- numero DIV 100
decenas <- (numero MOD 100) DIV 10
unidades <- numero MOD 10
Escribir centenas
Escribir decenas
Escribir unidades
FinProceso
$r$,
  evaluation_config = '{"casos":[{"entradas":["345"],"salida":["3","4","5"]},{"entradas":["709"],"salida":["7","0","9"]},{"entradas":["120"],"salida":["1","2","0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1174 AND label = 'U1-DC-136';


