import { isNight } from './diaNoche';
import { curvOff } from './dibujoV2';

const ROAD_HALF_RATIO = 0.36;

function hash(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function nightMix(dayTime) {
  const t = ((dayTime % 1) + 1) % 1;
  if (t < 0.15) return 1 - Math.max(0, Math.min(1, (t - 0.1) / 0.05));
  if (t < 0.6) return 0;
  return Math.max(0, Math.min(1, (t - 0.6) / 0.08));
}

function shade(day, night, amount) {
  const a = day.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16));
  const b = night.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16));
  const k = Math.max(0, Math.min(1, amount));
  return `#${a.map((channel, i) => Math.round(channel + (b[i] - channel) * k).toString(16).padStart(2, '0')).join('')}`;
}

// Nubes tenues de varias formas para dar escala al cielo sin tapar el horizonte.
export function drawCloudLayersV2(ctx, W, horizonY, dayTime, frame, region) {
  const night = nightMix(dayTime);
  const cloudColor = shade('#fff9ed', '#9eb1c8', night);
  const highlight = shade('#ffffff', '#c1cada', night);
  const alpha = isNight(dayTime) ? 0.2 : region === 'costera' ? 0.62 : 0.48;
  const clouds = [
    { at: 0.12, y: 0.2, w: 0.085, h: 0.038, seed: 2 },
    { at: 0.34, y: 0.34, w: 0.06, h: 0.027, seed: 7 },
    { at: 0.58, y: 0.18, w: 0.11, h: 0.04, seed: 12 },
    { at: 0.82, y: 0.31, w: 0.075, h: 0.03, seed: 19 },
  ];

  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, horizonY * 0.68); ctx.clip();
  ctx.globalAlpha *= alpha;
  for (const cloud of clouds) {
    const width = W * cloud.w;
    const height = Math.max(3, horizonY * cloud.h);
    const x = cloud.at * W + Math.sin(frame * 0.002 + cloud.seed) * W * 0.012;
    const y = horizonY * cloud.y + hash(cloud.seed) * horizonY * 0.035;
    ctx.fillStyle = cloudColor;
    ctx.beginPath();
    ctx.ellipse(x, y + height * 0.3, width * 0.5, height * 0.42, 0, 0, Math.PI * 2);
    ctx.ellipse(x - width * 0.2, y + height * 0.16, width * 0.23, height * 0.46, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.02, y, width * 0.25, height * 0.62, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.25, y + height * 0.2, width * 0.24, height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = highlight;
    ctx.fillRect(x - width * 0.2, y + height * 0.32, width * 0.42, Math.max(1, height * 0.09));
  }
  ctx.restore();
}

// Veredas segmentadas alineadas a la misma curva y fuga de la carretera.
export function drawSidewalksV2(ctx, W, GND, horizonY, centerX, dayTime, distancia, region) {
  const night = nightMix(dayTime);
  const palettes = {
    rocosa: ['#b6a58b', '#786e5e'],
    selva: ['#829078', '#4d5b4d'],
    costera: ['#d0c4aa', '#79766b'],
    ciudad: ['#96969a', '#565b66'],
  };
  const [day, dark] = palettes[region] || palettes.rocosa;
  const base = shade(day, dark, night);
  const joint = shade('#8d877b', '#353c46', night);
  const outerEdge = shade('#746f64', '#303943', night);
  const roadHalf = W * ROAD_HALF_RATIO;
  const steps = 28;
  const point = (progress, factor) => {
    const half = (3 + (roadHalf - 3) * progress) * factor;
    return {
      x: centerX + curvOff(W, distancia, progress),
      y: horizonY + (GND - horizonY) * progress,
      half,
    };
  };

  ctx.save();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = point(i / steps, 1.24);
      const x = p.x + side * p.half;
      if (i === 0) ctx.moveTo(x, p.y); else ctx.lineTo(x, p.y);
    }
    for (let i = steps; i >= 0; i--) {
      const p = point(i / steps, 1.48);
      ctx.lineTo(p.x + side * p.half, p.y);
    }
    ctx.closePath(); ctx.fillStyle = base; ctx.fill();

    // Juntas de losas cortas y en perspectiva evitan una banda lisa y artificial.
    ctx.strokeStyle = joint; ctx.lineWidth = 0.8;
    for (let i = 3; i < steps; i += 3) {
      const progress = i / steps;
      const inner = point(progress, 1.24), outer = point(progress, 1.48);
      ctx.beginPath();
      ctx.moveTo(inner.x + side * inner.half, inner.y);
      ctx.lineTo(outer.x + side * outer.half, outer.y);
      ctx.stroke();
    }
    ctx.strokeStyle = outerEdge; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = point(i / steps, 1.48);
      const x = p.x + side * p.half;
      if (i === 0) ctx.moveTo(x, p.y); else ctx.lineTo(x, p.y);
    }
    ctx.stroke();

    // Rejillas de drenaje puntuales, siempre pegadas a la vereda.
    for (let i = 0; i < 4; i++) {
      const progress = ((i * 0.24 + 0.14 + (distancia * 0.0007) % 0.24) % 0.88) + 0.08;
      const p = point(progress, 1.36);
      const size = Math.max(1, progress * 4.5);
      const x = p.x + side * p.half;
      ctx.fillStyle = outerEdge;
      ctx.fillRect(x - size * 1.3, p.y - size * 0.6, size * 2.6, size * 1.2);
      ctx.fillStyle = joint;
      for (let slit = -1; slit <= 1; slit++) ctx.fillRect(x + slit * size * 0.55, p.y - size * 0.38, Math.max(0.5, size * 0.16), size * 0.76);
    }
  }
  ctx.restore();
}
