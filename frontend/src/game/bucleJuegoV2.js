// ─── BUCLE PRINCIPAL v2 ───
import { crearJugador, actualizarFisica, actualizarLane } from './jugador';
import { updateParticles, burst, renderParticles } from './particulas';
import { renderCRT } from './psxPostProcess';
import { renderHeartsV2 } from './vidas.js';
import { DAY_SPEED } from './diaNoche';
import { spawnObstaculosV2, checkColisionV2, Z_REMOVE } from './obstaculosV2';
import { spawnPowerup, updatePowerups, actualizarRecuperacionVelocidad } from './powerups';
import {
  drawSkyV2, drawTerrainV2, drawRoadV2, drawBuildingsV2, drawRoadsideGreenery, drawFogV2,
  drawFinishV2, drawCelestialV2, renderObstaculosV2, drawPowerupV2,
  renderPlayerV2, curvOff, drawRoadsideSigns, drawStreetLights,
} from './dibujoV2';

const FINISH_DURATION = 90; // 1.5 s a 60 FPS: entrada a la meta.
const MAX_RUN_SPEED = 10.5;

export function crearEstadoV2(W, H, zonaCfg, dificultadCfg, avatar) {
  const GND = H * 0.86, horizonY = H * 0.4, centerX = W / 2;
  return {
    W, H, GND, horizonY, centerX,
    jugador: crearJugador(),
    lives: dificultadCfg.lives,
    score: 0,
    speed: dificultadCfg.speed,
    speedBase: dificultadCfg.speed,
    distancia: 0, metaApproachStarted: false, frame: 0, dayTime: 0.2,
    obstacles: [], distSpawn: 0,
    powerups: [], nextPowerup: dificultadCfg.nextPowerup, pwGap: dificultadCfg.nextPowerup,
    parts: [],
    paused: false, ended: false, questionOpen: false,
    finishing: false, finishFrames: 0,
    multiplicador: 1, powerupActivo: false, powerupTipo: null, powerupExpira: 0,
    velocidadObjetivo: null, recuperandoVelocidad: false,
    dmg: dificultadCfg.dmg || 1,
    zonaCfg, avatar,
    onPowerup: null,
  };
}

export function actualizarJuegoV2(state) {
  const { jugador, zonaCfg } = state;
  state.frame++;
  if (!state.metaApproachStarted) state.dayTime += DAY_SPEED * state.speed;

  if (state.finishing) {
    state.finishFrames++;
    const finishProgress = Math.min(1, state.finishFrames / FINISH_DURATION);
    const ease = finishProgress * finishProgress * (3 - 2 * finishProgress);
    state.speed = state.finishSpeedStart * (1 - ease);
    state.distancia += state.speed;
    actualizarFisica(jugador, state.H);
    jugador.lane = 0; actualizarLane(jugador);
    state.parts = updateParticles(state.parts);
    if (state.finishFrames >= FINISH_DURATION) {
      state.speed = 0;
      return { hit: false, finished: 'win' };
    }
    return { hit: false, finished: null };
  }

  state.distancia += state.speed;
  if (state.frame % 260 === 0 && !state.powerupActivo && !state.recuperandoVelocidad) {
    state.speed = Math.min(state.speed + 0.25, MAX_RUN_SPEED);
  }

  const avancePrueba = state.vistaLlegada ? 6 : 1;
  const pts = 0.022 * (state.speed / 5) * state.multiplicador * avancePrueba;
  state.score += pts;
  if (state.score >= 900) {
    if (!state.metaApproachStarted) {
      state.metaApproachStarted = true;
    }
  }
  if (state.score >= 1000) {
    state.score = 1000; state.finishing = true; state.finishFrames = 0;
    state.finishSpeedStart = state.speed;
    state.obstacles = []; state.powerups = [];
    return { hit: false, finished: null };
  }

  actualizarFisica(jugador, state.H);
  actualizarLane(jugador);
  spawnObstaculosV2(state, state.score, state.distancia, zonaCfg);
  spawnPowerup(state);
  updatePowerups(state);
  actualizarRecuperacionVelocidad(state);

  let hit = false;
  state.obstacles = state.obstacles.filter(o => {
    o.z -= state.speed * 3.4;
    if (o.z < Z_REMOVE) return false;
    if (!hit && checkColisionV2(o, jugador)) hit = true;
    return true;
  });
  state.parts = updateParticles(state.parts);
  return { hit, finished: null };
}

export function renderJuegoV2(ctx, state) {
  const { W, H, GND, horizonY, centerX, dayTime, distancia, frame, obstacles, powerups, parts, jugador, speed, score, finishing, finishFrames, zonaCfg, avatar } = state;
  ctx.clearRect(0, 0, W, H);
  drawSkyV2(ctx, W, horizonY, dayTime, zonaCfg);
  drawTerrainV2(ctx, W, H, horizonY, dayTime, distancia, zonaCfg);
  drawCelestialV2(ctx, W, horizonY, dayTime, frame);
  const fadeEntorno = Math.max(0, Math.min(1, (score - 900) / 50));
  const entornoAlpha = 1 - fadeEntorno * fadeEntorno * (3 - 2 * fadeEntorno);
  ctx.save(); ctx.globalAlpha *= entornoAlpha;
  drawBuildingsV2(ctx, W, GND, horizonY, centerX, dayTime, distancia, zonaCfg);
  drawRoadsideGreenery(ctx, W, GND, horizonY, centerX, dayTime, distancia, zonaCfg);
  ctx.restore();
  // Los faroles conservan su intensidad mientras el resto del entorno se despeja.
  drawStreetLights(ctx, W, GND, horizonY, centerX, distancia, dayTime);
  drawFogV2(ctx, W, H, horizonY, dayTime, zonaCfg);
  drawRoadV2(ctx, W, GND, horizonY, centerX, dayTime, distancia, zonaCfg);
  drawFinishV2(ctx, W, GND, horizonY, centerX, score, zonaCfg);
  ctx.save(); ctx.globalAlpha *= entornoAlpha;
  drawRoadsideSigns(ctx, W, GND, horizonY, centerX, distancia, dayTime);
  ctx.restore();
  renderObstaculosV2(ctx, obstacles, W, GND, horizonY, centerX, frame, distancia, zonaCfg);
  powerups.forEach(pw => drawPowerupV2(ctx, pw, W, GND, horizonY, centerX, frame, distancia));
  renderParticles(ctx, parts);
  const runFrame = finishing ? Math.floor(finishFrames * 0.36) : frame;
  renderPlayerV2(ctx, jugador, W, GND, centerX, runFrame, speed, distancia, avatar, finishing ? finishFrames : 0, horizonY);
  renderCRT(ctx, W, H, frame);
}

export function perderVidaV2(state) {
  if (state.lives <= 0) return;
  state.lives = Math.max(0, state.lives - state.dmg);
  const sc = 190 / (190 + 50);
  const off = state.jugador.laneVisual * state.W * 0.22 + curvOff(state.W, state.distancia, sc);
  const px = state.centerX + off * sc, py = state.GND;
  burst(state.parts, px, py - 40, '#ff4444');
  if (state.lives > 0) state.obstacles = [];
}

export { renderHeartsV2 };
