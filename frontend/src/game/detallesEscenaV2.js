import { isNight } from './diaNoche';
import { curvOff } from './dibujoV2';
import { Z_SPAWN } from './obstaculosV2';

const ROAD_HALF_RATIO = 0.36;
const FOCAL = 190;

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

function blend(day, ground, amount) {
  const a = day.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16));
  const b = ground.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16));
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

// Rocas, matorrales y hierba en los márgenes exteriores. Su base usa la misma
// curva y fuga de la pista, y el ciclo ligado a distancia les da desplazamiento.
export function drawSideLandscapeV2(ctx, W, GND, horizonY, centerX, dayTime, distancia, region) {
  const night = nightMix(dayTime);
  const roadHalf = W * ROAD_HALF_RATIO;
  const greenDay = region === 'selva' ? '#477348' : region === 'costera' ? '#6c8055' : '#667447';
  const greenNight = region === 'selva' ? '#1d4938' : '#354b3a';
  const foliage = shade(greenDay, greenNight, night);
  const grass = shade(region === 'costera' ? '#a79356' : '#928454', '#4c5140', night);
  const rock = shade(region === 'costera' ? '#c0ae8f' : '#8c816d', '#46474a', night);
  const trunk = shade('#76553a', '#44382f', night);

  ctx.save();
  for (const side of [-1, 1]) for (let layer = 0; layer < 2; layer++) {
    const count = layer === 0 ? 18 : 16;
    const spacing = layer === 0 ? 104 : 116;
    const cycle = count * spacing;
    for (let i = 0; i < count; i++) {
      const phase = ((distancia * (layer === 0 ? 0.76 : 0.58) + i * spacing + (side > 0 ? spacing * 0.48 : 0) + layer * 57) % cycle + cycle) % cycle;
      const z = Z_SPAWN - phase;
      if (z < 24 || z > Z_SPAWN) continue;
      const scale = FOCAL / (FOCAL + z);
      const progress = Math.max(0.015, Math.min(1, scale));
      const half = 3 + (roadHalf - 3) * progress;
      // Distribuye los elementos desde el borde de la vereda hasta casi el
      // borde de pantalla, en vez de concentrarlos en una sola franja.
      const edgeLane = Math.max(1.72, Math.min(4.6, W * 0.49 / half));
      const lane = 1.54 + hash(i * 17 + side * 9 + layer * 29) * (edgeLane - 1.54);
      const x = centerX + curvOff(W, distancia, progress) + side * (half * lane + W * 0.018 * progress);
      const y = horizonY + (GND - horizonY) * progress;
      const size = Math.max(1.5, (20 + hash(i * 31 + layer * 41 + side) * 18) * Math.sqrt(scale));
      const kind = Math.floor(hash(i * 43 + layer * 7 + side * 23) * 4);

      // Una sombra pequeña fija visualmente cada objeto al terreno.
      ctx.fillStyle = 'rgba(20,27,23,.2)';
      ctx.beginPath(); ctx.ellipse(x, y + size * 0.12, size * 1.05, Math.max(0.7, size * 0.24), 0, 0, Math.PI * 2); ctx.fill();
      if (kind === 0 && region !== 'costera') {
        // Matorral compacto de varias hojas, más abundante en la selva.
        ctx.fillStyle = foliage;
        ctx.beginPath(); ctx.ellipse(x, y - size * 0.35, size * 0.64, size * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x - size * 0.42, y - size * 0.43, size * 0.43, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + size * 0.42, y - size * 0.48, size * 0.46, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = trunk; ctx.fillRect(x - size * 0.09, y - size * 0.28, Math.max(1, size * 0.18), size * 0.34);
      } else if (kind === 1 || region === 'costera') {
        // Piedra irregular con una cara iluminada para conservar el pixel art.
        ctx.fillStyle = rock;
        ctx.beginPath(); ctx.moveTo(x - size, y); ctx.lineTo(x - size * 0.68, y - size * 0.56); ctx.lineTo(x - size * 0.08, y - size * 0.82); ctx.lineTo(x + size * 0.68, y - size * 0.55); ctx.lineTo(x + size, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = shade(rock, '#d4c6aa', 0.18);
        ctx.beginPath(); ctx.moveTo(x - size * 0.68, y - size * 0.56); ctx.lineTo(x - size * 0.08, y - size * 0.82); ctx.lineTo(x + size * 0.1, y - size * 0.08); ctx.lineTo(x - size * 0.78, y - size * 0.08); ctx.closePath(); ctx.fill();
      } else {
        // Hierbas en abanico, ancladas en un mismo punto y escaladas por distancia.
        ctx.strokeStyle = grass; ctx.lineWidth = Math.max(0.7, scale * 1.5);
        for (let blade = -2; blade <= 2; blade++) {
          ctx.beginPath(); ctx.moveTo(x + blade * size * 0.14, y);
          ctx.quadraticCurveTo(x + blade * size * 0.26, y - size * 0.48, x + blade * size * 0.42, y - size * (0.62 + hash(i * 7 + blade) * 0.35));
          ctx.stroke();
        }
      }
    }
  }
  ctx.restore();
}

// Manzanas exteriores: patios, casas y árboles que ocupan los terrenos vacíos
// más allá de las veredas. Cada lote comparte la proyección y curva del camino.
export function drawOuterNeighborhoodV2(ctx, W, H, GND, horizonY, centerX, dayTime, distancia, region) {
  const night = nightMix(dayTime);
  const palettes = {
    rocosa: { walls: ['#c99d70', '#d7b889', '#b98258'], roofs: ['#754c3b', '#8c5e49', '#6b5544'], lot: ['#8b795f', '#6c7450'], ground: '#c99769', tree: '#607747', window: '#c4d2c4' },
    selva: { walls: ['#b79b65', '#987650', '#c1a875'], roofs: ['#555447', '#70674f', '#4f5a48'], lot: ['#4c6745', '#365b3d'], ground: '#526c38', tree: '#426c43', window: '#c4d7c2' },
    costera: { walls: ['#e1d2b2', '#cdbb98', '#d9c8a9'], roofs: ['#77776f', '#a26a56', '#686c68'], lot: ['#c8b58d', '#89917b'], ground: '#e1c98d', tree: '#58734d', window: '#c8d8d7' },
    ciudad: { walls: ['#b8b9b2', '#9fa6a7', '#c6b9a8'], roofs: ['#626d72', '#77736b', '#535f69'], lot: ['#7c826c', '#696b66'], ground: '#6c6256', tree: '#477353', window: '#bcd1d6' },
  };
  const palette = palettes[region] || palettes.rocosa;
  const wallColors = palette.walls.map((color) => shade(color, '#333b47', night * 0.64));
  const roofColors = palette.roofs.map((color) => shade(color, '#242d39', night * 0.62));
  const ground = shade(palette.ground, '#263b39', night * 0.54);
  const lotColors = palette.lot.map((color) => blend(shade(color, '#35423b', night * 0.48), ground, 0.58));
  const treeColor = shade(palette.tree, '#29483d', night * 0.5);
  const windowLit = shade(palette.window, '#f0c98b', night * 0.7);
  const roadHalf = W * ROAD_HALF_RATIO;
  const point = (progress, factor, seed) => {
    const half = (3 + (roadHalf - 3) * progress) * factor;
    return { x: centerX + curvOff(W, distancia, progress), y: horizonY + (GND - horizonY) * progress, half };
  };
  const blocks = [];
  const count = 10, spacing = 172, cycle = count * spacing;
  for (const side of [-1, 1]) for (let i = 0; i < count; i++) {
    const seed = i * 47 + side * 113;
    const phase = ((distancia * 0.62 + i * spacing + (side > 0 ? 92 : 0)) % cycle + cycle) % cycle;
    const z = Z_SPAWN - phase;
    if (z < 38 || z > Z_SPAWN) continue;
    const scale = FOCAL / (FOCAL + z);
    const progress = Math.max(0.02, Math.min(1, scale));
    const base = point(progress, 1, seed);
    const curve = curvOff(W, distancia, scale);
    const sideSpace = W * (0.14 + hash(seed + 12) * 0.12);
    const lotNear = Math.max(0, (roadHalf * 1.48 + sideSpace * 0.2) * scale - 2 * scale);
    const lotWidth = W * (0.34 + hash(seed + 23) * 0.2) * scale;
    const lotFar = lotNear + lotWidth;
    const centerOffset = lotNear + lotWidth * (0.42 + hash(seed + 6) * 0.12);
    const buildingW = W * (0.14 + hash(seed + 34) * 0.09) * scale;
    const buildingH = H * (0.48 + hash(seed + 51) * 0.2) * scale;
    const lotDepth = Math.min(H * (0.28 + hash(seed + 62) * 0.12) * scale, Math.max(2, (base.y - horizonY) * 0.24));
    blocks.push({ side, seed, z, scale, progress, curve, baseY: base.y, lotNear, lotFar, lotWidth, lotDepth, centerOffset, buildingW, buildingH });
  }

  // Primero lo lejano y luego lo cercano para que las manzanas se solapen bien.
  blocks.sort((a, b) => b.z - a.z);
  ctx.save();
  for (const block of blocks) {
    const { side, seed, scale, curve, baseY, lotNear, lotFar, lotWidth, lotDepth, centerOffset, buildingW, buildingH } = block;
    const lotColor = lotColors[Math.floor(hash(seed + 71) * lotColors.length)];
    const xAt = (offset) => centerX + curve + side * offset;
    const farY = baseY - lotDepth;
    const taper = Math.max(0.84, 1 - scale * 0.12);

    // El patio se funde con el terreno: sin borde de plataforma ni corte duro.
    const plotFill = ctx.createLinearGradient(0, farY, 0, baseY);
    plotFill.addColorStop(0, blend(lotColor, ground, 0.78));
    plotFill.addColorStop(0.58, blend(lotColor, ground, 0.32));
    plotFill.addColorStop(1, blend(lotColor, ground, 0.18));
    ctx.fillStyle = plotFill;
    ctx.beginPath();
    ctx.moveTo(xAt(lotNear), baseY);
    ctx.lineTo(xAt(lotFar), baseY);
    ctx.lineTo(xAt(lotFar * taper), farY);
    ctx.lineTo(xAt(lotNear * 0.96), farY);
    ctx.closePath(); ctx.fill();
    // Camino corto hasta la entrada de cada vivienda.
    const pathW = Math.max(1.5, lotWidth * 0.12);
    const pathX = xAt(centerOffset);
    ctx.fillStyle = shade(region === 'selva' ? '#9d9a78' : '#c5b89f', '#545961', night * 0.5);
    ctx.beginPath();
    ctx.moveTo(pathX - side * pathW * 0.5, baseY - lotDepth * 0.03);
    ctx.lineTo(pathX + side * pathW * 0.5, baseY - lotDepth * 0.03);
    ctx.lineTo(pathX + side * pathW * 0.38, farY + lotDepth * 0.08);
    ctx.lineTo(pathX - side * pathW * 0.38, farY + lotDepth * 0.08);
    ctx.closePath(); ctx.fill();

    // Árbol de patio con sombra anclada a la parcela.
    if (hash(seed + 87) > 0.2) {
      const treeX = xAt(lotNear + lotWidth * (0.24 + hash(seed + 92) * 0.16));
      const treeY = baseY - lotDepth * (0.12 + hash(seed + 95) * 0.22);
      const treeScale = Math.max(0.16, scale * (0.62 + hash(seed + 100) * 0.32));
      const trunkH = (region === 'selva' ? 38 : 31) * treeScale;
      const crown = (region === 'selva' ? 20 : 17) * treeScale;
      ctx.fillStyle = shade('#72543a', '#493d35', night * 0.55);
      ctx.fillRect(treeX - 2.3 * treeScale, treeY - trunkH, 4.6 * treeScale, trunkH);
      ctx.fillStyle = treeColor;
      ctx.beginPath(); ctx.arc(treeX, treeY - trunkH - crown * 0.42, crown, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(treeX - crown * 0.55, treeY - trunkH - crown * 0.1, crown * 0.66, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(treeX + crown * 0.58, treeY - trunkH - crown * 0.12, crown * 0.7, 0, Math.PI * 2); ctx.fill();
    }

    // Matorrales y piedras pequeñas rompen los claros entre fachadas sin crear
    // otra franja de color plana; cada grupo queda apoyado en la parcela.
    for (let tuft = 0; tuft < 3; tuft++) {
      const tuftX = xAt(lotNear + lotWidth * (0.12 + tuft * 0.19 + hash(seed + 121 + tuft) * 0.08));
      const tuftY = farY + lotDepth * (0.56 + hash(seed + 131 + tuft) * 0.3);
      const tuftR = Math.max(1, (4.5 + hash(seed + 141 + tuft) * 4) * scale);
      ctx.fillStyle = 'rgba(23,30,23,.18)';
      ctx.beginPath(); ctx.ellipse(tuftX, tuftY + tuftR * 0.18, tuftR * 1.6, Math.max(0.7, tuftR * 0.38), 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = blend(treeColor, ground, 0.25 + hash(seed + 151 + tuft) * 0.25);
      ctx.beginPath(); ctx.ellipse(tuftX, tuftY - tuftR * 0.18, tuftR, tuftR * 0.62, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(tuftX + tuftR * 0.48, tuftY - tuftR * 0.25, tuftR * 0.56, 0, Math.PI * 2); ctx.fill();
    }

    const buildingX = xAt(centerOffset + side * lotWidth * 0.04) - buildingW / 2;
    // Las fachadas apoyan en el borde delantero del lote y su sombra toca el suelo.
    const buildingY = baseY;
    const frontW = buildingW * 0.84;
    const wall = wallColors[Math.floor(hash(seed + 31) * wallColors.length)];
    const roof = roofColors[Math.floor(hash(seed + 42) * roofColors.length)];
    const floors = buildingH > H * 0.46 ? 3 : 2;

    // Sombra y fachada lateral para dar volumen a las casas exteriores.
    ctx.fillStyle = 'rgba(12,18,20,.22)';
    ctx.beginPath(); ctx.ellipse(xAt(centerOffset), buildingY + 2 * scale, buildingW * 0.68, Math.max(1, 5 * scale), 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(wall, '#26313b', 0.27);
    ctx.beginPath();
    ctx.moveTo(buildingX + frontW, buildingY - buildingH);
    ctx.lineTo(buildingX + buildingW, buildingY - buildingH - buildingH * 0.035);
    ctx.lineTo(buildingX + buildingW, buildingY);
    ctx.lineTo(buildingX + frontW, buildingY);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = wall; ctx.fillRect(buildingX, buildingY - buildingH, frontW, buildingH);
    ctx.fillStyle = shade(wall, '#fff4d8', 0.19); ctx.fillRect(buildingX + frontW * 0.06, buildingY - buildingH, Math.max(1, 3 * scale), buildingH);

    if (region === 'rocosa' || region === 'selva') {
      ctx.fillStyle = roof;
      ctx.beginPath();
      ctx.moveTo(buildingX - buildingW * 0.08, buildingY - buildingH);
      ctx.lineTo(buildingX + frontW * 0.5, buildingY - buildingH - buildingH * (region === 'selva' ? 0.24 : 0.18));
      ctx.lineTo(buildingX + buildingW * 1.08, buildingY - buildingH);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = shade(roof, '#ead5b2', 0.22); ctx.lineWidth = Math.max(0.7, scale);
      ctx.beginPath(); ctx.moveTo(buildingX + frontW * 0.5, buildingY - buildingH - buildingH * 0.14); ctx.lineTo(buildingX + buildingW, buildingY - buildingH); ctx.stroke();
    } else {
      ctx.fillStyle = roof;
      ctx.fillRect(buildingX - buildingW * 0.06, buildingY - buildingH - Math.max(2, 5 * scale), buildingW * 1.12, Math.max(3, 7 * scale));
      if (region === 'ciudad' && scale > 0.3 && hash(seed + 107) > 0.45) {
        ctx.fillStyle = shade(roof, '#242d39', 0.24);
        ctx.fillRect(buildingX + frontW * 0.58, buildingY - buildingH - 17 * scale, frontW * 0.22, 12 * scale);
      }
    }

    const rows = Math.min(floors, Math.max(1, Math.floor(buildingH / 34)));
    const cols = buildingW > 60 ? 3 : 2;
    const winW = Math.max(1.8, frontW * 0.12), winH = Math.max(2.5, buildingH * 0.105);
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const wx = buildingX + frontW * (0.14 + col * (0.72 / Math.max(1, cols - 1))) - winW / 2;
      const wy = buildingY - buildingH * (0.73 - row * 0.24);
      ctx.fillStyle = shade(roof, '#18252e', 0.28);
      ctx.fillRect(wx - scale, wy - scale, winW + 2 * scale, winH + 2 * scale);
      const litWindow = hash(seed + row * 9 + col) > 0.52;
      ctx.fillStyle = litWindow ? blend(windowLit, '#efc77c', night * 0.78) : windowLit;
      ctx.fillRect(wx, wy, winW, winH);
      ctx.fillStyle = shade(wall, '#57616b', 0.36);
      ctx.fillRect(wx + winW * 0.48, wy, Math.max(0.7, scale), winH);
    }

    // Entrada, zócalo y pequeño alero para que la fachada tenga escala humana.
    ctx.fillStyle = shade(roof, '#241d19', 0.35);
    ctx.fillRect(buildingX + frontW * 0.67, buildingY - buildingH * 0.22, frontW * 0.16, buildingH * 0.22);
    ctx.fillStyle = shade(wall, '#544739', 0.38);
    ctx.fillRect(buildingX, buildingY - Math.max(2, 4 * scale), frontW, Math.max(2, 4 * scale));
  }
  ctx.restore();
}
