-- El orden indicado por los ejemplos de respuesta era compra y luego pago,
-- pero los casos de prueba estaban enviando pago y luego compra.
BEGIN;

UPDATE algoritmos.questions
SET prompt = 'Lee primero el monto de la compra y luego el monto pagado. Calcula y muestra el vuelto (monto pagado menos monto de la compra).',
    expected_answer = $answer$Algoritmo CalcularVuelto
Definir compra, pago, vuelto Como Real
Leer compra
Leer pago
vuelto <- pago - compra
Escribir vuelto
FinAlgoritmo$answer$,
    evaluation_config = '{"casos":[{"entradas":["30","50"],"salida":["20"]},{"entradas":["75","100"],"salida":["25"]},{"entradas":["20","20"],"salida":["0"],"visible":false}],"estructura":{"requiere":["DECLARACION","LECTURA","ESCRITURA"]},"comparacion":{"modo":"numeros","tolerancia":0.000001}}'::jsonb
WHERE question_id = 1099 AND label = 'U1-DC-057';

COMMIT;
