-- Corrige dos retos cuya evaluacion no aceptaba soluciones correctas.

-- El alumno puede imprimir mensajes de entrada antes del resultado esperado.
UPDATE algoritmos.questions
SET evaluation_config = jsonb_set(
  evaluation_config,
  '{comparacion,modo}',
  '"subsecuencia"'::jsonb,
  true
)
WHERE question_id = 1607
  AND label = 'U2-HC-242';

-- Este reto tenia por error los casos y la referencia de una pregunta de sumas.
UPDATE algoritmos.questions
SET evaluation_config = '{
  "casos": [
    {"entradas": ["17", "5"], "salida": ["3", "2"], "visible": true},
    {"entradas": ["12", "4"], "salida": ["3", "0"], "visible": true},
    {"entradas": ["7", "10"], "salida": ["0", "7"], "visible": true},
    {"entradas": ["100", "9"], "salida": ["11", "1"], "visible": false}
  ],
  "estructura": {"requiere": ["DECLARACION", "LECTURA", "ESCRITURA", "REPETIR"]},
  "comparacion": {"modo": "numeros", "tolerancia": 0.000001, "ignorar_mayusculas": true}
}'::jsonb,
expected_answer = $respuesta$
Algoritmo DivisionPorRestasSucesivas
Definir dividendo, divisor, cociente, residuo Como Entero
Leer dividendo
Leer divisor
cociente <- 0
residuo <- dividendo
Si residuo >= divisor Entonces
    Repetir
        residuo <- residuo - divisor
        cociente <- cociente + 1
    Hasta Que residuo < divisor
FinSi
Escribir cociente
Escribir residuo
FinAlgoritmo
$respuesta$
WHERE question_id = 1733
  AND label = 'U3-IC-047';
