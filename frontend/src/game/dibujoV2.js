// ─── RENDERIZADO v2: 4 biomas, combis peruanas, powerups, avatar dinámico ───
import { snapPSX } from './psxPostProcess';
import { isNight } from './diaNoche';
import { Z_SPAWN } from './obstaculosV2';
import { drawPersonaje } from './spritePersonaje';

const FOCAL = 190;

function lerp(a, b, t) { return a + (b - a) * t; }
function proy(z) { return FOCAL / (FOCAL + Math.max(0, z)); }
function proyY(GND, hY, sc, w = 0) { return snapPSX(lerp(hY, GND, sc) + Math.sin(w * 0.19) * 0.55); }
function proyX(cx, off, sc, w = 0) { return snapPSX(cx + off * sc + Math.cos(w * 0.17) * 0.45); }
function roadHalf(W) { return W * 0.36; }
export function curvOff(W, dist, sc) {
  return snapPSX(Math.sin(dist * 0.006 + (1 - sc) * 1.7) * W * 0.105 * Math.pow(sc, 0.72));
}
function hash(n) { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }
function smoothstep(a, b, x) { const v = Math.max(0, Math.min(1, (x - a) / (b - a))); return v * v * (3 - 2 * v); }
function nightBlend(t) {
  const n = ((t % 1) + 1) % 1;
  return n < 0.15 ? 1 - smoothstep(0.1, 0.15, n) : n < 0.6 ? 0 : smoothstep(0.6, 0.68, n);
}
function mixColor(a, b, amount) {
  const parse = (color) => /^#[\da-f]{6}$/i.test(color || '') ? [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)) : [80, 100, 120];
  const ca = parse(a), cb = parse(b), p = Math.max(0, Math.min(1, amount));
  return `#${ca.map((v, i) => Math.round(v + (cb[i] - v) * p).toString(16).padStart(2, '0')).join('')}`;
}

// ─── CIELO ───
export function drawSkyV2(ctx, W, horizonY, t, zonaCfg) {
  const night = nightBlend(t);
  const g = ctx.createLinearGradient(0, 0, 0, horizonY);
  g.addColorStop(0, mixColor(zonaCfg?.skyTop || '#1a6eaf', '#03050f', night));
  g.addColorStop(0.55, mixColor(zonaCfg?.skyMid || '#4ab0f0', '#08122e', night));
  g.addColorStop(1, mixColor(zonaCfg?.skyBot || '#87ceeb', '#1a2a4a', night));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, horizonY);

  // Colinas distantes: el corrimiento lento separa el horizonte de la pista.
  const drawRidge = (baseY, amp, period, offset, color) => {
    ctx.beginPath(); ctx.moveTo(0, horizonY);
    for (let x = 0; x <= W + 8; x += 8) {
      const y = baseY - (Math.sin((x + offset) / period) * 0.5 + 0.5) * amp
        - Math.max(0, Math.sin((x + offset * 0.42) / (period * 0.42))) * amp * 0.32;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, horizonY); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  };
  const ridgeNight = Math.min(1, night * 1.3);
  const region = zonaCfg?.id || 'rocosa';
  if (region === 'rocosa') {
    const far = mixColor('#b6b4a6', '#202b3a', ridgeNight);
    const near = mixColor('#858978', '#182331', ridgeNight);
    drawRidge(horizonY + 4, horizonY * 0.24, 82, t * 13, far);
    drawRidge(horizonY + 7, horizonY * 0.16, 57, t * 25, near);
    // Cumbres andinas escalonadas y nevadas en el horizonte.
    for (let i = 0; i < 5; i++) {
      const px = ((i * 79 + 23 + t * 3) % (W + 90)) - 45;
      const baseY = horizonY + 5, peakH = horizonY * (0.19 + hash(i * 3.1) * 0.16), half = 27 + hash(i * 5.7) * 20;
      ctx.fillStyle = mixColor(i % 2 ? '#777d78' : '#92958b', '#303947', ridgeNight);
      ctx.beginPath(); ctx.moveTo(px - half, baseY); ctx.lineTo(px, baseY - peakH); ctx.lineTo(px + half, baseY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = mixColor('#eee9d9', '#919aa0', ridgeNight);
      ctx.beginPath(); ctx.moveTo(px - half * 0.27, baseY - peakH * 0.72); ctx.lineTo(px, baseY - peakH); ctx.lineTo(px + half * 0.22, baseY - peakH * 0.68); ctx.lineTo(px + half * 0.08, baseY - peakH * 0.73); ctx.lineTo(px, baseY - peakH * 0.55); ctx.lineTo(px - half * 0.08, baseY - peakH * 0.74); ctx.closePath(); ctx.fill();
    }
  } else if (region === 'selva') {
    drawRidge(horizonY + 7, horizonY * 0.12, 96, t * 8, mixColor('#52714b', '#172b29', ridgeNight));
    // Copas densas en capas, en lugar de montañas: paisaje de selva baja.
    for (let i = 0; i < 22; i++) {
      const px = i * (W / 20) - (t * 10 % (W / 20));
      const r = 8 + hash(i * 13) * 14;
      ctx.fillStyle = mixColor(i % 2 ? '#386545' : '#547446', '#1a332e', ridgeNight);
      ctx.beginPath(); ctx.arc(px, horizonY + 4, r, Math.PI, Math.PI * 2); ctx.lineTo(px + r, horizonY + 9); ctx.lineTo(px - r, horizonY + 9); ctx.closePath(); ctx.fill();
    }
  } else if (region === 'costera') {
    // Franja del Pacífico, costa árida y lomas bajas.
    ctx.fillStyle = mixColor('#789eaa', '#293944', ridgeNight); ctx.fillRect(0, horizonY * 0.78, W, horizonY * 0.22);
    ctx.fillStyle = mixColor('#d2c09b', '#514b42', ridgeNight);
    ctx.beginPath(); ctx.moveTo(0, horizonY + 5);
    for (let px = 0; px <= W + 8; px += 8) ctx.lineTo(px, horizonY - 1 - Math.sin((px + t * 4) / 39) * horizonY * 0.035);
    ctx.lineTo(W, horizonY + 10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(245,239,222,.34)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, horizonY * 0.9); ctx.lineTo(W, horizonY * 0.9); ctx.stroke();
  } else {
    // Perfil de Lima: edificios de concreto y azoteas, suavizados por la bruma costera.
    drawRidge(horizonY + 8, horizonY * 0.08, 120, t * 5, mixColor('#858b89', '#303742', ridgeNight));
    for (let i = 0; i < 16; i++) {
      const bw = 10 + hash(i * 9.2) * 18, bh = 8 + hash(i * 2.8) * 23;
      const bx = i * (W / 14) - (t * 7 % (W / 14));
      const by = horizonY + 6 - bh;
      ctx.fillStyle = mixColor(i % 2 ? '#858582' : '#a59e91', '#343b44', ridgeNight);
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = mixColor('#c7b896', '#cfab78', night * 0.45);
      ctx.fillRect(bx + bw * 0.18, by + bh * 0.3, Math.max(1, bw * 0.12), Math.max(1, bh * 0.14));
    }
  }
}

// ─── ASTROS ───
export function drawCelestialV2(ctx, W, horizonY, t, frame) {
  const night = nightBlend(t);
  if (night < 1) {
    ctx.globalAlpha = 1 - night;
    ctx.shadowColor = '#ffee88'; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.arc(W * 0.8, horizonY * 0.28, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe866'; ctx.fill(); ctx.shadowBlur = 0;
  }
  if (night > 0) {
    ctx.globalAlpha = night;
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    for (let i = 0; i < 45; i++) {
      const sx = (i * 173 + 31) % W, sy = (i * 97 + 17) % (horizonY * 0.85);
      ctx.globalAlpha = (Math.sin(frame * 0.04 + i) * 0.35 + 0.65) * 0.8 * night;
      ctx.beginPath(); ctx.arc(sx, sy, 1 + (i % 3) * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = night;
    ctx.beginPath(); ctx.arc(W * 0.78, horizonY * 0.28, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#f0e890'; ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── TERRENO ───
export function drawTerrainV2(ctx, W, H, horizonY, t, dist, zonaCfg) {
  const night = nightBlend(t);
  const g = ctx.createLinearGradient(0, horizonY, 0, H);
  g.addColorStop(0, mixColor(zonaCfg?.groundDay || '#5cab61', zonaCfg?.groundNight || '#18385b', night));
  g.addColorStop(1, mixColor('#257248', '#0a1a2a', night));
  ctx.fillStyle = g; ctx.fillRect(0, horizonY, W, H - horizonY);
  const groundHeight = Math.max(1, H - horizonY);
  for (let i = 0; i < 13; i++) {
    const y = horizonY + ((i * 37 + dist * 0.7) % groundHeight);
    ctx.fillStyle = night > 0.5 ? 'rgba(173,190,190,.06)' : 'rgba(248,229,196,.10)';
    ctx.fillRect(0, y, W, Math.max(1, (y - horizonY) * 0.018));
  }

  // Manchas y pequeños detalles de suelo cambian por bioma y viajan con la pista.
  const palettes = {
    rocosa: ['#c99769', '#6b523e', '#d8b887', '#9d7450'],
    selva: ['#526c38', '#9a8b4d', '#36563c', '#b29a54'],
    costera: ['#e1c98d', '#a99870', '#f0dfb3', '#97886d'],
    ciudad: ['#6c6256', '#96836d', '#514d49', '#b19a7a'],
  };
  const colors = palettes[zonaCfg?.id] || palettes.rocosa;
  const count = 56, spacing = 76, cycle = count * spacing;
  for (let i = 0; i < count; i++) {
    const phase = ((dist * 0.72 + i * spacing) % cycle + cycle) % cycle;
    const z = Z_SPAWN - phase;
    if (z < 28 || z > Z_SPAWN) continue;
    const sc = proy(z), v = Math.max(0.02, Math.min(1, sc));
    const gnd = horizonY + (H * 0.86 - horizonY) * v;
    const side = i % 2 ? 1 : -1;
    const lateral = roadHalf(W) * 1.28 + (18 + hash(i * 7.2) * W * 0.22);
    const x = W / 2 + curvOff(W, dist, v) + side * lateral * v;
    const y = gnd - (hash(i * 2.7) * 8 + 2) * v;
    const base = colors[Math.floor(hash(i * 11.3) * colors.length)];
    const color = mixColor(base, zonaCfg?.id === 'costera' ? '#443c32' : '#17211e', night * 0.56);
    const rx = (2.4 + hash(i * 3.3) * 7.4) * v;
    const ry = Math.max(0.7, rx * (0.28 + hash(i * 5.5) * 0.22));
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, hash(i * 9.1) * 0.5, 0, Math.PI * 2); ctx.fill();

    if (zonaCfg?.id === 'selva' || i % 3 === 0) {
      ctx.strokeStyle = mixColor('#6e7548', '#263c35', night * 0.7);
      ctx.lineWidth = Math.max(0.6, v * 1.15);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - rx * 0.35, y - rx * 1.1); ctx.moveTo(x, y); ctx.lineTo(x + rx * 0.7, y - rx * 0.8); ctx.stroke();
    }
    if (zonaCfg?.id === 'costera' && i % 7 === 0) {
      ctx.fillStyle = 'rgba(255,243,214,.48)'; ctx.beginPath(); ctx.arc(x + rx * 0.7, y - ry, Math.max(0.6, v), 0, Math.PI * 2); ctx.fill();
    }
  }
}

// ─── CARRETERA ───
export function drawRoadV2(ctx, W, GND, horizonY, cx, t, dist, zonaCfg) {
  const night = nightBlend(t);
  const rH = roadHalf(W);
  const steps = 24;
  const pt = (tv, wf = 1) => {
    const half = (3 + (rH - 3) * tv) * wf;
    return { x: cx + curvOff(W, dist, tv), y: horizonY + (GND - horizonY) * tv, half };
  };
  const fill = (lf, rf, col) => {
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) { const p = pt(i / steps, lf); if (i === 0) ctx.moveTo(p.x - p.half, p.y); else ctx.lineTo(p.x - p.half, p.y); }
    for (let i = steps; i >= 0; i--) { const p = pt(i / steps, rf); ctx.lineTo(p.x + p.half, p.y); }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  };
  fill(1.24, 1.24, night > 0.5 ? '#463f37' : '#b5a58e');
  // Bordes de seguridad alternados: bandas cortas en perspectiva, sin tocar colisiones.
  const curbColors = night > 0.5 ? ['#65564b', '#332f2d'] : ['#f0e6d7', '#8d4650'];
  const bands = 20, phase = Math.floor(dist / 44);
  for (let i = 0; i < bands; i++) {
    const a = pt(i / bands, 1.22), b = pt((i + 1) / bands, 1.22);
    const ai = pt(i / bands, 1.055), bi = pt((i + 1) / bands, 1.055);
    ctx.fillStyle = curbColors[(i + phase) % 2];
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(a.x + side * a.half, a.y); ctx.lineTo(b.x + side * b.half, b.y);
      ctx.lineTo(bi.x + side * bi.half, bi.y); ctx.lineTo(ai.x + side * ai.half, ai.y); ctx.closePath(); ctx.fill();
    }
  }
  const rg = ctx.createLinearGradient(0, horizonY, 0, GND);
  const rc = zonaCfg?.roadColor || '#4d8295';
  rg.addColorStop(0, mixColor(rc, '#101315', 0.48 + night * 0.22));
  rg.addColorStop(0.36, mixColor(rc, '#f4e9d8', 0.13));
  rg.addColorStop(0.72, mixColor(rc, '#262321', 0.12 + night * 0.12));
  rg.addColorStop(1, mixColor(rc, '#0a0d10', 0.38 + night * 0.2));
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) { const p = pt(i / steps); if (i === 0) ctx.moveTo(p.x - p.half, p.y); else ctx.lineTo(p.x - p.half, p.y); }
  for (let i = steps; i >= 0; i--) { const p = pt(i / steps); ctx.lineTo(p.x + p.half, p.y); }
  ctx.closePath(); ctx.fillStyle = rg; ctx.fill();
  ctx.strokeStyle = night > 0.5 ? 'rgba(244,216,174,.7)' : 'rgba(255,248,233,.88)'; ctx.lineWidth = 2;
  [-1, 1].forEach(side => {
    const phase = Math.floor(dist / 34) % 5;
    for (let i = 2 + phase; i < steps; i += 5) {
      const a = pt(i / steps), b = pt(Math.min(steps, i + 2) / steps);
      ctx.beginPath(); ctx.moveTo(a.x + side * a.half * 0.36, a.y); ctx.lineTo(b.x + side * b.half * 0.36, b.y); ctx.stroke();
    }
  });
  // Grano fino determinista sobre el asfalto para romper la superficie plana.
  for (let i = 0; i < 78; i++) {
    const seed = i * 17.31;
    const v = 0.12 + hash(seed + 4) * 0.86;
    const p = pt(v);
    const lateral = (hash(seed + 9) * 1.72 - 0.86) * p.half;
    const x = p.x + lateral;
    const y = p.y + hash(seed + 2) * Math.max(1, (GND - horizonY) / steps * 0.6);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(245,230,205,.12)' : 'rgba(17,22,26,.12)';
    ctx.fillRect(x, y, Math.max(0.6, v * 1.15), Math.max(0.6, v * 0.8));
  }
}

// ─── EDIFICIOS FONDO ───
export function drawBuildingsV2(ctx, W, GND, horizonY, cx, t, dist, zonaCfg) {
  const night = isNight(t);
  const rH = roadHalf(W);
  const region = zonaCfg?.id || 'rocosa';
  const palettes = {
    rocosa: { day: ['#c58f5d', '#d6b183', '#ad784f', '#ddc59b'], night: ['#58473c', '#655448', '#504940'], roofs: ['#824b3e', '#94634b', '#6c5141'] },
    selva: { day: ['#a78b57', '#b49c67', '#735a43', '#c2a875'], night: ['#394b3d', '#4a5140', '#54483e'], roofs: ['#4f5147', '#646052', '#725b45'] },
    costera: { day: ['#e6d8bb', '#d8c9aa', '#c8b99f', '#eedfbd'], night: ['#545760', '#625b58', '#4f565a'], roofs: ['#8d8a7d', '#a46654', '#686c6b'] },
    ciudad: { day: ['#b8b4a9', '#aaa9a3', '#c5b9a6', '#9d9e99'], night: ['#49505a', '#55555a', '#474d51'], roofs: ['#716d65', '#665c53', '#77716a'] },
  };
  const palette = palettes[region] || palettes.rocosa;
  const facades = night ? palette.night : palette.day;
  const roofs = palette.roofs;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 8; i >= 0; i--) {
      const z = Z_SPAWN - ((dist + i * 240) % (9 * 240));
      if (z <= 0 || z > Z_SPAWN) continue;
      const idx = Math.floor((dist + i * 240) / (9 * 240)) + i * 31 + (side === 1 ? 500 : 0);
      const sc = proy(z), y = proyY(GND, horizonY, sc, idx);
      const hgt = (80 + hash(idx * 7.31) * 150) * sc;
      const wid = (82 + hash(idx * 3.71) * 74) * sc;
      const lateral = rH + 30 + hash(idx * 5.13) * 140;
      const x = proyX(cx, side * lateral, sc, idx) - wid / 2;
      const facade = facades[Math.floor(hash(idx * 4.91) * facades.length)];
      const roof = roofs[Math.floor(hash(idx * 8.41) * roofs.length)];
      const frontW = wid * 0.86;
      ctx.fillStyle = 'rgba(20,24,26,.18)';
      ctx.beginPath(); ctx.ellipse(x + wid * 0.55, y, wid * 0.62, Math.max(1, 5 * sc), 0, 0, Math.PI * 2); ctx.fill();
      // Fachada en dos planos, con alero y variación entre techo plano y tejado.
      ctx.fillStyle = mixColor(facade, '#171719', 0.22);
      ctx.beginPath(); ctx.moveTo(x + frontW, y - hgt); ctx.lineTo(x + wid, y - hgt - hgt * 0.04);
      ctx.lineTo(x + wid, y - hgt * 0.03); ctx.lineTo(x + frontW, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = facade; ctx.fillRect(x, y - hgt, frontW, hgt);
      ctx.fillStyle = mixColor(facade, '#fff4dd', 0.2); ctx.fillRect(x + frontW * 0.05, y - hgt, Math.max(1, 3 * sc), hgt * 0.94);
      ctx.fillStyle = roof;
      if (region === 'selva') {
        // Techos altos de calamina y aleros amplios para casas tropicales.
        ctx.beginPath(); ctx.moveTo(x - wid * 0.16, y - hgt); ctx.lineTo(x + frontW * 0.5, y - hgt - hgt * 0.3); ctx.lineTo(x + wid * 1.16, y - hgt); ctx.lineTo(x + frontW * 0.92, y - hgt + hgt * 0.025); ctx.lineTo(x + frontW * 0.5, y - hgt - hgt * 0.19); ctx.lineTo(x + frontW * 0.08, y - hgt + hgt * 0.025); ctx.closePath(); ctx.fill();
        ctx.fillStyle = mixColor(roof, '#d3c6a8', 0.24); ctx.fillRect(x + frontW * 0.03, y - hgt + 3 * sc, frontW * 0.94, Math.max(1, 2 * sc));
      } else if (region === 'costera' || region === 'ciudad' || idx % 3 === 0) {
        ctx.fillRect(x - wid * 0.035, y - hgt - hgt * 0.055, wid * 1.08, Math.max(2, hgt * 0.07));
        ctx.fillRect(x + wid * 0.08, y - hgt - hgt * 0.15, wid * 0.72, hgt * 0.1);
      } else {
        ctx.beginPath(); ctx.moveTo(x - wid * 0.06, y - hgt); ctx.lineTo(x + frontW * 0.48, y - hgt - hgt * 0.2); ctx.lineTo(x + wid * 1.03, y - hgt); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = mixColor(roof, '#f2d9bb', 0.28); ctx.lineWidth = Math.max(0.8, 1.6 * sc);
        ctx.beginPath(); ctx.moveTo(x + frontW * 0.48, y - hgt - hgt * 0.18); ctx.lineTo(x + wid * 0.92, y - hgt + 1); ctx.stroke();
      }
      // Ventanas con marco, contraventanas y un zócalo dan escala a las viviendas.
      const winW = Math.max(2, frontW * 0.17), winH = Math.max(3, hgt * 0.13);
      const windowRows = hgt > 54 ? 3 : 2;
      for (let row = 0; row < windowRows; row++) for (let col = 0; col < 2; col++) {
        const wx = x + frontW * (0.18 + col * 0.43);
        const wy = y - hgt * (0.74 - row * 0.22);
        ctx.fillStyle = night ? 'rgba(239,199,135,.82)' : 'rgba(91,112,119,.72)';
        ctx.fillRect(wx - 1.1 * sc, wy - 1.1 * sc, winW + 2.2 * sc, winH + 2.2 * sc);
        ctx.fillStyle = night ? '#e5c591' : '#d9dfd5'; ctx.fillRect(wx, wy, winW, winH);
        ctx.fillStyle = night ? 'rgba(110,79,54,.56)' : 'rgba(114,78,61,.48)';
        ctx.fillRect(wx + winW * 0.47, wy, Math.max(0.7, sc), winH);
        if (idx % 2 === 0) {
          ctx.fillStyle = mixColor(facade, '#735545', 0.36);
          ctx.fillRect(wx - 2 * sc, wy, Math.max(1, 1.5 * sc), winH);
          ctx.fillRect(wx + winW + 0.5 * sc, wy, Math.max(1, 1.5 * sc), winH);
        }
      }
      // Puerta, zócalo y balconcito ocasional.
      ctx.fillStyle = mixColor(roof, '#261e19', 0.3);
      ctx.fillRect(x + frontW * 0.68, y - hgt * 0.23, frontW * 0.16, hgt * 0.23);
      ctx.fillStyle = mixColor(facade, '#6a5748', 0.34); ctx.fillRect(x, y - Math.max(2, 4 * sc), frontW, Math.max(2, 4 * sc));
      if (idx % 3 === 1 && hgt > 48) {
        const balconyY = y - hgt * 0.42;
        ctx.fillStyle = mixColor(facade, '#fff0d8', 0.36); ctx.fillRect(x + frontW * 0.12, balconyY, frontW * 0.76, Math.max(1, 2 * sc));
        ctx.strokeStyle = night ? '#b7a890' : '#78685a'; ctx.lineWidth = Math.max(0.7, sc);
        ctx.beginPath(); ctx.moveTo(x + frontW * 0.14, balconyY); ctx.lineTo(x + frontW * 0.14, balconyY - 7 * sc);
        ctx.lineTo(x + frontW * 0.86, balconyY - 7 * sc); ctx.lineTo(x + frontW * 0.86, balconyY); ctx.stroke();
      }
      if (region === 'selva') {
        // Pilotes visibles bajo las viviendas ribereñas.
        ctx.strokeStyle = night ? '#493f35' : '#765a3f'; ctx.lineWidth = Math.max(1, 2.1 * sc);
        [0.2, 0.5, 0.8].forEach(px => { ctx.beginPath(); ctx.moveTo(x + frontW * px, y - 1); ctx.lineTo(x + frontW * px, y + 13 * sc); ctx.stroke(); });
      }
      const tX = x + (side === -1 ? -wid * 0.13 : wid * 1.08), tY = y - hgt * 0.2;
      if (region === 'rocosa') {
        ctx.fillStyle = night ? '#43513b' : '#78804f';
        for (let tuft = 0; tuft < 3; tuft++) {
          ctx.beginPath(); ctx.ellipse(tX + (tuft - 1) * 5 * sc, tY - 3 * sc, 5 * sc, 8 * sc, (tuft - 1) * 0.2, 0, Math.PI * 2); ctx.fill();
        }
      } else if (region === 'selva' || region === 'costera') {
        const stemH = (region === 'selva' ? 39 : 34) * sc;
        ctx.fillStyle = night ? '#493c31' : '#77583c';
        ctx.beginPath(); ctx.moveTo(tX - 2 * sc, tY); ctx.lineTo(tX - sc, tY - stemH); ctx.lineTo(tX + sc, tY - stemH); ctx.lineTo(tX + 2 * sc, tY); ctx.closePath(); ctx.fill();
        const frondColor = night ? '#31533c' : '#61764d';
        ctx.strokeStyle = frondColor; ctx.lineWidth = Math.max(1, 2.1 * sc);
        for (let frond = 0; frond < 5; frond++) {
          const angle = -Math.PI * 0.92 + frond * Math.PI * 0.21;
          ctx.beginPath(); ctx.moveTo(tX, tY - stemH); ctx.quadraticCurveTo(tX + Math.cos(angle) * 9 * sc, tY - stemH - 7 * sc, tX + Math.cos(angle) * 18 * sc, tY - stemH + Math.sin(angle) * 11 * sc); ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#6c4c35'; ctx.fillRect(tX - Math.max(1, 3 * sc), tY, Math.max(2, 6 * sc), Math.max(5, 31 * sc));
        ctx.fillStyle = night ? '#164d58' : '#237341';
        ctx.beginPath(); ctx.arc(tX, tY, Math.max(3, 18 * sc), 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = night ? 'rgba(243,204,139,.66)' : 'rgba(255,247,224,.72)';
      const windowSize = Math.max(1, 4 * sc);
      for (let wx = 0; wx < 2; wx++) for (let wy = 0; wy < 2; wy++) {
        ctx.fillRect(x + wid * (0.18 + wx * 0.28), y - hgt * (0.72 - wy * 0.22), windowSize, windowSize);
      }
    }
  }
}

// Vegetación en dos planos, con ritmos distintos para reforzar el avance.
export function drawRoadsideGreenery(ctx, W, GND, horizonY, cx, dayTime, dist, zonaCfg) {
  const night = isNight(dayTime), rH = roadHalf(W), region = zonaCfg?.id || 'rocosa';
  const paintTree = (x, y, scale, seed, close = false) => {
    const palm = (region === 'selva' || region === 'costera') && Math.abs(seed % 3) < 1;
    const trunkW = Math.max(1, (palm ? 3 : close ? 6 : 4) * scale);
    const trunkH = (palm ? 34 : region === 'selva' ? 28 : close ? 26 : 19) * scale;
    ctx.fillStyle = night ? '#453c35' : '#72533c';
    ctx.beginPath(); ctx.moveTo(x - trunkW / 2, y); ctx.lineTo(x - trunkW * 0.35, y - trunkH); ctx.lineTo(x + trunkW * 0.5, y - trunkH); ctx.lineTo(x + trunkW / 2, y); ctx.closePath(); ctx.fill();
    const radius = (region === 'selva' ? 16 : close ? 15 : 11) * scale;
    const greens = night ? ['#29453d', '#36534a', '#43564a'] : ['#60714c', '#71805a', '#87906a'];
    ctx.fillStyle = greens[Math.floor(hash(seed) * greens.length)];
    if (palm) {
      const topY = y - trunkH;
      for (let frond = 0; frond < 5; frond++) {
        const angle = -Math.PI * 0.95 + frond * Math.PI * 0.235;
        ctx.strokeStyle = greens[((frond + Math.floor(seed)) % greens.length + greens.length) % greens.length]; ctx.lineWidth = Math.max(1, 2.2 * scale);
        ctx.beginPath(); ctx.moveTo(x, topY); ctx.quadraticCurveTo(x + Math.cos(angle) * radius * 0.55, topY - radius * 0.45, x + Math.cos(angle) * radius, topY + Math.sin(angle) * radius * 0.7); ctx.stroke();
      }
    } else {
      ctx.beginPath(); ctx.arc(x, y - trunkH - radius * 0.5, radius, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x - radius * 0.55, y - trunkH * 0.8, radius * 0.68, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + radius * 0.55, y - trunkH * 0.82, radius * 0.7, 0, Math.PI * 2); ctx.fill();
    }
  };
  for (let side = -1; side <= 1; side += 2) {
    for (let layer = 0; layer < 2; layer++) {
      const factor = layer === 0 ? 0.52 : 0.9;
      const spacing = layer === 0 ? 205 : 158;
      const count = layer === 0 ? 8 : 10;
      for (let i = 0; i < count; i++) {
        const phase = ((dist * factor + i * spacing + (side > 0 ? spacing * 0.48 : 0)) % (count * spacing) + count * spacing) % (count * spacing);
        const z = Z_SPAWN - phase;
        if (z < 38 || z > Z_SPAWN) continue;
        const sc = proy(z), y = proyY(GND, horizonY, sc, i + side * 9);
        const lateral = rH * (layer === 0 ? 1.42 : 1.2) + (layer === 0 ? 78 : 34) + hash(i * 8 + side * 19) * 56;
        const x = proyX(cx, side * lateral, sc, i * 13 + side * layer);
        paintTree(x, y, sc * (layer === 0 ? 1.05 : 1.35), i * 47 + side * 12 + layer, layer === 1);
      }
    }
  }
}

// ─── NIEBLA ───
export function drawFogV2(ctx, W, H, horizonY, t, zonaCfg) {
  const night = isNight(t);
  const fc = zonaCfg ? (night ? zonaCfg.fogNight : zonaCfg.fogDay) : (night ? '9,24,53' : '84,170,213');
  const fg = ctx.createLinearGradient(0, horizonY - 18, 0, H * 0.72);
  fg.addColorStop(0, `rgba(${fc},.6)`); fg.addColorStop(0.2, `rgba(${fc},.28)`); fg.addColorStop(0.68, `rgba(${fc},0)`);
  ctx.fillStyle = fg; ctx.fillRect(0, horizonY - 18, W, H - horizonY + 18);
}

// ─── EDIFICIO DE LLEGADA ───
export function drawFinishV2(ctx, W, GND, horizonY, cx, score, zonaCfg) {
  if (score < 900) return;
  const progress = Math.max(0, Math.min(1, (score - 900) / 100));
  const sc = lerp(0.15, 0.43, progress);
  const bw = 280 * sc;
  const bh = 190 * sc;
  // El borde inferior permanece fijo en el punto donde converge la carretera.
  const baseY = horizonY;
  const roadCenterX = cx;
  const x = roadCenterX - bw / 2, by = baseY - bh;
  const zona = zonaCfg?.id || 'rocosa';
  const estilo = {
    rocosa: { muro: '#b8895c', muroLuz: '#d0aa79', techo: '#754c39', ventana: '#3c5055', puerta: '#49372d', aDosAguas: true },
    selva:   { muro: '#94764e', muroLuz: '#b19462', techo: '#4d5740', ventana: '#405c54', puerta: '#403528', aDosAguas: true },
    costera: { muro: '#d1c19a', muroLuz: '#e1d4b5', techo: '#777261', ventana: '#46616a', puerta: '#455354', aDosAguas: false },
    ciudad:  { muro: '#a7aaa4', muroLuz: '#c3c4bb', techo: '#626a69', ventana: '#405963', puerta: '#34484c', aDosAguas: false },
  }[zona];
  const roofH = bh * (estilo.aDosAguas ? 0.27 : 0.14);
  const wallTop = by + roofH, wallH = baseY - wallTop;
  const wingW = bw * 0.27, mainW = bw - wingW * 2;

  ctx.save();
  const blur = lerp(7, 0, progress);
  ctx.globalAlpha *= lerp(0.28, 1, progress);
  ctx.filter = `blur(${blur}px) brightness(${lerp(0.38, 1, progress)})`;

  // Materiales cálidos y volúmenes bajos para integrarlo con las casas del mapa.
  ctx.fillStyle = 'rgba(8,15,20,.2)';
  ctx.beginPath(); ctx.ellipse(roadCenterX, baseY + 2 * sc, bw * 0.56, 6 * sc, 0, 0, Math.PI * 2); ctx.fill();
  const muro = ctx.createLinearGradient(x, wallTop, x + bw, baseY);
  muro.addColorStop(0, estilo.muroLuz); muro.addColorStop(0.55, estilo.muro); muro.addColorStop(1, estilo.muro);
  ctx.fillStyle = muro;
  ctx.fillRect(x, wallTop + wallH * 0.16, wingW, wallH * 0.84);
  ctx.fillRect(x + wingW + mainW, wallTop + wallH * 0.16, wingW, wallH * 0.84);
  ctx.fillRect(x + wingW, wallTop, mainW, wallH);

  if (estilo.aDosAguas) {
    // Techo bajo que comparte la silueta de las construcciones andinas.
    ctx.fillStyle = estilo.techo;
    ctx.beginPath();
    ctx.moveTo(x - 3 * sc, wallTop + 2 * sc); ctx.lineTo(roadCenterX, by);
    ctx.lineTo(x + bw + 3 * sc, wallTop + 2 * sc);
    ctx.lineTo(x + bw + 3 * sc, wallTop + roofH * 0.32);
    ctx.lineTo(roadCenterX, by + roofH * 0.34); ctx.lineTo(x - 3 * sc, wallTop + roofH * 0.32);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = estilo.techo;
    ctx.fillRect(x - 2 * sc, by + roofH * 0.46, bw + 4 * sc, Math.max(2, 5 * sc));
  }

  // Ventanas pequeñas y separadas; el acceso central deja la pista como punto focal.
  const drawWindows = (left, width, columns, rows = 1) => {
    const gap = width * 0.13;
    const winW = Math.max(1, (width - gap * (columns + 1)) / columns);
    const winH = Math.max(1, wallH * 0.18);
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const wx = left + gap + col * (winW + gap);
      const wy = wallTop + wallH * (0.23 + row * 0.38);
      ctx.fillStyle = estilo.ventana; ctx.fillRect(wx, wy, winW, winH);
      ctx.fillStyle = 'rgba(242,218,167,.3)'; ctx.fillRect(wx + winW * 0.12, wy + 1 * sc, Math.max(1, winW * 0.12), Math.max(1, winH * 0.72));
    }
  };
  drawWindows(x, wingW, 1);
  drawWindows(x + wingW + mainW, wingW, 1);
  drawWindows(x + wingW, mainW, 3, 2);

  const doorW = mainW * 0.28, doorX = roadCenterX - doorW / 2, doorY = baseY - wallH * 0.48;
  const openingH = baseY - doorY;
  // Portón abierto: jambas iluminadas y un pasillo oscuro con plano interior para dar profundidad.
  ctx.fillStyle = '#171719'; ctx.fillRect(doorX, doorY, doorW, openingH);
  ctx.fillStyle = estilo.puerta;
  ctx.fillRect(doorX, doorY, doorW * 0.13, openingH);
  ctx.fillRect(doorX + doorW * 0.87, doorY, doorW * 0.13, openingH);
  ctx.fillRect(doorX, doorY, doorW, Math.max(2, openingH * 0.1));
  const interior = ctx.createLinearGradient(0, doorY + openingH * 0.12, 0, baseY);
  interior.addColorStop(0, 'rgba(196,163,111,.45)');
  interior.addColorStop(.36, 'rgba(72,60,47,.68)');
  interior.addColorStop(1, '#101113');
  ctx.fillStyle = interior;
  ctx.fillRect(doorX + doorW * 0.2, doorY + openingH * 0.12, doorW * 0.6, openingH * 0.88);
  ctx.fillStyle = 'rgba(8,9,12,.5)';
  ctx.beginPath(); ctx.moveTo(doorX + doorW * 0.2, baseY); ctx.lineTo(doorX + doorW * 0.8, baseY);
  ctx.lineTo(doorX + doorW * 0.64, doorY + openingH * 0.2); ctx.lineTo(doorX + doorW * 0.36, doorY + openingH * 0.2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = estilo.muroLuz;
  ctx.fillRect(doorX - doorW * 0.08, doorY - Math.max(1, 3 * sc), doorW * 1.16, Math.max(1, 3 * sc));
  ctx.fillStyle = '#c6ab82'; ctx.fillRect(doorX - doorW * 0.12, baseY - Math.max(2, 4 * sc), doorW * 1.24, Math.max(2, 4 * sc));
  ctx.restore();

}

// ─── OBSTÁCULOS DIBUJADOS ───
function drawObstaculoV2(ctx, o, x, groundY, sc, zonaCfg) {
  const t = o.type;
  if (t === 'combi' || t === 'taxi' || t === 'mototaxi') {
    const h = o.h || 1, bodyH = 26 * sc * h, w = 28 * sc;
    const bCol = t === 'combi' ? (zonaCfg?.combiBody || '#C05621') : (t === 'taxi' ? '#F0D000' : '#FF6B35');
    const tCol = t === 'combi' ? (zonaCfg?.combiTop  || '#E07B39') : (t === 'taxi' ? '#D4B800' : '#FF5522');
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, groundY, w * 0.8, 4 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = bCol; ctx.fillRect(x - w, groundY - bodyH, w * 2, bodyH);
    ctx.fillStyle = tCol; ctx.fillRect(x - w, groundY - bodyH, w * 2, bodyH * 0.22);
    ctx.fillStyle = '#88ccee';
    ctx.fillRect(x - w * 0.7, groundY - bodyH * 0.72, w * 0.55, bodyH * 0.28);
    ctx.fillRect(x + w * 0.15, groundY - bodyH * 0.72, w * 0.55, bodyH * 0.28);
    if (t === 'combi' && sc > 0.35) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x - w * 0.55, groundY - bodyH * 0.95, w * 1.1, bodyH * 0.2);
      ctx.fillStyle = '#333'; ctx.font = `bold ${Math.max(3, 5 * sc)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('LIMA ↔ CENTRO', x, groundY - bodyH * 0.85);
    }
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(x - w * 0.55, groundY, 5 * sc, 3 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + w * 0.55, groundY, 5 * sc, 3 * sc, 0, 0, Math.PI * 2); ctx.fill();
  } else if (t === 'roca') {
    ctx.fillStyle = '#6B5A3E'; ctx.beginPath(); ctx.arc(x, groundY - 12 * sc, 14 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9B8A6E'; ctx.beginPath(); ctx.arc(x - 4 * sc, groundY - 16 * sc, 7 * sc, 0, Math.PI * 2); ctx.fill();
  } else if (t === 'llama') {
    ctx.fillStyle = '#D4A855'; ctx.fillRect(x - 10 * sc, groundY - 30 * sc, 20 * sc, 22 * sc);
    ctx.fillStyle = '#C89840'; ctx.fillRect(x - 4 * sc, groundY - 48 * sc, 8 * sc, 20 * sc);
    ctx.beginPath(); ctx.arc(x, groundY - 50 * sc, 8 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x - 2 * sc, groundY - 52 * sc, 1.5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C89840';
    [-7, -3, 3, 7].forEach(ox => { ctx.fillRect(x + ox * sc, groundY - 10 * sc, 3 * sc, 10 * sc); });
  } else if (t === 'tronco') {
    ctx.fillStyle = '#6B3A1A'; ctx.fillRect(x - 20 * sc, groundY - 10 * sc, 40 * sc, 10 * sc);
    ctx.fillStyle = '#8B5A2A'; ctx.fillRect(x - 20 * sc, groundY - 12 * sc, 40 * sc, 4 * sc);
  } else if (t === 'ambulante') {
    ctx.fillStyle = '#F0D080'; ctx.fillRect(x - 12 * sc, groundY - 24 * sc, 24 * sc, 20 * sc);
    ctx.fillStyle = '#E05020'; ctx.fillRect(x - 12 * sc, groundY - 28 * sc, 24 * sc, 6 * sc);
  } else if (t === 'hueco') {
    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.beginPath(); ctx.ellipse(x, groundY - 2 * sc, 22 * sc, 6 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8B7355'; ctx.lineWidth = sc;
    ctx.beginPath(); ctx.ellipse(x, groundY - 2 * sc, 23 * sc, 7 * sc, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (t === 'bajo') {
    // Barra/rama colgante que cruza los 3 carriles: obliga a agacharse.
    const w = 128 * sc, poleH = 46 * sc, barY = groundY - poleH, barH = Math.max(4, 8 * sc);
    ctx.strokeStyle = zonaCfg?.id === 'selva' ? '#3d5a2a' : '#8a8f96';
    ctx.lineWidth = Math.max(2, 4 * sc);
    ctx.beginPath(); ctx.moveTo(x - w / 2, groundY); ctx.lineTo(x - w / 2, barY);
    ctx.moveTo(x + w / 2, groundY); ctx.lineTo(x + w / 2, barY); ctx.stroke();
    ctx.fillStyle = zonaCfg?.id === 'selva' ? '#4a7a2e' : '#f2b447';
    ctx.fillRect(x - w / 2, barY - barH / 2, w, barH);
    ctx.fillStyle = '#1a1a1a';
    for (let i = -w / 2; i < w / 2; i += Math.max(6, 14 * sc)) ctx.fillRect(x + i, barY - barH / 2, Math.max(2, 6 * sc), barH);
    ctx.fillStyle = '#fff8e2'; ctx.font = `bold ${Math.max(5, 8 * sc)}px Arial`; ctx.textAlign = 'center';
    ctx.fillText('¡AGÁCHATE!', x, barY - barH - 2 * sc);
  } else {
    ctx.fillStyle = '#FF6B00';
    ctx.beginPath(); ctx.moveTo(x, groundY - 18 * sc); ctx.lineTo(x - 8 * sc, groundY); ctx.lineTo(x + 8 * sc, groundY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 8 * sc, groundY - 9 * sc, 16 * sc, 3 * sc);
  }
}

// ─── RENDER OBSTÁCULOS ───
export function renderObstaculosV2(ctx, obs, W, GND, horizonY, cx, frame, dist, zonaCfg) {
  [...obs].sort((a, b) => b.z - a.z).forEach(o => {
    const sc = proy(o.z); if (sc < 0.1) return;
    const off = o.lane * W * 0.22 + curvOff(W, dist, sc);
    const px = proyX(cx, off, sc, o.z), py = proyY(GND, horizonY, sc, o.z);
    if (!['combi', 'taxi', 'mototaxi', 'hueco', 'bajo'].includes(o.type)) {
      ctx.fillStyle = 'rgba(18,16,14,.28)';
      ctx.beginPath(); ctx.ellipse(px, py, Math.max(2, 18 * sc), Math.max(1, 4 * sc), 0, 0, Math.PI * 2); ctx.fill();
    }
    drawObstaculoV2(ctx, o, px, py, sc, zonaCfg);
  });
}

// ─── POWER-UP (estrella) ───
export function drawPowerupV2(ctx, pw, W, GND, horizonY, cx, frame, dist) {
  const sc = proy(pw.z); if (sc < 0.12) return;
  const off = pw.lane * W * 0.22 + curvOff(W, dist, sc);
  const px = proyX(cx, off, sc), py = proyY(GND, horizonY, sc);
  const bob = Math.sin((frame + pw.frame0) * 0.18) * 5 * sc;
  ctx.save();
  const iconY = py - 40 * sc + bob;
  if (pw.tipo === 'lento') {
    ctx.shadowColor = '#6de4ec'; ctx.shadowBlur = 14 * sc;
    ctx.fillStyle = '#143d4a'; ctx.beginPath(); ctx.arc(px, iconY, Math.max(4, 11 * sc), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#82eef1'; ctx.lineWidth = Math.max(1, 2 * sc); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#d8ffff'; ctx.lineWidth = Math.max(1, 2.2 * sc); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(px, iconY - 5 * sc); ctx.lineTo(px, iconY + 4 * sc); ctx.moveTo(px - 3.5 * sc, iconY + 1 * sc); ctx.lineTo(px, iconY + 5 * sc); ctx.lineTo(px + 3.5 * sc, iconY + 1 * sc); ctx.stroke();
  } else {
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 16 * sc;
    ctx.fillStyle = '#FFD700';
    const r = 10 * sc;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const rad = i % 2 === 0 ? r : r * 0.45;
      if (i === 0) ctx.moveTo(px + Math.cos(angle) * rad, iconY + Math.sin(angle) * rad);
      else ctx.lineTo(px + Math.cos(angle) * rad, iconY + Math.sin(angle) * rad);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ─── JUGADOR (con avatar dinámico) ───
export function renderPlayerV2(ctx, jugador, W, GND, cx, frame, speed, dist, avatar, finishFrames = 0, horizonY = GND * 0.46) {
  const projection = proy(50);
  const off = jugador.laneVisual * W * 0.22 + curvOff(W, dist, projection);
  const worldX = proyX(cx, off, projection);
  const finishT = Math.max(0, Math.min(1, finishFrames / 90));
  const moveT = finishT * finishT * (3 - 2 * finishT);
  const x = lerp(worldX, cx, moveT);
  const y = lerp(GND, horizonY, moveT);
  const spriteScale = lerp(1, 0.2, moveT);
  // Se desvanece al cruzar el umbral, como si entrara en el interior del edificio.
  const spriteAlpha = lerp(1, 0, smoothstep(0.76, 1, finishT));
  const airborne = finishFrames === 0 && !jugador.onGround;
  const duck = finishFrames === 0 && jugador.duck && !airborne;
  const correr = jugador.onGround && !duck && finishT < 0.86;
  const jumpOffset = finishFrames === 0 ? jugador.jumpOffset : 0;

  ctx.save();
  ctx.globalAlpha *= spriteAlpha;
  ctx.translate(x, y);
  ctx.scale(spriteScale, spriteScale);
  const shadowSc = airborne ? Math.max(0.35, 1 + jumpOffset / 90) : 1;
  const somb = ctx.createRadialGradient(0, 0, 1, 0, 0, 22 * shadowSc);
  somb.addColorStop(0, `rgba(0,0,0,${airborne ? 0.28 : 0.42})`); somb.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath(); ctx.ellipse(0, 0, 20 * shadowSc, 6 * shadowSc, 0, 0, Math.PI * 2); ctx.fillStyle = somb; ctx.fill();

  if (correr) {
    const puff = (Math.sin(frame * 0.48) + 1) * 0.5;
    ctx.fillStyle = `rgba(234,222,202,${0.12 + puff * 0.1})`;
    ctx.beginPath(); ctx.ellipse(-17, -3, 7 + puff * 3, 2 + puff, -0.1, 0, Math.PI * 2); ctx.fill();
  }

  const dl = jugador.lane - jugador.laneVisual;
  const lean = finishFrames > 0 ? 0 : Math.abs(dl) > 0.3 ? (dl > 0 ? 1 : -1) : 0;
  drawPersonaje(ctx, 0, jumpOffset, avatar, {
    vista: 'espalda', frame, correr, aire: airborne, doble: airborne && jugador.doubleJumped, agachar: duck, lean, P: 2.5,
  });

  if (speed > 5.5 && correr) {
    const alpha = Math.min(0.4, (speed - 5.5) * 0.08);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(-26 - i * 8, -30 + jumpOffset + i * 10); ctx.lineTo(-40 - i * 8, -30 + jumpOffset + i * 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(26 + i * 8, -30 + jumpOffset + i * 10); ctx.lineTo(40 + i * 8, -30 + jumpOffset + i * 10); ctx.stroke();
    }
  }
  ctx.restore();
}

// ─── CARTELES, FAROLAS Y POSICIÓN DEL JUGADOR ───
function laneOffsetBase(W, lane) {
  return lane * W * 0.22;
}

// Carteles del mundo: refuerzan que el trayecto es una carrera hacia la UTP.
export function drawRoadsideSigns(ctx, W, GND, horizonY, centerX, distancia, dayTime) {
  const signs = ["UTP →", "< CÓDIGO", "ALGORITMOS", "META 1 KM", "PSeInt", "¡VAMOS!"];
  const rH = roadHalf(W);
  const night = isNight(dayTime);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 6; i++) {
      const z = Z_SPAWN - ((distancia + i * 270 + (side === 1 ? 110 : 0)) % 1620);
      if (z < 70 || z > Z_SPAWN) continue;
      const scale = proy(z);
      const y = proyY(GND, horizonY, scale, z);
      const curve = curvOff(W, distancia, scale);
      const x = centerX + curve + side * (rH * 1.38 + 26) * scale;
      const signW = Math.max(8, 53 * scale);
      const signH = Math.max(5, 24 * scale);

      ctx.fillStyle = night ? "#274f75" : "#eaf5e9";
      ctx.fillRect(x - signW / 2, y - signH - 18 * scale, signW, signH);
      ctx.strokeStyle = "#1f8ac0";
      ctx.lineWidth = Math.max(1, scale * 2);
      ctx.strokeRect(x - signW / 2, y - signH - 18 * scale, signW, signH);
      ctx.fillStyle = night ? "#dff8ff" : "#17466a";
      ctx.font = `bold ${Math.max(4, 8 * scale)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(signs[(i + (side === 1 ? 2 : 0)) % signs.length], x, y - signH * .35 - 18 * scale);
      ctx.fillStyle = "#667d8d";
      ctx.fillRect(x - Math.max(1, scale), y - 18 * scale, Math.max(2, 2 * scale), 19 * scale);
    }
  }
}

// Farolas residenciales: de noche crean focos cálidos que dan profundidad y
// visibilidad al asfalto, sin oscurecer el trayecto jugable.
export function drawStreetLights(ctx, W, GND, horizonY, centerX, distancia, dayTime) {
  const night = isNight(dayTime);
  const rH = roadHalf(W);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 8; i++) {
      const z = Z_SPAWN - ((distancia + i * 205 + (side === 1 ? 86 : 0)) % 1640);
      if (z < 30 || z > Z_SPAWN) continue;
      const scale = proy(z);
      const y = proyY(GND, horizonY, scale, z);
      const x = centerX + curvOff(W, distancia, scale) + side * (rH * 1.18 + 18) * scale;
      const poleH = Math.max(9, 72 * scale);
      const lampY = y - poleH;
      if (night) {
        const glow = ctx.createRadialGradient(x, lampY, 1, x, lampY, Math.max(8, 37 * scale));
        glow.addColorStop(0, "rgba(255, 246, 174, .72)");
        glow.addColorStop(.28, "rgba(255, 216, 112, .25)");
        glow.addColorStop(1, "rgba(255, 205, 93, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, lampY, Math.max(8, 37 * scale), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = night ? "#496b7c" : "#728b92";
      ctx.lineWidth = Math.max(1, 2 * scale);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, lampY);
      ctx.lineTo(x + side * 6 * scale, lampY);
      ctx.stroke();
      ctx.fillStyle = night ? "#fff2a5" : "#dae8c9";
      ctx.fillRect(x + side * 3 * scale - 3 * scale, lampY - 2 * scale, Math.max(3, 7 * scale), Math.max(2, 4 * scale));
    }
  }
}

// --- JUGADOR (en primer plano, corriendo hacia la cámara) ---
export function jugadorScreenPos(jugador, W, GND, centerX, distancia = 0) {
  const x = proyX(centerX, laneOffsetBase(W, jugador.laneVisual), 1, jugador.laneVisual * 7) + curvOff(W, distancia, 1);
  const y = GND + jugador.jumpOffset;
  return { x, y };
}
