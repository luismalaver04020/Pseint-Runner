// ─── POWER-UPS ───
import { LANES } from './jugador';
const Z_SPAWN_PU = 1600;
const POWERUP_DURATION = 7000; // ms

export function spawnPowerup(state) {
  if (state.distancia < state.nextPowerup) return;
  const gap = state.pwGap || 3500;
  state.nextPowerup = state.distancia + gap + Math.random() * gap;
  state.powerupCount = (state.powerupCount || 0) + 1;
  const tipo = state.powerupCount % 5 === 0 ? 'lento' : 'doble';
  // El objeto de velocidad reducida aparece cada cinco objetos y solo
  // en carriles laterales, para que encontrarlo y recogerlo requiera decisión.
  const lane = tipo === 'lento'
    ? (Math.random() < 0.5 ? LANES[0] : LANES[2])
    : LANES[Math.floor(Math.random() * LANES.length)];
  state.powerups.push({ lane, z: Z_SPAWN_PU, frame0: state.frame, collected: false, tipo });
}

export function updatePowerups(state) {
  state.powerups = state.powerups.filter(pw => {
    pw.z -= state.speed * 3.4;
    if (pw.z < -120) return false;
    if (!pw.collected && pw.z < 55) {
      if (pw.lane === state.jugador.lane) {
        pw.collected = true;
        activatePowerup(state, pw.tipo);
        return false;
      }
    }
    return true;
  });
  if (state.powerupActivo && Date.now() > state.powerupExpira) {
    state.powerupActivo = false;
    if (state.powerupTipo === 'lento') {
      // Recupera solo hacia la velocidad base de la dificultad, nunca hacia
      // la velocidad acelerada que llevaba antes de recoger el objeto.
      state.velocidadObjetivo = Math.max(state.speed, state.speedBase || state.speed);
      state.recuperandoVelocidad = state.speed < state.velocidadObjetivo;
    }
    state.powerupTipo = null;
    state.multiplicador = 1;
  }
}

export function actualizarRecuperacionVelocidad(state) {
  if (!state.recuperandoVelocidad) return;
  state.speed = Math.min(state.velocidadObjetivo, state.speed + 0.012);
  if (state.speed >= state.velocidadObjetivo) {
    state.recuperandoVelocidad = false;
    state.velocidadObjetivo = null;
  }
}

function activatePowerup(state, tipo = 'doble') {
  if (state.powerupTipo === 'lento' && tipo !== 'lento') {
    state.velocidadObjetivo = Math.max(state.speed, state.speedBase || state.speed);
    state.recuperandoVelocidad = state.speed < state.velocidadObjetivo;
  }
  if (tipo === 'lento' && state.powerupTipo !== 'lento') {
    state.speed = Math.max(2.5, state.speed * 0.62);
    state.recuperandoVelocidad = false;
    state.velocidadObjetivo = null;
  }
  state.powerupActivo = true;
  state.powerupTipo = tipo;
  state.multiplicador = tipo === 'doble' ? 2 : 1;
  state.powerupExpira = Date.now() + POWERUP_DURATION;
  if (state.onPowerup) state.onPowerup();
}
