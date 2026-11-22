// ─── OBSTÁCULOS v2: combis peruanas, huecos, roca, llama, etc. ───
import { LANES } from './jugador';
export const Z_SPAWN = 1600;
const Z_COLLIDE = 45;
export const Z_REMOVE = -120;

function base(type, lane, extra, z = Z_SPAWN) {
  return { type, lane, z, checked: false, lanes: [lane], ...extra };
}

function crearObstaculo(estado, type, zonaCfg, laneForzado, z = Z_SPAWN) {
  const lane = laneForzado ?? LANES[Math.floor(Math.random() * 3)];
  switch (type) {
    case 'combi':
      estado.obstacles.push(base('combi', lane, { evade: 'lane', h: 1.05, zonaCfg }, z)); break;
    case 'taxi':
      estado.obstacles.push(base('taxi', lane, { evade: 'lane', h: 0.8 }, z)); break;
    case 'mototaxi':
      estado.obstacles.push(base('mototaxi', lane, { evade: 'jump', h: 0.55 }, z)); break;
    case 'roca':
      estado.obstacles.push(base('roca', lane, { evade: 'lane', h: 0.8 }, z)); break;
    case 'llama':
      estado.obstacles.push(base('llama', lane, { evade: 'lane', h: 0.85 }, z)); break;
    case 'tronco':
      estado.obstacles.push(base('tronco', lane, { evade: 'jump', h: 0.5 }, z)); break;
    case 'ambulante':
      estado.obstacles.push(base('ambulante', lane, { evade: 'lane', h: 0.75 }, z)); break;
    case 'hueco': {
      estado.obstacles.push(base('hueco', lane, { evade: 'jump', h: 0.05, lanes: [lane], esHueco: true }, z)); break;
    }
    case 'bajo':
      // Obstáculo colgante: cruza los 3 carriles a la altura de la cabeza (hay que agacharse).
      estado.obstacles.push({ type: 'bajo', lane: 0, z, checked: false, lanes: [-1, 0, 1], evade: 'duck', h: 1 });
      break;
    case 'cono':
    default:
      estado.obstacles.push(base('cono', lane, { evade: 'jump', h: 0.55 }, z)); break;
  }
}

function elegirCarrilSeguro(anterior) {
  if (anterior == null) return LANES[Math.floor(Math.random() * LANES.length)];
  // A veces conserva la ruta y otras se desplaza un carril; nunca exige cruzar
  // toda la pista de golpe entre dos filas.
  const opciones = LANES.filter(lane => Math.abs(lane - anterior) <= 1);
  return opciones[Math.floor(Math.random() * opciones.length)] ?? anterior;
}

function familiaObstaculo(type) {
  if (['combi', 'taxi', 'mototaxi'].includes(type)) return 'vehiculo';
  if (['cono', 'tronco', 'hueco'].includes(type)) return 'salto';
  return 'bloqueo';
}

function elegirParejaVariada(pool, anteriores) {
  const disponibles = [...new Set(pool.filter(type => type !== 'bajo'))];
  if (!disponibles.length) return ['cono', 'hueco'];
  const sinRepetir = disponibles.filter(type => !anteriores.includes(type));
  const candidatos = sinRepetir.length >= 2 ? sinRepetir : disponibles;
  const primero = candidatos[(Math.random() * candidatos.length) | 0];
  const otrasFamilias = candidatos.filter(type => type !== primero && familiaObstaculo(type) !== familiaObstaculo(primero));
  const otrosTipos = candidatos.filter(type => type !== primero);
  const opcionesSegundo = otrasFamilias.length ? otrasFamilias : otrosTipos;
  const segundo = opcionesSegundo[(Math.random() * opcionesSegundo.length) | 0] ?? primero;
  return [primero, segundo];
}

function elegirCarrilesOcupados(safeLane, cantidad, anterior) {
  if (cantidad >= 2) return LANES.filter(lane => lane !== safeLane);
  const opciones = LANES.filter(lane => lane !== safeLane && lane !== anterior);
  const alternativas = opciones.length ? opciones : LANES.filter(lane => lane !== safeLane);
  return [alternativas[(Math.random() * alternativas.length) | 0]];
}

function crearGrupoObstaculos(estado, pool, zonaCfg, score) {
  const filas = score < 350 ? 2 : 3;
  const patrones = filas === 2
    ? [[1, 2], [2, 1], [1, 1], [2, 2]]
    : [[1, 2, 1], [2, 1, 2], [2, 2, 1], [1, 2, 2], [2, 1, 1]];
  const patron = patrones[(Math.random() * patrones.length) | 0];
  let safeLane = estado.lastSafeLane;
  let tiposAnteriores = [];
  let carrilAnterior = null;
  let z = Z_SPAWN;

  for (let fila = 0; fila < filas; fila++) {
    safeLane = elegirCarrilSeguro(safeLane);
    const cantidad = patron[fila];
    const carrilesOcupados = elegirCarrilesOcupados(safeLane, cantidad, carrilAnterior);
    const tipos = elegirParejaVariada(pool, tiposAnteriores).slice(0, cantidad);

    carrilesOcupados.forEach((lane, index) => {
      const type = tipos[index];
      crearObstaculo(estado, type, zonaCfg, lane, z);
    });
    tiposAnteriores = tipos;
    carrilAnterior = carrilesOcupados[carrilesOcupados.length - 1];
    // El intervalo cambia por fila para evitar una cadencia geométrica repetida.
    z -= 340 + Math.random() * 160;
  }
  estado.lastSafeLane = safeLane;
}

export function spawnObstaculosV2(estado, score, distancia, zonaCfg) {
  if (distancia < estado.distSpawn) return;
  // Mantiene tiempo para reaccionar incluso con la velocidad máxima.
  const gap = Math.max(640, 720 - score * 0.08) + Math.random() * 160;
  estado.distSpawn = distancia + gap;
  const pool = zonaCfg?.obsPool || ['cono', 'combi', 'hueco'];

  // Los grupos mezclan obstáculos de la zona y mantienen una ruta libre por fila.
  const progreso = Math.max(0, Math.min(1, score / 1000));
  const probabilidadGrupo = 0.25 + progreso * 0.4;
  if (Math.random() < probabilidadGrupo) {
    crearGrupoObstaculos(estado, pool, zonaCfg, score);
    return;
  }

  const type = pool[Math.floor(Math.random() * pool.length)];
  crearObstaculo(estado, type, zonaCfg);
}

export function checkColisionV2(o, jugador) {
  if (o.checked || o.z > Z_COLLIDE) return false;
  o.checked = true;
  // Carril VISUAL (no el objetivo): evita esquives que se ven mal (el sprite
  // sigue del otro lado) o golpes injustos que no se ven en pantalla.
  const carrilVisual = Math.round(jugador.laneVisual);
  if (!o.lanes.includes(carrilVisual)) return false;
  if (o.evade === 'jump') return jugador.onGround;
  if (o.evade === 'duck') return !jugador.duck;
  if (o.evade === 'lane') return true;
  return false;
}
