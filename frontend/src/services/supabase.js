// ─── CLIENTE DE SUPABASE Y LLAMADAS A LAS FUNCIONES api_* ───
// Dos caminos, igual que antes, pero con el backend en medio:
//   · Sesión (registro, inicio y cierre de sesión): supabase.auth, directo desde el navegador.
//   · Datos (perfil, partidas, ranking, paneles): rpc() → backend Express (POST /api/rpc/:funcion).
//     El backend llama a la función api_* de la base de datos con el token de esta sesión,
//     así que la BD sigue validando rol, sección y permisos.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_BASE = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '')).replace(/\/$/, '');

export const MSG_CONEXION = 'No se pudo conectar. Inténtalo nuevamente';

export const supabaseListo = Boolean(url && key);

export const supabase = supabaseListo
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// Llama a una función api_* a través del backend y devuelve sus datos.
// Si falla, lanza Error con el mensaje en español que devolvió la base de datos.
export async function rpc(nombre, args = {}) {
  if (!supabaseListo) { console.error('Falta configurar Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY)'); throw new Error(MSG_CONEXION); }

  const headers = { 'Content-Type': 'application/json' };
  const { data } = await supabase.auth.getSession();   // renueva el token si venció
  if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${API_BASE}/api/rpc/${nombre}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args ?? {}),
    });
  } catch (e) {
    console.error(`No se pudo conectar con el backend (${API_BASE}). ¿Está encendido? (npm run dev en /backend)`, e);
    throw new Error(MSG_CONEXION);
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    if (!datos?.error) console.error(`Error ${respuesta.status} al llamar a ${nombre}`);
    // El mensaje en español de la base de datos se muestra tal cual; si no hay, uno genérico.
    throw new Error(datos?.error || 'No se pudo completar la acción. Inténtalo nuevamente');
  }
  return datos;
}
