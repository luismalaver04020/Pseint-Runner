// ─── RANKING SERVICE ───
// El ranking se calcula en la base de datos a partir de las partidas (registrarPartida en statsService).
import { rpc } from './supabase';
import { ZONAS_ORDEN } from '../game/zonas';

// Se mantiene por compatibilidad: la partida ya se guarda con registrarPartida().
export function guardarResultado() {}

export async function getRanking(dificultad) {
  try {
    const filas = await rpc('api_ranking', { p_dificultad: dificultad });
    return (filas || []).map((f) => ({
      // Usa el identificador de cuenta si el RPC lo entrega. La versión básica
      // de api_ranking devuelve el usuario con el alias `nombre`.
      usuario: f.usuario ?? f.username ?? f.nombre_usuario ?? f.user_name ?? f.handle ?? f.nombre ?? 'Usuario',
      puntaje: f.puntaje,
      zonaIdx: ZONAS_ORDEN.indexOf(f.zona) + 1,
      fecha: new Date(f.fecha).toLocaleDateString('es-PE'),
    }));
  } catch {
    return [];
  }
}
