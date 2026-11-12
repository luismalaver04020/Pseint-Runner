-- Auditoría de solo lectura del banco completo y su asignación al juego.
-- Ejecutar en Supabase SQL Editor y exportar el primer resultado como CSV.
-- No modifica datos ni consulta información de estudiantes.

WITH opciones AS (
  SELECT
    question_id,
    COUNT(*) AS cantidad_opciones,
    COUNT(*) FILTER (WHERE is_correct) AS cantidad_correctas
  FROM algoritmos.question_options
  GROUP BY question_id
), niveles AS (
  SELECT lq.question_id, COUNT(*) AS cantidad_niveles_activos
  FROM algoritmos.level_questions AS lq
  JOIN algoritmos.game_levels AS gl USING (level_id)
  WHERE gl.active = TRUE
  GROUP BY lq.question_id
)
SELECT
  u.unit_no AS unidad,
  u.title AS nombre_unidad,
  d.code AS dificultad,
  t.title AS tema,
  q.question_id,
  q.label,
  LOWER(q.question_type) AS tipo,
  q.published AS publicada,
  q.prompt AS enunciado,
  q.code_snippet AS fragmento_codigo,
  q.expected_answer AS respuesta_referencia,
  q.evaluation_config AS configuracion_evaluacion,
  q.time_limit_seconds AS tiempo_segundos,
  COALESCE(o.cantidad_opciones, 0) AS cantidad_opciones,
  COALESCE(o.cantidad_correctas, 0) AS cantidad_opciones_correctas,
  COALESCE(n.cantidad_niveles_activos, 0) AS cantidad_niveles_activos,
  CASE
    WHEN NULLIF(BTRIM(q.prompt), '') IS NULL THEN 'ENUNCIADO_VACIO'
    ELSE 'OK'
  END AS estado_enunciado,
  CASE
    WHEN LOWER(q.question_type) NOT IN ('codigo', 'codigo_pseudocodigo') THEN 'NO_APLICA'
    WHEN NULLIF(BTRIM(q.expected_answer), '') IS NULL THEN 'SIN_REFERENCIA'
    WHEN q.expected_answer !~* '^\s*(Algoritmo|Proceso)\b' THEN 'REFERENCIA_NO_EJECUTABLE'
    ELSE 'OK'
  END AS estado_referencia,
  CASE
    WHEN LOWER(q.question_type) NOT IN ('codigo', 'codigo_pseudocodigo') THEN 'NO_APLICA'
    WHEN jsonb_typeof(q.evaluation_config) IS DISTINCT FROM 'object' THEN 'CONFIG_INVALIDA'
    WHEN jsonb_typeof(q.evaluation_config -> 'casos') IS DISTINCT FROM 'array'
      THEN 'SIN_CASOS_EXPLICITOS_USA_FALLBACK'
    WHEN CASE
      WHEN jsonb_typeof(q.evaluation_config -> 'casos') = 'array'
        THEN jsonb_array_length(q.evaluation_config -> 'casos') = 0
      ELSE FALSE
    END THEN 'SIN_CASOS_EXPLICITOS_USA_FALLBACK'
    ELSE 'OK'
  END AS estado_casos,
  CASE
    WHEN LOWER(q.question_type) <> 'opcion_multiple' THEN 'NO_APLICA'
    WHEN COALESCE(o.cantidad_opciones, 0) < 2 THEN 'MENOS_DE_DOS_OPCIONES'
    WHEN COALESCE(o.cantidad_correctas, 0) <> 1 THEN 'NO_TIENE_UNA_CORRECTA'
    ELSE 'OK'
  END AS estado_opciones,
  CASE
    WHEN COALESCE(n.cantidad_niveles_activos, 0) = 0 THEN 'NO_ASIGNADA_A_NIVEL_ACTIVO'
    ELSE 'OK'
  END AS estado_asignacion
FROM algoritmos.questions AS q
JOIN algoritmos.topics AS t USING (topic_id)
JOIN algoritmos.units AS u USING (unit_id)
JOIN algoritmos.difficulties AS d USING (difficulty_id)
LEFT JOIN opciones AS o USING (question_id)
  LEFT JOIN niveles AS n USING (question_id)
ORDER BY unidad, dificultad, tema, q.label, q.question_id;

-- Resumen de los hallazgos. Un código sin casos explícitos puede usar el
-- evaluador de referencia, pero debe revisarse con el auditor de ejecución.
WITH opciones AS (
  SELECT
    question_id,
    COUNT(*) AS cantidad_opciones,
    COUNT(*) FILTER (WHERE is_correct) AS cantidad_correctas
  FROM algoritmos.question_options
  GROUP BY question_id
), niveles AS (
  SELECT lq.question_id, COUNT(*) AS cantidad_niveles_activos
  FROM algoritmos.level_questions AS lq
  JOIN algoritmos.game_levels AS gl USING (level_id)
  WHERE gl.active = TRUE
  GROUP BY lq.question_id
), banco AS (
  SELECT
    d.code AS dificultad,
    LOWER(q.question_type) AS tipo,
    q.published AS publicada,
    CASE WHEN NULLIF(BTRIM(q.prompt), '') IS NULL THEN 'ENUNCIADO_VACIO' ELSE 'OK' END AS estado_enunciado,
    CASE
      WHEN LOWER(q.question_type) NOT IN ('codigo', 'codigo_pseudocodigo') THEN 'NO_APLICA'
      WHEN NULLIF(BTRIM(q.expected_answer), '') IS NULL THEN 'SIN_REFERENCIA'
      WHEN q.expected_answer !~* '^\s*(Algoritmo|Proceso)\b' THEN 'REFERENCIA_NO_EJECUTABLE'
      ELSE 'OK'
    END AS estado_referencia,
    CASE
      WHEN LOWER(q.question_type) NOT IN ('codigo', 'codigo_pseudocodigo') THEN 'NO_APLICA'
      WHEN jsonb_typeof(q.evaluation_config) IS DISTINCT FROM 'object' THEN 'CONFIG_INVALIDA'
      WHEN jsonb_typeof(q.evaluation_config -> 'casos') IS DISTINCT FROM 'array'
        THEN 'SIN_CASOS_EXPLICITOS_USA_FALLBACK'
      WHEN CASE
        WHEN jsonb_typeof(q.evaluation_config -> 'casos') = 'array'
          THEN jsonb_array_length(q.evaluation_config -> 'casos') = 0
        ELSE FALSE
      END THEN 'SIN_CASOS_EXPLICITOS_USA_FALLBACK'
      ELSE 'OK'
    END AS estado_casos,
    CASE
      WHEN LOWER(q.question_type) <> 'opcion_multiple' THEN 'NO_APLICA'
      WHEN COALESCE(o.cantidad_opciones, 0) < 2 THEN 'MENOS_DE_DOS_OPCIONES'
      WHEN COALESCE(o.cantidad_correctas, 0) <> 1 THEN 'NO_TIENE_UNA_CORRECTA'
      ELSE 'OK'
    END AS estado_opciones,
    CASE
      WHEN COALESCE(n.cantidad_niveles_activos, 0) = 0 THEN 'NO_ASIGNADA_A_NIVEL_ACTIVO'
      ELSE 'OK'
    END AS estado_asignacion
  FROM algoritmos.questions AS q
  JOIN algoritmos.difficulties AS d USING (difficulty_id)
  LEFT JOIN opciones AS o USING (question_id)
  LEFT JOIN niveles AS n USING (question_id)
), hallazgos AS (
  SELECT b.dificultad, b.tipo, b.publicada, x.dimension, x.estado
  FROM banco AS b
  CROSS JOIN LATERAL (VALUES
    ('enunciado', b.estado_enunciado),
    ('referencia', b.estado_referencia),
    ('casos', b.estado_casos),
    ('opciones', b.estado_opciones),
    ('asignacion', b.estado_asignacion)
  ) AS x(dimension, estado)
  WHERE x.estado NOT IN ('OK', 'NO_APLICA')
)
SELECT dificultad, tipo, publicada, dimension, estado, COUNT(*) AS cantidad
FROM hallazgos
GROUP BY dificultad, tipo, publicada, dimension, estado
ORDER BY dificultad, tipo, publicada, dimension, estado;
