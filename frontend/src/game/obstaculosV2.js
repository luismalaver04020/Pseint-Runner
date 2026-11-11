// ─── OBSTÁCULOS v2: combis peruanas, huecos, roca, llama, etc. ───
import { LANES } from './jugador';
export const Z_SPAWN = 1600;
const Z_COLLIDE = 45;
export const Z_REMOVE = -120;

function base(type, lane, extra) {
  return { type, lane, z: Z_SPAWN, checked: false, lanes: [lane], ...extra };
}

function crearObstaculo(estado, type, zonaCfg) {
  const lane = LANES[Math.floor(Math.random() * 3)];
  switch (type) {
    case 'combi':
      estado.obstacles.push(base('combi', lane, { evade: 'lane', h: 1.05, zonaCfg })); break;
    case 'taxi':
      estado.obstacles.push(base('taxi', lane, { evade: 'lane', h: 0.8 })); break;
    case 'mototaxi':
      estado.obstacles.push(base('mototaxi', lane, { evade: 'jump', h: 0.55 })); break;
    case 'roca':
      estado.obstacles.push(base('roca', lane, { evade: 'lane', h: 0.8 })); break;
    case 'llama':
      estado.obstacles.push(base('llama', lane, { evade: 'lane', h: 0.85 })); break;
    case 'tronco':
      estado.obstacles.push(base('tronco', lane, { evade: 'jump', h: 0.5 })); break;
    case 'ambulante':
      estado.obstacles.push(base('ambulante', lane, { evade: 'lane', h: 0.75 })); break;
    case 'hueco': {
      const l2 = LANES[Math.floor(Math.random() * 3)];
      estado.obstacles.push(base('hueco', l2, { evade: 'jump', h: 0.05, lanes: [l2], esHueco: true })); break;
    }
    case 'bajo':
      // Obstáculo colgante: cruza los 3 carriles a la altura de la cabeza (hay que agacharse).
      estado.obstacles.push({ type: 'bajo', lane: 0, z: Z_SPAWN, checked: false, lanes: [-1, 0, 1], evade: 'duck', h: 1 });
      break;
    case 'cono':
    default:
      estado.obstacles.push(base('cono', lane, { evade: 'jump', h: 0.55 })); break;
  }
}

export function spawnObstaculosV2(estado, score, distancia, zonaCfg) {
  if (distancia < estado.distSpawn) return;
  const gap = Math.max(300, 720 - score * 0.3) + Math.random() * 240;
  estado.distSpawn = distancia + gap;
  const pool = zonaCfg?.obsPool || ['cono', 'combi', 'hueco'];
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
