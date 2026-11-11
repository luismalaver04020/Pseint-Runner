// Fuente privada de evaluación. Nunca devolver expected_answer al navegador.
import { privado } from '../db.js';
import { HttpError } from '../lib/errores.js';

export async function obtenerEvaluacion(preguntaId) {
  if (!privado) {
    throw new HttpError(501, 'Falta SUPABASE_SERVICE_ROLE_KEY en backend/.env para evaluar preguntas.');
  }

  const { data, error } = await privado
    .from('questions')
    .select('question_id, question_type, published, prompt, evaluation_config, expected_answer')
    .eq('question_id', preguntaId)
    .maybeSingle();

  if (error) {
    console.error('[evaluacion] no se pudo leer la pregunta:', error.message);
    throw new HttpError(502, 'No se pudo leer la pregunta en la base de datos.');
  }
  if (!data || data.published === false) throw new HttpError(404, 'La pregunta no existe o no está publicada.');
  const tiposDeCodigo = new Set(['codigo', 'codigo_pseudocodigo']);
  if (data.question_type && !tiposDeCodigo.has(String(data.question_type).toLowerCase())) {
    throw new HttpError(400, 'Esta pregunta no es un ejercicio de código.');
  }

  return { config: data.evaluation_config, referencia: data.expected_answer ?? null, enunciado: data.prompt ?? '' };
}
