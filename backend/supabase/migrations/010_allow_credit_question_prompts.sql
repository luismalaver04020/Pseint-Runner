-- Las preguntas por codigo permiten mensajes de entrada antes de la respuesta.
UPDATE algoritmos.questions
SET evaluation_config = jsonb_set(
  jsonb_set(
    evaluation_config,
    '{casos}',
    '[
      {"entradas": ["2501", "651"], "salida": ["Crédito aprobado"], "visible": true},
      {"entradas": ["2500", "650"], "salida": ["Crédito aprobado"], "visible": true},
      {"entradas": ["2499", "651"], "salida": ["Crédito rechazado"], "visible": true},
      {"entradas": ["2501", "649"], "salida": ["Crédito rechazado"], "visible": false}
    ]'::jsonb,
    true
  ),
  '{comparacion,modo}',
  '"subsecuencia"'::jsonb,
  true
)
WHERE question_id = 1396
  AND label = 'U2-IC-386';
