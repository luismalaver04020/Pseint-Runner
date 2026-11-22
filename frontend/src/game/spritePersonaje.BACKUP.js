// ═══════════════════════════════════════════════
//  SPRITE DEL PERSONAJE (diseño "Joja") — pixel art
//  · vista 'espalda': la que se ve en el juego (la cámara va detrás y él corre hacia el fondo)
//  · vista 'frente' : para el preview del editor de avatar
//  Todo se dibuja con fillRect sobre una grilla de "píxeles de sprite".
// ═══════════════════════════════════════════════

const SPR_P = 3;     // ancho de la grilla
const CENTRO = 9;            // columna que se alinea con la X del jugador

// Colores por defecto = hoja de diseño (pelo cacao, polo negro, jean verde azulado)
export const AVATAR_REF = {
  genero: 'hombre',
  piel: '#F1C9A5',
  cabello: '#7B4028',
  ropa: 'pantalon',
  colorRopa: '#1B1B22',
  colorPantalon: '#1E6B73',
};

// ── Ajuste de color ───────────────────────────
function hex2rgb(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mezcla(hex, k) {           // k<0 oscurece, k>0 aclara
  const t = k < 0 ? 0 : 255, a = Math.abs(k);
  const [r, g, b] = hex2rgb(hex);
  const f = (c) => Math.round(c + (t - c) * a).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
function sombra(hex) {              // en colores muy oscuros la "sombra" es más clara
  const [r, g, b] = hex2rgb(hex);
  return (r * 0.3 + g * 0.59 + b * 0.11) < 70 ? mezcla(hex, 0.16) : mezcla(hex, -0.3);
}

function paletaAvatar(av) {
  const a = { ...AVATAR_REF, ...(av || {}) };
  return {
    H: a.cabello,  h: mezcla(a.cabello, -0.32),
    S: a.piel,     s: mezcla(a.piel, -0.18),
    E: '#1A1220',  e: '#FFFFFF',  M: mezcla(a.piel, -0.42),
    N: a.colorRopa, n: sombra(a.colorRopa), B: '#E8B830',
    Q: a.colorPantalon, q: mezcla(a.colorPantalon, -0.28),
    G: mezcla(a.colorPantalon, -0.45), C: mezcla(a.colorPantalon, 0.28),
    T: a.colorPantalon, t: mezcla(a.colorPantalon, -0.28),   // short (solo si ropa === 'short')
    K: '#141017',  k: '#3A3140',
  };
}

// ── CABEZA + TORSO (18 × 22) ──────────────────
// Filas: 0-12 cabeza · 13 cuello · 14 cuello de camisa · 15-17 hombros/mangas · 18-21 torso
const ESPALDA = [
  '......H..H.H......',
  '.....HHH.HHHH.....',
  '...H.HHHHHHHHH.H..',
  '..HHHHHHHHHHHHHH..',
  '..HHHhHHHHHHHHHH..',
  '.HHHHhHHHHHHHHHHH.',
  '..HHHHHHHHHhHHHH..',
  '..HHHHHHHHhHHHHH..',
  '..HHHHHHHHHHHHHH..',
  '..SHHHhHHHHHHHHS..',
  '..SHHHhHHHHHHHHS..',
  '...HHHHHHHHHHHH...',
  '....hHHHHHHHHh....',
  '.......SSSS.......',
  '......NNSSNN......',
  '..NNNNNNNNNNNNNN..',
  '..NNNNNNNNNNNNNN..',
  '..NNNNNNNNNNNNNN..',
  '....NNNNNNNNNN....',
  '....NNNNNNNNNN....',
  '....NNNNNNNNNN....',
  '....nNNNNNNNNn....',
];
const FRENTE = [
  '......H..H.H......',
  '.....HHH.HHHH.....',
  '...H.HHHHHHHHH.H..',
  '..HHHHHHHHHHHHHH..',
  '..HHHhHHHHHHHHHH..',
  '...HHHHHHHHHHHH...',
  '...HSSHHSSHHSSH...',
  '...HShhSSSShhSH...',
  '..SHSeESSSSeESHS..',
  '..SHSEESSSSEESHS..',
  '...HSSSSssSSSSH...',
  '....SSSSMMSSSS....',
  '.....sSSSSSSs.....',
  '.......SSSS.......',
  '......NNSSNN......',
  '..NNNNNNNNNNNNNN..',
  '..NNNNNNBBNNNNNN..',
  '..NNNNNNNNNNNNNN..',
  '....NNNNBBNNNN....',
  '....NNNNNNNNNN....',
  '....NNNNBBNNNN....',
  '....nNNNNNNNNn....',
];
// Conserva el pixel art original, pero separa un poco cintura y cadera en
// el avatar femenino para que también se lea claramente desde atrás.
function siluetaFemenina(mapa) {
  const silueta = mapa.slice();
  silueta[15] = '..NNNNNNNNNNNNNN..';
  silueta[16] = '..NNNNNNBBNNNNNN..';
  silueta[17] = '...NNNNNNNNNNNN...';
  silueta[18] = '...NNNNNBBNNNNN...';
  silueta[19] = '...NNNNNNNNNNNN...';
  silueta[20] = '...NNNNNBBNNNNN...';
  silueta[21] = '...nNNNNNNNNNNn...';
  return silueta;
}
const ESPALDA_MUJER = siluetaFemenina(ESPALDA);
const FRENTE_MUJER = siluetaFemenina(FRENTE);
const UPPER_H = ESPALDA.length;
const TORSO_DESDE = 18;

// Pelo largo (género 'mujer')
const PELO_LARGO_ESPALDA = {
  12: '....HHHHHHHHHH....', 13: '....HHHhHHhHHH....', 14: '....HHHHHHHHHH....',
  15: '...HHHHHHHHHHHH...', 16: '....HHHhHHhHHH....', 17: '....hHHHHHHHHh....',
  18: '....hHHHHHHHHh....', 19: '.....hHHHHHHh.....',
};
const PELO_LARGO_FRENTE = {};
for (let r = 10; r <= 17; r++) PELO_LARGO_FRENTE[r] = '..HH..........HH..';

// ── PIERNAS (18 × 10) — vistas desde atrás ────
// Q jean · q bolsillo · C doblez · K zapato · k suela · G cinturón
const CINTURON = '....GGGGGGGGGG....';
const LEGS = {
  run0: [ // pierna derecha levantada atrás (se ve la suela)
    CINTURON, '....QQQQQQQQQQ....', '....QqqQQQQqqQ....', '....QqqQQQQqqQ....',
    '....QQQQ..QQQQ....', '....QQQQ..QQQQ....', '....QQQQ..CCCC....', '....CCCC..KKKK....',
    '...KKKKK..kkkk....', '...KKKKK..........',
  ],
  run1: [ // pasando (las dos apoyadas)
    CINTURON, '....QQQQQQQQQQ....', '....QqqQQQQqqQ....', '....QqqQQQQqqQ....',
    '....QQQQ..QQQQ....', '....QQQQ..QQQQ....', '....QQQQ..QQQQ....', '....CCCC..CCCC....',
    '...KKKKK..KKKKK...', '...KKKKK..KKKKK...',
  ],
  run2: [ // pierna izquierda levantada atrás
    CINTURON, '....QQQQQQQQQQ....', '....QqqQQQQqqQ....', '....QqqQQQQqqQ....',
    '....QQQQ..QQQQ....', '....QQQQ..QQQQ....', '....CCCC..QQQQ....', '....KKKK..CCCC....',
    '....kkkk..KKKKK...', '..........KKKKK...',
  ],
  salto: [
    CINTURON, '....QqqQQQQqqQ....', '....QqqQQQQqqQ....', '....QQQQ..QQQQ....',
    '....QQQQ..QQQQ....', '....CCCC..CCCC....', '....KKKK..KKKK....', '....kkkk..kkkk....',
    '..................', '..................',
  ],
  agachado: [
    CINTURON, '....QQQQQQQQQQ....', '...QQQQQQQQQQQQ...', '...CCCC....CCCC...',
    '..KKKKK....KKKKK..', '..KKKKK....KKKKK..',
  ],
};
const RUN_SEQ = ['run0', 'run1', 'run2', 'run1'];
const BOB = [0, 1, 0, 1];  // rebote (en píxeles de sprite) por cuadro

// ── Pintado ───────────────────────────────────
function blit(ctx, mapa, pal, ox, oy, P, filas) {
  let out = 0; // fila de salida (se compacta si se omiten filas)
  const filasArr = Array.isArray(mapa) ? mapa : null;
  const n = filasArr ? filasArr.length : 0;
  for (let r = 0; r < n; r++) {
    if (filas && filas.has(r)) continue;
    const fila = filasArr[r];
    for (let c = 0; c < fila.length; c++) {
      const ch = fila[c];
      if (ch === '.') continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + c * P, oy + out * P, P, P);
    }
    out++;
  }
}

function blitDisperso(ctx, filasObj, pal, ox, oy, P, filas) {
  // mapa { fila: 'string' } → se pinta respetando la compactación de filas omitidas
  const arr = [];
  for (let r = 0; r < UPPER_H; r++) arr.push(filasObj[r] || '');
  blit(ctx, arr, pal, ox, oy, P, filas);
}

function peloEnMovimiento(paso) {
  const mapa = { ...PELO_LARGO_ESPALDA };
  const direccion = paso === 0 ? -1 : paso === 2 ? 1 : 0;
  if (!direccion) return mapa;
  for (let r = 15; r <= 19; r++) {
    const fila = mapa[r];
    mapa[r] = direccion < 0 ? `${fila.slice(1)}.` : `.${fila.slice(0, -1)}`;
  }
  return mapa;
}

function brazo(ctx, pal, x, y, largo, P, sombraOn, balanceo = 0) {
  // El codo cambia de dirección durante la zancada, en vez de mover un bloque rígido.
  for (let i = 0; i < largo; i++) {
    const quiebre = i < 2 ? 0 : balanceo === 1 ? 1 : balanceo === -1 ? -1 : 0;
    ctx.fillStyle = i === largo - 1 ? pal.s : sombraOn ? pal.s : pal.S;
    ctx.fillRect(x + quiebre * P, y + i * P, 2 * P, P);
  }
  const manoX = x + (largo < 5 ? 0 : balanceo) * P;
  ctx.fillStyle = pal.s;
  ctx.fillRect(manoX, y + largo * P, P, P);
}

/**
 * Dibuja al personaje con los pies en (x, y).
 * opts: { vista: 'espalda' | 'frente', frame, correr, aire, agachar, lean (-1|0|1), P }
 */
export function drawPersonaje(ctx, x, y, av, opts = {}) {
  const { vista = 'espalda', frame = 0, correr = false, aire = false, victoria = false, agachar = false, lean = 0 } = opts;
  const P = opts.P || SPR_P;
  const pal = paletaAvatar(av);
  const paso = Math.floor(frame / 4) % 4;

  const legKey = agachar ? 'agachado' : aire ? 'salto' : correr ? RUN_SEQ[paso] : 'run1';
  let legs = LEGS[legKey];
  const top = legs.findIndex((f) => /[^.]/.test(f));
  if (vista === 'frente') {
    legs = legs.map((f, i) => (i === 0 ? '....GGGGBBGGGG....' : f.replace(/q/g, 'Q')));
  }
  if (av && av.ropa === 'short') {
    // Short: solo las primeras filas del muslo llevan el color de ropa; el resto son piernas al aire
    const cortas = legKey === 'agachado' ? 2 : 4;
    legs = legs.map((f, i) => (i - top < cortas
      ? f.replace(/[QqG]/g, (m) => (m === 'q' ? 't' : 'T'))
      : f.replace(/[QC]/g, 'S').replace(/q/g, 's')));
  }
  const bob = correr && !agachar && !aire ? BOB[paso] : 0;

  const ox = Math.round(x) - CENTRO * P;
  const legsY = Math.round(y) - legs.length * P;
  const legsTopY = legsY + top * P;
  const filasFuera = agachar ? new Set([TORSO_DESDE + 1, TORSO_DESDE + 2]) : null;
  const quitadas = filasFuera ? filasFuera.size : 0;
  const upperY = legsTopY - (UPPER_H - quitadas) * P - bob * P;
  const uox = ox + lean * P;           // el torso se inclina 1 px hacia donde cambia de carril

  // Piernas
  blit(ctx, legs, pal, ox, legsTopY - top * P, P);

  // Balanceo de brazos (contrario a las piernas). fase: 1 adelante · -1 atrás · 0 colgando
  let izq = 0, der = 0;
  if (aire || victoria) { izq = 1; der = 1; }
  else if (correr) { const f = [[-1, 1], [0, 0], [1, -1], [0, 0]][paso]; izq = f[0]; der = f[1]; }
  const largoBase = agachar ? 4 : 6;
  const yBrazo = upperY + TORSO_DESDE * P;
  const dibujaBrazos = () => {
    const L = (s) => (s === 1 ? largoBase - 2 : s === -1 ? largoBase + 1 : largoBase);
    const dy = (s) => (s === 1 ? -P : s === -1 ? P : 0);
    const dx = (s) => (s === -1 ? P : 0);   // brazo atrás = un poco más hacia afuera
    brazo(ctx, pal, uox + 2 * P - dx(izq), yBrazo + dy(izq), L(izq), P, false, izq);
    brazo(ctx, pal, uox + 14 * P + dx(der), yBrazo + dy(der), L(der), P, false, der);
  };

  const mujer = av && av.genero === 'mujer';
  const base = mujer ? (vista === 'frente' ? FRENTE_MUJER : ESPALDA_MUJER) : (vista === 'frente' ? FRENTE : ESPALDA);
  blit(ctx, base, pal, uox, upperY, P, filasFuera);

  if (mujer) {
    const pelo = vista === 'frente' ? PELO_LARGO_FRENTE : peloEnMovimiento(paso);
    blitDisperso(ctx, pelo, pal, uox, upperY, P, filasFuera);
  }
  dibujaBrazos();
}

