import { rpc } from './supabase';
import { ZONAS_ORDEN } from '../game/zonas';
import { esDificultadValida, MSG_FALTA_DIFICULTAD } from './validacionesPartida';

// Evita crear dos sesiones iguales si se pide la misma partida mientras la primera sigue en curso
// (doble clic, doble montaje de React, reintentos rápidos).
const enCurso = new Map();

/**
 * Crea una partida en Supabase.
 * El usuario se identifica mediante su sesión autenticada.
 * La dificultad debe ser una de las tres válidas: nunca se asume un valor por defecto.
 */
export async function iniciarPartida(zona, dificultad) {
  if (!esDificultadValida(dificultad)) throw new Error(MSG_FALTA_DIFICULTAD);
  if (!zona || !ZONAS_ORDEN.includes(zona)) throw new Error('Selecciona una zona válida');

  const clave = `${zona}|${dificultad}`;
  if (enCurso.has(clave)) return enCurso.get(clave);

  const promesa = (async () => {
    const sessionId = await rpc('api_iniciar_partida', {
      p_zone_code: zona,
      p_difficulty_code: dificultad,
      p_mode: 'ruta',
    });
    if (!sessionId) throw new Error('No se pudo iniciar la partida. Inténtalo nuevamente');
    return sessionId;
  })().finally(() => enCurso.delete(clave));

  enCurso.set(clave, promesa);
  return promesa;
}

/**
 * Solicita una pregunta nueva para la partida.
 * Supabase evita que se repita dentro de esa partida.
 */
export async function obtenerSiguientePregunta(sessionId) {
  if (!sessionId) {
    throw new Error('No existe un identificador de partida');
  }

  const pregunta = await rpc('api_siguiente_pregunta', {
    p_session_id: sessionId,
  });

  if (!pregunta) {
    throw new Error('Supabase no devolvió una pregunta');
  }

  return pregunta;
}
/**
 * Solicita preguntas mixtas para el recorrido normal.
 * Incluye opción múltiple y pseudocódigo.
 */
export async function obtenerSiguientePreguntaMixta(sessionId) {
  if (!sessionId) {
    throw new Error('No existe un identificador de partida');
  }

  const pregunta = await rpc('api_siguiente_pregunta_v2', {
    p_session_id: sessionId,
    p_question_mode: 'mixto',
  });

  if (!pregunta) {
    throw new Error('Supabase no devolvió una pregunta');
  }

  return pregunta;
}