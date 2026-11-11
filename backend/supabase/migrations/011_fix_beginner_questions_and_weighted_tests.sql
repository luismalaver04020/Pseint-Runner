-- Corrige casos de prueba incompatibles con las condiciones del enunciado y
-- sustituye un reto de pendiente porcentual por un ejercicio introductorio.

UPDATE algoritmos.questions
SET prompt = 'Lee la cantidad de cuadernos comprados y el precio de cada cuaderno. Calcula y muestra el costo total.',
    expected_answer = $respuesta$
Algoritmo CalcularCostoTotal
Definir cantidad, precio, total Como Real
Leer cantidad
Leer precio
total <- cantidad * precio
Escribir total
FinAlgoritmo
$respuesta$,
    evaluation_config = '{
      "casos": [
        {"entradas": ["4", "3"], "salida": ["12"], "visible": true},
        {"entradas": ["2", "5.5"], "salida": ["11"], "visible": true},
        {"entradas": ["7", "1.5"], "salida": ["10.5"], "visible": false}
      ],
      "estructura": {"requiere": ["DECLARACION", "LECTURA", "ESCRITURA"]},
      "comparacion": {"modo": "numeros", "tolerancia": 0.000001}
    }'::jsonb
WHERE question_id = 1324
  AND label = 'U1-DC-314';

UPDATE algoritmos.questions
SET evaluation_config = '{
      "casos": [
        {"entradas": ["16", "30", "18", "30", "14", "40"], "salida": ["15.8"], "visible": true},
        {"entradas": ["18", "33", "22", "35", "20", "32"], "salida": ["20.04"], "visible": true},
        {"entradas": ["32", "20", "72", "30", "84", "50"], "salida": ["70"], "visible": false}
      ],
      "estructura": {"requiere": ["DECLARACION", "LECTURA", "ESCRITURA"]},
      "comparacion": {"modo": "numeros", "tolerancia": 0.000001}
    }'::jsonb
WHERE question_id = 1355
  AND label = 'U1-DC-338';
