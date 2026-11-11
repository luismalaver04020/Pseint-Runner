-- El evaluador del backend necesita leer la partida y la pregunta asignada
-- junto con la configuración privada (casos y respuesta de referencia).
-- Mantener este permiso acotado a las tres tablas que consulta fuentePreguntas.js
-- y routes/evaluacion.js; no exponer estas tablas al navegador.
GRANT USAGE ON SCHEMA algoritmos TO service_role;

GRANT SELECT ON TABLE
  algoritmos.game_sessions,
  algoritmos.question_assignments,
  algoritmos.questions
TO service_role;
