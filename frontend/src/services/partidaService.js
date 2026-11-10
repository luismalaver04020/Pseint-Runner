import { rpc } from './supabase';
import { QUESTIONS } from '../data/preguntas';
import { ZONAS, ZONAS_ORDEN } from '../game/zonas';
import { esDificultadValida, MSG_FALTA_DIFICULTAD } from './validacionesPartida';

// Evita crear dos sesiones iguales si se pide la misma partida mientras la primera sigue en curso
// (doble clic, doble montaje de React, reintentos rápidos).
const enCurso = new Map();
const sesionesDemo = new Map();

function mezclar(preguntas) {
  const copia = [...preguntas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Crea una sesión local para que la demo no dependa de una cuenta de Supabase. */
export function iniciarPartidaDemo(zona) {
  const unidad = ZONAS[zona]?.unidad;
  const unidades = unidad === 'all' ? Object.keys(QUESTIONS) : [unidad];
  const banco = unidades
    .flatMap((id) => QUESTIONS[id] || [])
    .filter((pregunta) => pregunta.tipo !== 'codigo' && Array.isArray(pregunta.ops) && pregunta.ops.length);

  if (!banco.length) throw new Error('No hay preguntas de demo para esta zona.');

  const sessionId = `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sesionesDemo.set(sessionId, { banco, pendientes: mezclar(banco) });
  return sessionId;
}

/** Entrega preguntas locales de opción múltiple y las vuelve a mezclar al agotarse. */
export function obtenerSiguientePreguntaDemo(sessionId) {
  const sesion = sesionesDemo.get(sessionId);
  if (!sesion) throw new Error('La sesión de demo ya no está disponible.');
  if (!sesion.pendientes.length) sesion.pendientes = mezclar(sesion.banco);
  return sesion.pendientes.pop();
}

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
