// Envía el código al backend. Las respuestas de referencia y los casos ocultos nunca llegan al navegador.
import { supabase, supabaseListo, MSG_CONEXION } from './supabase';

const API_BASE = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '')).replace(/\/$/, '');

export async function evaluarCodigoPregunta(preguntaId, sessionId, codigo) {
  if (!supabaseListo) throw new Error(MSG_CONEXION);
  if (preguntaId === undefined || preguntaId === null || preguntaId === '') throw new Error('No se identificó la pregunta.');
  if (!sessionId) throw new Error('No se identificó la partida activa.');
  if (typeof codigo !== 'string' || !codigo.trim()) throw new Error('Escribe tu código antes de enviarlo.');

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');

  let respuesta;
  try {
    respuesta = await fetch(`${API_BASE}/api/evaluar/codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({ pregunta_id: preguntaId, session_id: sessionId, codigo }),
    });
  } catch (e) {
    console.error(`No se pudo conectar con el backend (${API_BASE}).`, e);
    throw new Error(MSG_CONEXION);
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo evaluar tu código. Inténtalo nuevamente.');
  return datos;
}
