import { rpc } from './supabase';
import { esSinRegistro } from './sesionService';

const registrado = () => !esSinRegistro();

export async function registrarEventoJuego(evento, metadata = {}) {
  if (!registrado()) return false;
  return rpc('api_registrar_evento_juego', { p_evento: evento, p_metadata: metadata });
}

export async function registrarIntentoJuego({
  sessionId, questionId, correcto, opcionId = null, opcionKey = null, respuesta = '', segundos = 0, puntos = 0,
}) {
  if (!registrado() || !sessionId || String(sessionId).startsWith('demo-') || !questionId) return null;
  return rpc('api_registrar_intento_juego', {
    p_session_id: sessionId,
    p_question_id: questionId,
    p_correcto: Boolean(correcto),
    p_option_id: opcionId,
    p_option_key: opcionKey,
    p_respuesta: respuesta,
    p_segundos: segundos,
    p_puntos: puntos,
  });
}

export async function guardarCheckpointJuego({ sessionId, score, lives, lane, speed, distancia, dayTime }) {
  if (!registrado() || !sessionId || String(sessionId).startsWith('demo-')) return null;
  return rpc('api_guardar_checkpoint_juego', {
    p_session_id: sessionId,
    p_payload: { carril: lane, velocidad: speed, distancia, dayTime },
    p_score: Math.max(0, Math.floor(score || 0)),
    p_lives: Math.max(0, Math.floor(lives || 0)),
  });
}

export async function recuperarCheckpointJuego(zoneCode, difficultyCode) {
  if (!registrado()) return null;
  return rpc('api_recuperar_checkpoint', {
    p_zone_code: zoneCode,
    p_difficulty_code: difficultyCode,
  });
}

export async function obtenerCheckpointDisponible() {
  if (!registrado()) return null;
  return rpc('api_checkpoint_disponible');
}

export async function descartarCheckpointJuego(sessionId) {
  if (!registrado() || !sessionId) return false;
  return rpc('api_descartar_checkpoint', { p_session_id: sessionId });
}

export function listarMaterialesTema(topicId) {
  return rpc('api_listar_materiales_tema', { p_topic_id: topicId });
}

export function estadoPrerequisitosTema(topicId) {
  return rpc('api_estado_prerrequisitos_tema', { p_topic_id: topicId });
}

const cacheApoyoTema = new Map();
export function cargarApoyoTema(topicId) {
  if (!topicId) return Promise.resolve({ materiales: [], prerrequisitos: { pendientes: [] } });
  if (!cacheApoyoTema.has(topicId)) {
    cacheApoyoTema.set(topicId, rpc('api_apoyo_tema', { p_topic_id: topicId })
      .catch((error) => { cacheApoyoTema.delete(topicId); throw error; }));
  }
  return cacheApoyoTema.get(topicId);
}

export function listarNivelesJuego(zoneCode, difficultyCode) {
  return rpc('api_listar_niveles_juego', {
    p_zone_code: zoneCode,
    p_difficulty_code: difficultyCode,
  });
}

export function listarPreguntasNivel(levelId) {
  return rpc('api_listar_preguntas_nivel', { p_level_id: levelId });
}

export function listarMotivosSalida() {
  return rpc('api_motivos_salida_juego');
}

export function enviarFeedbackPartida(sessionId, reasonCode, comment = '') {
  return rpc('api_enviar_feedback_partida', {
    p_session_id: sessionId,
    p_reason_code: reasonCode,
    p_comment: comment,
  });
}
