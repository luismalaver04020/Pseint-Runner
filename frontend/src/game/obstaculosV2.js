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
  // Solo cambia un carril por fila, para que la ruta siga siendo alcanzable.
  const opciones = LANES.filter(lane => lane !== anterior && Math.abs(lane - anterior) === 1);
  return opciones[Math.floor(Math.random() * opciones.length)] ?? anterior;
}

function crearGrupoObstaculos(estado, pool, vehiculos, zonaCfg, score) {
  const filas = score < 350 ? 2 : 3;
  const opciones = pool.filter(type => type !== 'bajo');
  const mezcla = opciones.length ? opciones : vehiculos;
  let safeLane = estado.lastSafeLane;

  for (let fila = 0; fila < filas; fila++) {
    safeLane = elegirCarrilSeguro(safeLane);
    const carrilesOcupados = LANES.filter(lane => lane !== safeLane);
    const z = Z_SPAWN - fila * 380;

    carrilesOcupados.forEach((lane, index) => {
      // La primera fila es tráfico; las siguientes mezclan tráfico y objetos
      // propios de la zona (conos, huecos, troncos, rocas, etc.).
      const tipos = fila === 0 && vehiculos.length ? vehiculos : mezcla;
      const type = tipos[(Math.random() * tipos.length) | 0];
      crearObstaculo(estado, type, zonaCfg, lane, z);
    });
  }
  estado.lastSafeLane = safeLane;
}

export function spawnObstaculosV2(estado, score, distancia, zonaCfg) {
  if (distancia < estado.distSpawn) return;
  // Mantiene tiempo para reaccionar incluso con la velocidad máxima.
  const gap = Math.max(640, 720 - score * 0.08) + Math.random() * 160;
  estado.distSpawn = distancia + gap;
  const pool = zonaCfg?.obsPool || ['cono', 'combi', 'hueco'];

  // Tráfico en formación: dos vehículos en carriles distintos dejan siempre
  // una ruta libre. La ruta segura cambia entre formaciones para exigir decisión.
  const vehiculos = pool.filter(type => type === 'combi' || type === 'taxi');
  const progreso = Math.max(0, Math.min(1, score / 1000));
  const probabilidadGrupo = 0.25 + progreso * 0.4;
  if (Math.random() < probabilidadGrupo) {
    crearGrupoObstaculos(estado, pool, vehiculos, zonaCfg, score);
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
