// ─── RANKING SERVICE ───
// El ranking se calcula en la base de datos a partir de las partidas (registrarPartida en statsService).
import { rpc } from './supabase';
import { ZONAS_ORDEN } from '../game/zonas';

export async function getRanking(dificultad, alcance = 'general', seccionId = null) {
  const resultado = await rpc('api_ranking_secciones', {
    p_dificultad: dificultad,
    p_alcance: alcance,
    p_seccion_id: seccionId || null,
  });
  const filas = Array.isArray(resultado?.jugadores) ? resultado.jugadores : [];
  return {
    seccionUsuario: resultado?.seccionUsuario || null,
    secciones: Array.isArray(resultado?.secciones) ? resultado.secciones : [],
    jugadores: filas.map((f) => ({
      usuario: f.usuario ?? f.username ?? 'Usuario',
      puntaje: Number(f.puntaje) || 0,
      zonaIdx: ZONAS_ORDEN.indexOf(f.zona) + 1,
      fecha: f.fecha ? new Date(f.fecha).toLocaleDateString('es-PE') : '—',
      seccion: f.seccion || '',
    })),
  };
}
