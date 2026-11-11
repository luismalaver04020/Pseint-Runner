// ─── ESTADÍSTICAS DE JUEGO (se envían a Supabase) ───
// Las respuestas se acumulan y se envían juntas cada pocos segundos (y al terminar la partida),
// para no hacer una llamada por cada pregunta.
import { esSinRegistro } from './sesionService';
import { rpc } from './supabase';
import { getPerfil } from './authService';

let pendientes = {};   // { tema: { ok, mal } }
let timer = null;

const hayUsuarioReal = () => !esSinRegistro() && !!getPerfil();

export async function enviarPendientes() {
  clearTimeout(timer); timer = null;
  const items = Object.entries(pendientes).map(([tema, t]) => ({ tema, ok: t.ok, mal: t.mal }));
  pendientes = {};
  if (!items.length) return;
  try { await rpc('api_registrar_respuestas', { p_items: items }); }
  catch { items.forEach((i) => { // reintenta en el siguiente envío
    const t = pendientes[i.tema] || (pendientes[i.tema] = { ok: 0, mal: 0 });
    t.ok += i.ok; t.mal += i.mal;
  }); }
}

// tema = texto de la pregunta (p.t), ej. "📘 U1 · LÓGICA — Conjunción"
export function registrarRespuesta(tema, ok) {
  if (!hayUsuarioReal() || !tema) return;
  const nombre = tema.replace(/^\S+\s/, ''); // quita el emoji inicial
  const t = pendientes[nombre] || (pendientes[nombre] = { ok: 0, mal: 0 });
  if (ok) t.ok += 1; else t.mal += 1;
  if (!timer) timer = setTimeout(enviarPendientes, 4000);
}

// p = { zona, dificultad, puntaje, resultado: 'ganó' | 'perdió' }
export async function registrarPartida(p) {
  if (!hayUsuarioReal()) return;
  await enviarPendientes();
  try {
    await rpc('api_registrar_partida', {
      p_zona: p.zona, p_dificultad: p.dificultad, p_puntaje: Math.max(0, Math.round(p.puntaje || 0)), p_gano: p.resultado === 'ganó',
    });
  } catch { /* sin conexión: la partida no se guarda */ }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') enviarPendientes(); });
}
