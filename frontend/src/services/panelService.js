// ─── SERVICIO DE LOS PANELES (docente y administrador) ───
// Cada función llama a una función api_* de Supabase; los permisos se validan en el servidor.
// El primer parámetro "usuario" se conserva por compatibilidad con las pantallas, pero ya no se usa:
// el servidor sabe quién eres por tu sesión.
import { rpc } from './supabase';
import { ZONAS, ZONAS_ORDEN } from '../game/zonas';

const ZONAS_UNIDAD = ZONAS_ORDEN.slice(0, 3);

// ───────── DOCENTE (el administrador también puede usarlas en cualquier sección) ─────────
export async function listarSecciones() {
  return (await rpc('api_listar_secciones')) || [];
}

export async function crearSeccion(_u, { codigo, periodo, carrera }) {
  return rpc('api_crear_seccion', { p_codigo: codigo, p_periodo: periodo || '', p_carrera: carrera });
}

// Genera un link nuevo y desactiva los anteriores.
export async function crearLink(_u, seccionId) {
  await rpc('api_crear_link', { p_section: seccionId });
}

export async function alternarLink(_u, seccionId, codigoLink) {
  await rpc('api_alternar_link', { p_section: seccionId, p_codigo: codigoLink });
}

export async function listarAlumnos(_u, seccionId) {
  const filas = (await rpc('api_listar_alumnos', { p_section: seccionId })) || [];
  return filas.map((a) => ({
    usuario: a.usuario, correo: a.correo, carrera: a.carrera,
    zona: ZONAS[a.zonaId || ZONAS_ORDEN[0]]?.nombre || a.zonaId || ZONAS[ZONAS_ORDEN[0]]?.nombre,
    unidadesAprobadas: (a.zonasGanadas || []).filter((z) => ZONAS_UNIDAD.includes(z)).length,
    unidadesTotal: ZONAS_UNIDAD.length,
    mejorPuntaje: a.mejorPuntaje, partidas: a.partidas,
    ultimaDificultad: a.ultimaDificultad || '—',
    ultimaVez: a.ultimaVez || null,
    temaDebil: a.temaDebil || '—',
  }));
}

export async function erroresPorTema(_u, seccionId) {
  const filas = (await rpc('api_errores_por_tema', { p_section: seccionId })) || [];
  return filas.map((a) => ({ ...a, tasaError: Math.round((a.mal / Math.max(1, a.ok + a.mal)) * 100) }));
}

export async function detalleAlumno(_u, alumno) {
  return rpc('api_detalle_alumno', { p_username: alumno });
}

// Quita al alumno de la sección y BORRA su juego y su cuenta; si quiere volver, se registra de nuevo.
export async function removerAlumno(_u, alumno) {
  await rpc('api_remover_alumno', { p_username: alumno });
}

// ───────── ADMINISTRADOR ─────────
export async function solicitudesDocente() {
  return (await rpc('api_solicitudes_docente')) || [];
}

export async function resolverSolicitud(_u, docente, aprobar) {
  await rpc('api_resolver_solicitud', { p_username: docente, p_aprobar: aprobar });
}

export async function listarUsuarios(_u, q = '') {
  return (await rpc('api_listar_usuarios', { p_q: q })) || [];
}

export async function cambiarCuenta(_u, objetivo, cuenta) {
  await rpc('api_cambiar_cuenta', { p_username: objetivo, p_cuenta: cuenta });
}

export async function asignarDocente(_u, objetivo, esDocente) {
  await rpc('api_asignar_docente', { p_username: objetivo, p_es_docente: esDocente });
}
