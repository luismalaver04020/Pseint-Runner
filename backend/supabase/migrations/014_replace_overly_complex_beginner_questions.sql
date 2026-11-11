-- Simplifica 153 preguntas fuera de nivel o ambiguas y alinea sus casos de prueba.
-- Conserva los objetivos de estructuras de control por unidad.
BEGIN;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros. El segundo será distinto de cero. Muestra el resultado de dividir el primero entre el segundo.',
    evaluation_config = '{"casos":[{"entradas":["12","3"],"salida":["4"],"visible":true},{"entradas":["20","4"],"salida":["5"],"visible":true},{"entradas":["9","2"],"salida":["4.5"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 351;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de minutos y conviértela a segundos. Usa 60 segundos por minuto.',
    evaluation_config = '{"casos":[{"entradas":["2"],"salida":["120"],"visible":true},{"entradas":["5"],"salida":["300"],"visible":true},{"entradas":["10"],"salida":["600"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 400;

UPDATE algoritmos.questions
SET prompt = 'Lee el largo y el ancho de un rectángulo. Muestra su perímetro: dos veces la suma del largo y el ancho.',
    evaluation_config = '{"casos":[{"entradas":["5","3"],"salida":["16"],"visible":true},{"entradas":["10","4"],"salida":["28"],"visible":true},{"entradas":["7","2"],"salida":["18"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 401;

UPDATE algoritmos.questions
SET prompt = 'Lee el costo de un producto y calcula el total agregando el IGV del 18%.',
    evaluation_config = '{"casos":[{"entradas":["20"],"salida":["23.6"],"visible":true},{"entradas":["75"],"salida":["88.5"],"visible":true},{"entradas":["200"],"salida":["236"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 402;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra su suma.',
    evaluation_config = '{"casos":[{"entradas":["4","7"],"salida":["11"],"visible":true},{"entradas":["12","5"],"salida":["17"],"visible":true},{"entradas":["20","30"],"salida":["50"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ASIGNACION","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1257;

UPDATE algoritmos.questions
SET prompt = 'Una tienda aplica un descuento del 10%. Lee el precio original y muestra cuánto se paga después del descuento.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["90"],"visible":true},{"entradas":["50"],"salida":["45"],"visible":true},{"entradas":["80"],"salida":["72"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ASIGNACION","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1264;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad entera de dinero. Muestra cuántos billetes de 10 se necesitan usando DIV y cuánto sobra usando MOD.',
    evaluation_config = '{"casos":[{"entradas":["37"],"salida":["3","7"],"visible":true},{"entradas":["84"],"salida":["8","4"],"visible":true},{"entradas":["105"],"salida":["10","5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ASIGNACION","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1278;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y el monto de descuento. Muestra el precio final restando el descuento.',
    evaluation_config = '{"casos":[{"entradas":["100","15"],"salida":["85"],"visible":true},{"entradas":["50","5"],"salida":["45"],"visible":true},{"entradas":["80","20"],"salida":["60"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1299;

UPDATE algoritmos.questions
SET prompt = 'Lee el lado de un cuadrado y muestra su perímetro (cuatro veces el lado).',
    evaluation_config = '{"casos":[{"entradas":["2"],"salida":["8"],"visible":true},{"entradas":["5"],"salida":["20"],"visible":true},{"entradas":["9"],"salida":["36"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1300;

UPDATE algoritmos.questions
SET prompt = 'Lee tres notas y muestra su promedio.',
    evaluation_config = '{"casos":[{"entradas":["12","15","18"],"salida":["15"],"visible":true},{"entradas":["10","14","16"],"salida":["13.3333333333333"],"visible":true},{"entradas":["8","12","16"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1301;

UPDATE algoritmos.questions
SET prompt = 'Lee la base y la altura de un rectángulo. Muestra el área, que se obtiene multiplicando base por altura.',
    evaluation_config = '{"casos":[{"entradas":["4","3"],"salida":["12"],"visible":true},{"entradas":["8","5"],"salida":["40"],"visible":true},{"entradas":["10","2"],"salida":["20"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1302;

UPDATE algoritmos.questions
SET prompt = 'Una caja tenía cierta cantidad de unidades. Lee la cantidad inicial y la cantidad vendida; muestra cuántas quedan.',
    evaluation_config = '{"casos":[{"entradas":["30","8"],"salida":["22"],"visible":true},{"entradas":["50","17"],"salida":["33"],"visible":true},{"entradas":["24","6"],"salida":["18"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1305;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y muestra el monto que se ahorra con un descuento del 20%.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["20"],"visible":true},{"entradas":["50"],"salida":["10"],"visible":true},{"entradas":["80"],"salida":["16"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1320;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra la diferencia entre el primero y el segundo.',
    evaluation_config = '{"casos":[{"entradas":["15","6"],"salida":["9"],"visible":true},{"entradas":["20","8"],"salida":["12"],"visible":true},{"entradas":["9","14"],"salida":["-5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1321;

UPDATE algoritmos.questions
SET prompt = 'Lee el costo de una cuenta y calcula el total agregando una propina del 10%.',
    evaluation_config = '{"casos":[{"entradas":["40"],"salida":["44"],"visible":true},{"entradas":["75"],"salida":["82.5"],"visible":true},{"entradas":["120"],"salida":["132"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1322;

UPDATE algoritmos.questions
SET prompt = 'Cada paquete contiene 6 unidades. Lee cuántas unidades hay y muestra cuántos paquetes completos se forman y cuántas unidades sobran, usando DIV y MOD.',
    evaluation_config = '{"casos":[{"entradas":["20"],"salida":["3","2"],"visible":true},{"entradas":["31"],"salida":["5","1"],"visible":true},{"entradas":["48"],"salida":["8","0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1327;

UPDATE algoritmos.questions
SET prompt = 'Lee la cantidad de entradas y el precio de cada entrada. Muestra el total a pagar.',
    evaluation_config = '{"casos":[{"entradas":["2","15"],"salida":["30"],"visible":true},{"entradas":["4","8"],"salida":["32"],"visible":true},{"entradas":["3","12"],"salida":["36"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1329;

UPDATE algoritmos.questions
SET prompt = 'Lee el total de la compra y el monto pagado. Muestra cuánto vuelto corresponde.',
    evaluation_config = '{"casos":[{"entradas":["18","20"],"salida":["2"],"visible":true},{"entradas":["64","100"],"salida":["36"],"visible":true},{"entradas":["45","50"],"salida":["5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1338;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un artículo y cuántas unidades se compran. Muestra el costo total.',
    evaluation_config = '{"casos":[{"entradas":["5","3"],"salida":["15"],"visible":true},{"entradas":["12","4"],"salida":["48"],"visible":true},{"entradas":["7.5","2"],"salida":["15"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1339;

UPDATE algoritmos.questions
SET prompt = 'Lee el lado de un cuadrado y muestra su área (lado por lado).',
    evaluation_config = '{"casos":[{"entradas":["3"],"salida":["9"],"visible":true},{"entradas":["5"],"salida":["25"],"visible":true},{"entradas":["8"],"salida":["64"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1340;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de días y conviértela a horas. Usa 24 horas por día.',
    evaluation_config = '{"casos":[{"entradas":["1"],"salida":["24"],"visible":true},{"entradas":["3"],"salida":["72"],"visible":true},{"entradas":["7"],"salida":["168"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1341;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de una comida y calcula una propina del 10%. Muestra solo el monto de la propina.',
    evaluation_config = '{"casos":[{"entradas":["30"],"salida":["3"],"visible":true},{"entradas":["55"],"salida":["5.5"],"visible":true},{"entradas":["120"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1342;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra el producto.',
    evaluation_config = '{"casos":[{"entradas":["3","5"],"salida":["15"],"visible":true},{"entradas":["7","4"],"salida":["28"],"visible":true},{"entradas":["12","8"],"salida":["96"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1354;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de horas y conviértela a minutos. Usa 60 minutos por hora.',
    evaluation_config = '{"casos":[{"entradas":["1"],"salida":["60"],"visible":true},{"entradas":["2"],"salida":["120"],"visible":true},{"entradas":["5"],"salida":["300"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1358;

UPDATE algoritmos.questions
SET prompt = 'Lee dos notas de un curso y muestra el promedio.',
    evaluation_config = '{"casos":[{"entradas":["14","18"],"salida":["16"],"visible":true},{"entradas":["10","16"],"salida":["13"],"visible":true},{"entradas":["12","12"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1362;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de minutos y conviértela a horas expresadas en minutos por hora (divide entre 60).',
    evaluation_config = '{"casos":[{"entradas":["60"],"salida":["1"],"visible":true},{"entradas":["120"],"salida":["2"],"visible":true},{"entradas":["180"],"salida":["3"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1368;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de dinero entera y muestra cuántos billetes de 20 caben en ella y cuánto dinero queda. Usa DIV y MOD.',
    evaluation_config = '{"casos":[{"entradas":["53"],"salida":["2","13"],"visible":true},{"entradas":["100"],"salida":["5","0"],"visible":true},{"entradas":["127"],"salida":["6","7"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1378;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y muestra el precio final al agregar el IGV del 18%.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["118"],"visible":true},{"entradas":["50"],"salida":["59"],"visible":true},{"entradas":["25"],"salida":["29.5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1384;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de una compra y el dinero entregado. Muestra el vuelto.',
    evaluation_config = '{"casos":[{"entradas":["25","30"],"salida":["5"],"visible":true},{"entradas":["43","50"],"salida":["7"],"visible":true},{"entradas":["68","100"],"salida":["32"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1386;

UPDATE algoritmos.questions
SET prompt = 'Lee tres números enteros y muestra el resultado de sumarlos.',
    evaluation_config = '{"casos":[{"entradas":["2","3","4"],"salida":["9"],"visible":true},{"entradas":["10","20","30"],"salida":["60"],"visible":true},{"entradas":["7","8","9"],"salida":["24"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1387;

UPDATE algoritmos.questions
SET prompt = 'Lee la base y la altura de un rectángulo y muestra su área.',
    evaluation_config = '{"casos":[{"entradas":["6","2"],"salida":["12"],"visible":true},{"entradas":["9","4"],"salida":["36"],"visible":true},{"entradas":["12","5"],"salida":["60"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1389;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros. El segundo será distinto de cero. Muestra el resultado de dividir el primero entre el segundo.',
    evaluation_config = '{"casos":[{"entradas":["12","3"],"salida":["4"],"visible":true},{"entradas":["20","4"],"salida":["5"],"visible":true},{"entradas":["9","2"],"salida":["4.5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1393;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de minutos y conviértela a segundos. Usa 60 segundos por minuto.',
    evaluation_config = '{"casos":[{"entradas":["2"],"salida":["120"],"visible":true},{"entradas":["5"],"salida":["300"],"visible":true},{"entradas":["10"],"salida":["600"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 354;

UPDATE algoritmos.questions
SET prompt = 'Lee el largo y el ancho de un rectángulo. Muestra su perímetro: dos veces la suma del largo y el ancho.',
    evaluation_config = '{"casos":[{"entradas":["5","3"],"salida":["16"],"visible":true},{"entradas":["10","4"],"salida":["28"],"visible":true},{"entradas":["7","2"],"salida":["18"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 403;

UPDATE algoritmos.questions
SET prompt = 'Lee el costo de un producto y calcula el total agregando el IGV del 18%.',
    evaluation_config = '{"casos":[{"entradas":["20"],"salida":["23.6"],"visible":true},{"entradas":["75"],"salida":["88.5"],"visible":true},{"entradas":["200"],"salida":["236"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 432;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra su suma.',
    evaluation_config = '{"casos":[{"entradas":["4","7"],"salida":["11"],"visible":true},{"entradas":["12","5"],"salida":["17"],"visible":true},{"entradas":["20","30"],"salida":["50"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1304;

UPDATE algoritmos.questions
SET prompt = 'Una tienda aplica un descuento del 10%. Lee el precio original y muestra cuánto se paga después del descuento.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["90"],"visible":true},{"entradas":["50"],"salida":["45"],"visible":true},{"entradas":["80"],"salida":["72"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1307;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad entera de dinero. Muestra cuántos billetes de 10 se necesitan usando DIV y cuánto sobra usando MOD.',
    evaluation_config = '{"casos":[{"entradas":["37"],"salida":["3","7"],"visible":true},{"entradas":["84"],"salida":["8","4"],"visible":true},{"entradas":["105"],"salida":["10","5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1308;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y el monto de descuento. Muestra el precio final restando el descuento.',
    evaluation_config = '{"casos":[{"entradas":["100","15"],"salida":["85"],"visible":true},{"entradas":["50","5"],"salida":["45"],"visible":true},{"entradas":["80","20"],"salida":["60"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1314;

UPDATE algoritmos.questions
SET prompt = 'Lee el lado de un cuadrado y muestra su perímetro (cuatro veces el lado).',
    evaluation_config = '{"casos":[{"entradas":["2"],"salida":["8"],"visible":true},{"entradas":["5"],"salida":["20"],"visible":true},{"entradas":["9"],"salida":["36"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1315;

UPDATE algoritmos.questions
SET prompt = 'Lee tres notas y muestra su promedio.',
    evaluation_config = '{"casos":[{"entradas":["12","15","18"],"salida":["15"],"visible":true},{"entradas":["10","14","16"],"salida":["13.3333333333333"],"visible":true},{"entradas":["8","12","16"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1333;

UPDATE algoritmos.questions
SET prompt = 'Lee la base y la altura de un rectángulo. Muestra el área, que se obtiene multiplicando base por altura.',
    evaluation_config = '{"casos":[{"entradas":["4","3"],"salida":["12"],"visible":true},{"entradas":["8","5"],"salida":["40"],"visible":true},{"entradas":["10","2"],"salida":["20"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1352;

UPDATE algoritmos.questions
SET prompt = 'Una caja tenía cierta cantidad de unidades. Lee la cantidad inicial y la cantidad vendida; muestra cuántas quedan.',
    evaluation_config = '{"casos":[{"entradas":["30","8"],"salida":["22"],"visible":true},{"entradas":["50","17"],"salida":["33"],"visible":true},{"entradas":["24","6"],"salida":["18"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1392;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y muestra el monto que se ahorra con un descuento del 20%.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["20"],"visible":true},{"entradas":["50"],"salida":["10"],"visible":true},{"entradas":["80"],"salida":["16"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 372;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra la diferencia entre el primero y el segundo.',
    evaluation_config = '{"casos":[{"entradas":["15","6"],"salida":["9"],"visible":true},{"entradas":["20","8"],"salida":["12"],"visible":true},{"entradas":["9","14"],"salida":["-5"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 392;

UPDATE algoritmos.questions
SET prompt = 'Lee el costo de una cuenta y calcula el total agregando una propina del 10%.',
    evaluation_config = '{"casos":[{"entradas":["40"],"salida":["44"],"visible":true},{"entradas":["75"],"salida":["82.5"],"visible":true},{"entradas":["120"],"salida":["132"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 404;

UPDATE algoritmos.questions
SET prompt = 'Cada paquete contiene 6 unidades. Lee cuántas unidades hay y muestra cuántos paquetes completos se forman y cuántas unidades sobran, usando DIV y MOD.',
    evaluation_config = '{"casos":[{"entradas":["20"],"salida":["3","2"],"visible":true},{"entradas":["31"],"salida":["5","1"],"visible":true},{"entradas":["48"],"salida":["8","0"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 431;

UPDATE algoritmos.questions
SET prompt = 'Lee la cantidad de entradas y el precio de cada entrada. Muestra el total a pagar.',
    evaluation_config = '{"casos":[{"entradas":["2","15"],"salida":["30"],"visible":true},{"entradas":["4","8"],"salida":["32"],"visible":true},{"entradas":["3","12"],"salida":["36"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 436;

UPDATE algoritmos.questions
SET prompt = 'Lee el total de la compra y el monto pagado. Muestra cuánto vuelto corresponde.',
    evaluation_config = '{"casos":[{"entradas":["18","20"],"salida":["2"],"visible":true},{"entradas":["64","100"],"salida":["36"],"visible":true},{"entradas":["45","50"],"salida":["5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1109;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un artículo y cuántas unidades se compran. Muestra el costo total.',
    evaluation_config = '{"casos":[{"entradas":["5","3"],"salida":["15"],"visible":true},{"entradas":["12","4"],"salida":["48"],"visible":true},{"entradas":["7.5","2"],"salida":["15"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1151;

UPDATE algoritmos.questions
SET prompt = 'Lee el lado de un cuadrado y muestra su área (lado por lado).',
    evaluation_config = '{"casos":[{"entradas":["3"],"salida":["9"],"visible":true},{"entradas":["5"],"salida":["25"],"visible":true},{"entradas":["8"],"salida":["64"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ASIGNACION","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1265;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de días y conviértela a horas. Usa 24 horas por día.',
    evaluation_config = '{"casos":[{"entradas":["1"],"salida":["24"],"visible":true},{"entradas":["3"],"salida":["72"],"visible":true},{"entradas":["7"],"salida":["168"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1309;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de una comida y calcula una propina del 10%. Muestra solo el monto de la propina.',
    evaluation_config = '{"casos":[{"entradas":["30"],"salida":["3"],"visible":true},{"entradas":["55"],"salida":["5.5"],"visible":true},{"entradas":["120"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1379;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra el producto.',
    evaluation_config = '{"casos":[{"entradas":["3","5"],"salida":["15"],"visible":true},{"entradas":["7","4"],"salida":["28"],"visible":true},{"entradas":["12","8"],"salida":["96"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 388;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de horas y conviértela a minutos. Usa 60 minutos por hora.',
    evaluation_config = '{"casos":[{"entradas":["1"],"salida":["60"],"visible":true},{"entradas":["2"],"salida":["120"],"visible":true},{"entradas":["5"],"salida":["300"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 390;

UPDATE algoritmos.questions
SET prompt = 'Lee dos notas de un curso y muestra el promedio.',
    evaluation_config = '{"casos":[{"entradas":["14","18"],"salida":["16"],"visible":true},{"entradas":["10","16"],"salida":["13"],"visible":true},{"entradas":["12","12"],"salida":["12"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 438;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de minutos y conviértela a horas expresadas en minutos por hora (divide entre 60).',
    evaluation_config = '{"casos":[{"entradas":["60"],"salida":["1"],"visible":true},{"entradas":["120"],"salida":["2"],"visible":true},{"entradas":["180"],"salida":["3"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 439;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de dinero entera y muestra cuántos billetes de 20 caben en ella y cuánto dinero queda. Usa DIV y MOD.',
    evaluation_config = '{"casos":[{"entradas":["53"],"salida":["2","13"],"visible":true},{"entradas":["100"],"salida":["5","0"],"visible":true},{"entradas":["127"],"salida":["6","7"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 440;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y muestra el precio final al agregar el IGV del 18%.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["118"],"visible":true},{"entradas":["50"],"salida":["59"],"visible":true},{"entradas":["25"],"salida":["29.5"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 442;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de una compra y el dinero entregado. Muestra el vuelto.',
    evaluation_config = '{"casos":[{"entradas":["25","30"],"salida":["5"],"visible":true},{"entradas":["43","50"],"salida":["7"],"visible":true},{"entradas":["68","100"],"salida":["32"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1121;

UPDATE algoritmos.questions
SET prompt = 'Lee tres números enteros y muestra el resultado de sumarlos.',
    evaluation_config = '{"casos":[{"entradas":["2","3","4"],"salida":["9"],"visible":true},{"entradas":["10","20","30"],"salida":["60"],"visible":true},{"entradas":["7","8","9"],"salida":["24"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1128;

UPDATE algoritmos.questions
SET prompt = 'Lee la base y la altura de un rectángulo y muestra su área.',
    evaluation_config = '{"casos":[{"entradas":["6","2"],"salida":["12"],"visible":true},{"entradas":["9","4"],"salida":["36"],"visible":true},{"entradas":["12","5"],"salida":["60"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1153;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros. El segundo será distinto de cero. Muestra el resultado de dividir el primero entre el segundo.',
    evaluation_config = '{"casos":[{"entradas":["12","3"],"salida":["4"],"visible":true},{"entradas":["20","4"],"salida":["5"],"visible":true},{"entradas":["9","2"],"salida":["4.5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1182;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de minutos y conviértela a segundos. Usa 60 segundos por minuto.',
    evaluation_config = '{"casos":[{"entradas":["2"],"salida":["120"],"visible":true},{"entradas":["5"],"salida":["300"],"visible":true},{"entradas":["10"],"salida":["600"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1303;

UPDATE algoritmos.questions
SET prompt = 'Lee el largo y el ancho de un rectángulo. Muestra su perímetro: dos veces la suma del largo y el ancho.',
    evaluation_config = '{"casos":[{"entradas":["5","3"],"salida":["16"],"visible":true},{"entradas":["10","4"],"salida":["28"],"visible":true},{"entradas":["7","2"],"salida":["18"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1325;

UPDATE algoritmos.questions
SET prompt = 'Lee el costo de un producto y calcula el total agregando el IGV del 18%.',
    evaluation_config = '{"casos":[{"entradas":["20"],"salida":["23.6"],"visible":true},{"entradas":["75"],"salida":["88.5"],"visible":true},{"entradas":["200"],"salida":["236"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1330;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra su suma.',
    evaluation_config = '{"casos":[{"entradas":["4","7"],"salida":["11"],"visible":true},{"entradas":["12","5"],"salida":["17"],"visible":true},{"entradas":["20","30"],"salida":["50"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1331;

UPDATE algoritmos.questions
SET prompt = 'Una tienda aplica un descuento del 10%. Lee el precio original y muestra cuánto se paga después del descuento.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["90"],"visible":true},{"entradas":["50"],"salida":["45"],"visible":true},{"entradas":["80"],"salida":["72"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1336;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad entera de dinero. Muestra cuántos billetes de 10 se necesitan usando DIV y cuánto sobra usando MOD.',
    evaluation_config = '{"casos":[{"entradas":["37"],"salida":["3","7"],"visible":true},{"entradas":["84"],"salida":["8","4"],"visible":true},{"entradas":["105"],"salida":["10","5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1351;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y el monto de descuento. Muestra el precio final restando el descuento.',
    evaluation_config = '{"casos":[{"entradas":["100","15"],"salida":["85"],"visible":true},{"entradas":["50","5"],"salida":["45"],"visible":true},{"entradas":["80","20"],"salida":["60"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1359;

UPDATE algoritmos.questions
SET prompt = 'Lee el lado de un cuadrado y muestra su perímetro (cuatro veces el lado).',
    evaluation_config = '{"casos":[{"entradas":["2"],"salida":["8"],"visible":true},{"entradas":["5"],"salida":["20"],"visible":true},{"entradas":["9"],"salida":["36"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1383;

UPDATE algoritmos.questions
SET prompt = 'Lee tres notas y muestra su promedio.',
    evaluation_config = '{"casos":[{"entradas":["12","15","18"],"salida":["15"],"visible":true},{"entradas":["10","14","16"],"salida":["13.3333333333333"],"visible":true},{"entradas":["8","12","16"],"salida":["12"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 367;

UPDATE algoritmos.questions
SET prompt = 'Lee la base y la altura de un rectángulo. Muestra el área, que se obtiene multiplicando base por altura.',
    evaluation_config = '{"casos":[{"entradas":["4","3"],"salida":["12"],"visible":true},{"entradas":["8","5"],"salida":["40"],"visible":true},{"entradas":["10","2"],"salida":["20"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1107;

UPDATE algoritmos.questions
SET prompt = 'Una caja tenía cierta cantidad de unidades. Lee la cantidad inicial y la cantidad vendida; muestra cuántas quedan.',
    evaluation_config = '{"casos":[{"entradas":["30","8"],"salida":["22"],"visible":true},{"entradas":["50","17"],"salida":["33"],"visible":true},{"entradas":["24","6"],"salida":["18"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1356;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y muestra el monto que se ahorra con un descuento del 20%.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["20"],"visible":true},{"entradas":["50"],"salida":["10"],"visible":true},{"entradas":["80"],"salida":["16"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1372;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra la diferencia entre el primero y el segundo.',
    evaluation_config = '{"casos":[{"entradas":["15","6"],"salida":["9"],"visible":true},{"entradas":["20","8"],"salida":["12"],"visible":true},{"entradas":["9","14"],"salida":["-5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1297;

UPDATE algoritmos.questions
SET prompt = 'Lee el costo de una cuenta y calcula el total agregando una propina del 10%.',
    evaluation_config = '{"casos":[{"entradas":["40"],"salida":["44"],"visible":true},{"entradas":["75"],"salida":["82.5"],"visible":true},{"entradas":["120"],"salida":["132"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1316;

UPDATE algoritmos.questions
SET prompt = 'Cada paquete contiene 6 unidades. Lee cuántas unidades hay y muestra cuántos paquetes completos se forman y cuántas unidades sobran, usando DIV y MOD.',
    evaluation_config = '{"casos":[{"entradas":["20"],"salida":["3","2"],"visible":true},{"entradas":["31"],"salida":["5","1"],"visible":true},{"entradas":["48"],"salida":["8","0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1348;

UPDATE algoritmos.questions
SET prompt = 'Usa Repetir para leer números enteros hasta que se ingrese 0. Al final, muestra la suma de los números ingresados antes del 0.',
    evaluation_config = '{"casos":[{"entradas":["1","2","3","0"],"salida":["6"],"visible":true},{"entradas":["5","-2","4","0"],"salida":["7"],"visible":true},{"entradas":["0"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","REPETIR"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1786;

UPDATE algoritmos.questions
SET prompt = 'Lee la cantidad de entradas y el precio de cada entrada. Muestra el total a pagar.',
    evaluation_config = '{"casos":[{"entradas":["2","15"],"salida":["30"],"visible":true},{"entradas":["4","8"],"salida":["32"],"visible":true},{"entradas":["3","12"],"salida":["36"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 352;

UPDATE algoritmos.questions
SET prompt = 'Lee el total de la compra y el monto pagado. Muestra cuánto vuelto corresponde.',
    evaluation_config = '{"casos":[{"entradas":["18","20"],"salida":["2"],"visible":true},{"entradas":["64","100"],"salida":["36"],"visible":true},{"entradas":["45","50"],"salida":["5"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 366;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un artículo y cuántas unidades se compran. Muestra el costo total.',
    evaluation_config = '{"casos":[{"entradas":["5","3"],"salida":["15"],"visible":true},{"entradas":["12","4"],"salida":["48"],"visible":true},{"entradas":["7.5","2"],"salida":["15"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 375;

UPDATE algoritmos.questions
SET prompt = 'Lee el lado de un cuadrado y muestra su área (lado por lado).',
    evaluation_config = '{"casos":[{"entradas":["3"],"salida":["9"],"visible":true},{"entradas":["5"],"salida":["25"],"visible":true},{"entradas":["8"],"salida":["64"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 381;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de días y conviértela a horas. Usa 24 horas por día.',
    evaluation_config = '{"casos":[{"entradas":["1"],"salida":["24"],"visible":true},{"entradas":["3"],"salida":["72"],"visible":true},{"entradas":["7"],"salida":["168"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 399;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de una comida y calcula una propina del 10%. Muestra solo el monto de la propina.',
    evaluation_config = '{"casos":[{"entradas":["30"],"salida":["3"],"visible":true},{"entradas":["55"],"salida":["5.5"],"visible":true},{"entradas":["120"],"salida":["12"],"visible":true}],"estructura":{"requiere":[]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 413;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra el producto.',
    evaluation_config = '{"casos":[{"entradas":["3","5"],"salida":["15"],"visible":true},{"entradas":["7","4"],"salida":["28"],"visible":true},{"entradas":["12","8"],"salida":["96"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1127;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de horas y conviértela a minutos. Usa 60 minutos por hora.',
    evaluation_config = '{"casos":[{"entradas":["1"],"salida":["60"],"visible":true},{"entradas":["2"],"salida":["120"],"visible":true},{"entradas":["5"],"salida":["300"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1192;

UPDATE algoritmos.questions
SET prompt = 'Lee dos notas de un curso y muestra el promedio.',
    evaluation_config = '{"casos":[{"entradas":["14","18"],"salida":["16"],"visible":true},{"entradas":["10","16"],"salida":["13"],"visible":true},{"entradas":["12","12"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ASIGNACION","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1253;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de minutos y conviértela a horas expresadas en minutos por hora (divide entre 60).',
    evaluation_config = '{"casos":[{"entradas":["60"],"salida":["1"],"visible":true},{"entradas":["120"],"salida":["2"],"visible":true},{"entradas":["180"],"salida":["3"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ASIGNACION","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1255;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de dinero entera y muestra cuántos billetes de 20 caben en ella y cuánto dinero queda. Usa DIV y MOD.',
    evaluation_config = '{"casos":[{"entradas":["53"],"salida":["2","13"],"visible":true},{"entradas":["100"],"salida":["5","0"],"visible":true},{"entradas":["127"],"salida":["6","7"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ASIGNACION","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1263;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y muestra el precio final al agregar el IGV del 18%.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["118"],"visible":true},{"entradas":["50"],"salida":["59"],"visible":true},{"entradas":["25"],"salida":["29.5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1298;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de una compra y el dinero entregado. Muestra el vuelto.',
    evaluation_config = '{"casos":[{"entradas":["25","30"],"salida":["5"],"visible":true},{"entradas":["43","50"],"salida":["7"],"visible":true},{"entradas":["68","100"],"salida":["32"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1313;

UPDATE algoritmos.questions
SET prompt = 'Lee tres números enteros y muestra el resultado de sumarlos.',
    evaluation_config = '{"casos":[{"entradas":["2","3","4"],"salida":["9"],"visible":true},{"entradas":["10","20","30"],"salida":["60"],"visible":true},{"entradas":["7","8","9"],"salida":["24"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1317;

UPDATE algoritmos.questions
SET prompt = 'Lee la base y la altura de un rectángulo y muestra su área.',
    evaluation_config = '{"casos":[{"entradas":["6","2"],"salida":["12"],"visible":true},{"entradas":["9","4"],"salida":["36"],"visible":true},{"entradas":["12","5"],"salida":["60"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1319;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros. El segundo será distinto de cero. Muestra el resultado de dividir el primero entre el segundo.',
    evaluation_config = '{"casos":[{"entradas":["12","3"],"salida":["4"],"visible":true},{"entradas":["20","4"],"salida":["5"],"visible":true},{"entradas":["9","2"],"salida":["4.5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1343;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad de minutos y conviértela a segundos. Usa 60 segundos por minuto.',
    evaluation_config = '{"casos":[{"entradas":["2"],"salida":["120"],"visible":true},{"entradas":["5"],"salida":["300"],"visible":true},{"entradas":["10"],"salida":["600"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1346;

UPDATE algoritmos.questions
SET prompt = 'Lee el largo y el ancho de un rectángulo. Muestra su perímetro: dos veces la suma del largo y el ancho.',
    evaluation_config = '{"casos":[{"entradas":["5","3"],"salida":["16"],"visible":true},{"entradas":["10","4"],"salida":["28"],"visible":true},{"entradas":["7","2"],"salida":["18"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1350;

UPDATE algoritmos.questions
SET prompt = 'Lee el costo de un producto y calcula el total agregando el IGV del 18%.',
    evaluation_config = '{"casos":[{"entradas":["20"],"salida":["23.6"],"visible":true},{"entradas":["75"],"salida":["88.5"],"visible":true},{"entradas":["200"],"salida":["236"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1357;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra su suma.',
    evaluation_config = '{"casos":[{"entradas":["4","7"],"salida":["11"],"visible":true},{"entradas":["12","5"],"salida":["17"],"visible":true},{"entradas":["20","30"],"salida":["50"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1361;

UPDATE algoritmos.questions
SET prompt = 'Una tienda aplica un descuento del 10%. Lee el precio original y muestra cuánto se paga después del descuento.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["90"],"visible":true},{"entradas":["50"],"salida":["45"],"visible":true},{"entradas":["80"],"salida":["72"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1367;

UPDATE algoritmos.questions
SET prompt = 'Lee una cantidad entera de dinero. Muestra cuántos billetes de 10 se necesitan usando DIV y cuánto sobra usando MOD.',
    evaluation_config = '{"casos":[{"entradas":["37"],"salida":["3","7"],"visible":true},{"entradas":["84"],"salida":["8","4"],"visible":true},{"entradas":["105"],"salida":["10","5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1370;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y el monto de descuento. Muestra el precio final restando el descuento.',
    evaluation_config = '{"casos":[{"entradas":["100","15"],"salida":["85"],"visible":true},{"entradas":["50","5"],"salida":["45"],"visible":true},{"entradas":["80","20"],"salida":["60"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1374;

UPDATE algoritmos.questions
SET prompt = 'Lee el lado de un cuadrado y muestra su perímetro (cuatro veces el lado).',
    evaluation_config = '{"casos":[{"entradas":["2"],"salida":["8"],"visible":true},{"entradas":["5"],"salida":["20"],"visible":true},{"entradas":["9"],"salida":["36"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1377;

UPDATE algoritmos.questions
SET prompt = 'Lee tres notas y muestra su promedio.',
    evaluation_config = '{"casos":[{"entradas":["12","15","18"],"salida":["15"],"visible":true},{"entradas":["10","14","16"],"salida":["13.3333333333333"],"visible":true},{"entradas":["8","12","16"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1391;

UPDATE algoritmos.questions
SET prompt = 'Lee la base y la altura de un rectángulo. Muestra el área, que se obtiene multiplicando base por altura.',
    evaluation_config = '{"casos":[{"entradas":["4","3"],"salida":["12"],"visible":true},{"entradas":["8","5"],"salida":["40"],"visible":true},{"entradas":["10","2"],"salida":["20"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1295;

UPDATE algoritmos.questions
SET prompt = 'Una caja tenía cierta cantidad de unidades. Lee la cantidad inicial y la cantidad vendida; muestra cuántas quedan.',
    evaluation_config = '{"casos":[{"entradas":["30","8"],"salida":["22"],"visible":true},{"entradas":["50","17"],"salida":["33"],"visible":true},{"entradas":["24","6"],"salida":["18"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1296;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de un producto y muestra el monto que se ahorra con un descuento del 20%.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["20"],"visible":true},{"entradas":["50"],"salida":["10"],"visible":true},{"entradas":["80"],"salida":["16"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1335;

UPDATE algoritmos.questions
SET prompt = 'Lee dos números enteros y muestra la diferencia entre el primero y el segundo.',
    evaluation_config = '{"casos":[{"entradas":["15","6"],"salida":["9"],"visible":true},{"entradas":["20","8"],"salida":["12"],"visible":true},{"entradas":["9","14"],"salida":["-5"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1375;

UPDATE algoritmos.questions
SET prompt = 'Lee una nota entera. Muestra 1 si la nota es 11 o más y 0 si es menor que 11.',
    evaluation_config = '{"casos":[{"entradas":["10"],"salida":["0"],"visible":true},{"entradas":["11"],"salida":["1"],"visible":true},{"entradas":["18"],"salida":["1"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","CONDICIONAL","SINO","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1405;

UPDATE algoritmos.questions
SET prompt = 'Lee un número entero. Muestra 1 si es par y 0 si es impar.',
    evaluation_config = '{"casos":[{"entradas":["4"],"salida":["1"],"visible":true},{"entradas":["7"],"salida":["0"],"visible":true},{"entradas":["0"],"salida":["1"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","CONDICIONAL","SINO","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1438;

UPDATE algoritmos.questions
SET prompt = 'Lee el precio de una compra. Si es 100 o más, aplica un descuento de 10; en caso contrario, no hay descuento. Muestra el monto final.',
    evaluation_config = '{"casos":[{"entradas":["100"],"salida":["90"],"visible":true},{"entradas":["80"],"salida":["80"],"visible":true},{"entradas":["150"],"salida":["140"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","CONDICIONAL","SINO","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1470;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma y muestra solo los números pares. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["6"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["24"],"visible":true},{"entradas":["3","1","5","7"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1938;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son positivos y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["2"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["3"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1946;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N notas. Cuenta cuántas son aprobatorias (11 o más) y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","10","11","15","8"],"salida":["2"],"visible":true},{"entradas":["5","20","9","11","10","18"],"salida":["3"],"visible":true},{"entradas":["3","10","7","0"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1803;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el mayor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["9"],"visible":true},{"entradas":["5","-8","-3","-10","-1","-6"],"salida":["-1"],"visible":true},{"entradas":["3","12","12","4"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1808;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el menor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["-2"],"visible":true},{"entradas":["5","8","3","10","1","6"],"salida":["1"],"visible":true},{"entradas":["3","-4","-4","2"],"salida":["-4"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1810;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son mayores que cero y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["8"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["11"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1817;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son múltiplos de 3 y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","3","4","6","7"],"salida":["2"],"visible":true},{"entradas":["5","1","9","2","12","8"],"salida":["2"],"visible":true},{"entradas":["3","1","2","4"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1818;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son impares y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["10"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["4"],"visible":true},{"entradas":["3","2","4","6"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1826;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma y muestra solo los números pares. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["6"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["24"],"visible":true},{"entradas":["3","1","5","7"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1831;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son positivos y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["2"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["3"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1832;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N notas. Cuenta cuántas son aprobatorias (11 o más) y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","10","11","15","8"],"salida":["2"],"visible":true},{"entradas":["5","20","9","11","10","18"],"salida":["3"],"visible":true},{"entradas":["3","10","7","0"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1839;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el mayor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["9"],"visible":true},{"entradas":["5","-8","-3","-10","-1","-6"],"salida":["-1"],"visible":true},{"entradas":["3","12","12","4"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1843;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el menor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["-2"],"visible":true},{"entradas":["5","8","3","10","1","6"],"salida":["1"],"visible":true},{"entradas":["3","-4","-4","2"],"salida":["-4"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1853;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son mayores que cero y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["8"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["11"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1860;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son múltiplos de 3 y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","3","4","6","7"],"salida":["2"],"visible":true},{"entradas":["5","1","9","2","12","8"],"salida":["2"],"visible":true},{"entradas":["3","1","2","4"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1869;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son impares y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["10"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["4"],"visible":true},{"entradas":["3","2","4","6"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1872;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma y muestra solo los números pares. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["6"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["24"],"visible":true},{"entradas":["3","1","5","7"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1873;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son positivos y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["2"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["3"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1874;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N notas. Cuenta cuántas son aprobatorias (11 o más) y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","10","11","15","8"],"salida":["2"],"visible":true},{"entradas":["5","20","9","11","10","18"],"salida":["3"],"visible":true},{"entradas":["3","10","7","0"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1875;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el mayor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["9"],"visible":true},{"entradas":["5","-8","-3","-10","-1","-6"],"salida":["-1"],"visible":true},{"entradas":["3","12","12","4"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1880;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el menor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["-2"],"visible":true},{"entradas":["5","8","3","10","1","6"],"salida":["1"],"visible":true},{"entradas":["3","-4","-4","2"],"salida":["-4"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1883;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son mayores que cero y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["8"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["11"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1884;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son múltiplos de 3 y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","3","4","6","7"],"salida":["2"],"visible":true},{"entradas":["5","1","9","2","12","8"],"salida":["2"],"visible":true},{"entradas":["3","1","2","4"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1899;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son impares y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["10"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["4"],"visible":true},{"entradas":["3","2","4","6"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1909;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma y muestra solo los números pares. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["6"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["24"],"visible":true},{"entradas":["3","1","5","7"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1916;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son positivos y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["2"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["3"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1922;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N notas. Cuenta cuántas son aprobatorias (11 o más) y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","10","11","15","8"],"salida":["2"],"visible":true},{"entradas":["5","20","9","11","10","18"],"salida":["3"],"visible":true},{"entradas":["3","10","7","0"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1923;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el mayor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["9"],"visible":true},{"entradas":["5","-8","-3","-10","-1","-6"],"salida":["-1"],"visible":true},{"entradas":["3","12","12","4"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1926;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el menor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["-2"],"visible":true},{"entradas":["5","8","3","10","1","6"],"salida":["1"],"visible":true},{"entradas":["3","-4","-4","2"],"salida":["-4"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1927;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son mayores que cero y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["8"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["11"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1939;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son múltiplos de 3 y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","3","4","6","7"],"salida":["2"],"visible":true},{"entradas":["5","1","9","2","12","8"],"salida":["2"],"visible":true},{"entradas":["3","1","2","4"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1941;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son impares y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["10"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["4"],"visible":true},{"entradas":["3","2","4","6"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1947;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma y muestra solo los números pares. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["6"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["24"],"visible":true},{"entradas":["3","1","5","7"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1954;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son positivos y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["2"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["3"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1961;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N notas. Cuenta cuántas son aprobatorias (11 o más) y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","10","11","15","8"],"salida":["2"],"visible":true},{"entradas":["5","20","9","11","10","18"],"salida":["3"],"visible":true},{"entradas":["3","10","7","0"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1963;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el mayor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["9"],"visible":true},{"entradas":["5","-8","-3","-10","-1","-6"],"salida":["-1"],"visible":true},{"entradas":["3","12","12","4"],"salida":["12"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1968;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Muestra el menor. Usa un ciclo Para y una condición Si para actualizarlo.',
    evaluation_config = '{"casos":[{"entradas":["4","3","9","-2","7"],"salida":["-2"],"visible":true},{"entradas":["5","8","3","10","1","6"],"salida":["1"],"visible":true},{"entradas":["3","-4","-4","2"],"salida":["-4"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1970;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son mayores que cero y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["8"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["11"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1974;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son múltiplos de 3 y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","3","4","6","7"],"salida":["2"],"visible":true},{"entradas":["5","1","9","2","12","8"],"salida":["2"],"visible":true},{"entradas":["3","1","2","4"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1979;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma los que son impares y muestra el resultado. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["10"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["4"],"visible":true},{"entradas":["3","2","4","6"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1983;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Suma y muestra solo los números pares. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","2","3","4","7"],"salida":["6"],"visible":true},{"entradas":["5","1","6","8","3","10"],"salida":["24"],"visible":true},{"entradas":["3","1","5","7"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1987;

UPDATE algoritmos.questions
SET prompt = 'Lee N y luego N números enteros. Cuenta cuántos son positivos y muestra la cantidad. Usa un ciclo Para y una condición Si.',
    evaluation_config = '{"casos":[{"entradas":["4","-2","3","0","5"],"salida":["2"],"visible":true},{"entradas":["5","1","-1","2","-4","8"],"salida":["3"],"visible":true},{"entradas":["3","-1","-2","-3"],"salida":["0"],"visible":true}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA","PARA","CONDICIONAL"]},"comparacion":{"modo":"numeros","tolerancia":0.000001,"ignorar_mayusculas":true}}'::jsonb
WHERE question_id = 1994;

COMMIT;
