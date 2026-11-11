-- Auditoría de solo lectura del banco activo de preguntas de código.
-- Ejecutar en Supabase SQL Editor y exportar el resultado como CSV.
-- Incluye dificultad, unidad, enunciado y configuración para poder revisar
-- cada reto sin modificar datos ni incluir información de jugadores.

SELECT
  u.unit_no AS unidad,
  u.title AS nombre_unidad,
  d.code AS dificultad,
  t.title AS tema,
  q.question_id,
  q.label,
  q.prompt AS enunciado,
  q.code_snippet AS fragmento_codigo,
  q.expected_answer AS respuesta_referencia,
  q.evaluation_config AS configuracion_evaluacion,
  q.time_limit_seconds AS tiempo_segundos
FROM algoritmos.questions AS q
JOIN algoritmos.topics AS t USING (topic_id)
JOIN algoritmos.units AS u USING (unit_id)
JOIN algoritmos.difficulties AS d USING (difficulty_id)
WHERE q.published = TRUE
  AND lower(q.question_type) IN ('codigo', 'codigo_pseudocodigo')
  AND d.code IN ('intermedio', 'dificil')
ORDER BY u.unit_no, d.sort_order, t.sort_order, q.label, q.question_id;
