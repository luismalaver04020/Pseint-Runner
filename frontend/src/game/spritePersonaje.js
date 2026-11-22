// ═══════════════════════════════════════════════
//  SPRITE DEL PERSONAJE — pixel art v2 (rediseño completo)
//  · vista 'espalda': la que se ve en el juego (cámara detrás, corre hacia el fondo)
//  · vista 'frente' : para el preview del editor de avatar
//  Todo se dibuja con fillRect sobre una grilla de "píxeles de sprite".
//
//  Mejoras v2:
//   - Cabello con mechones, reflejos y más volumen
//   - Piel con sombras en cuello, orejas y nuca
//   - Remera con cuello redondo, pliegues y dobladillo
//   - Cinturón con hebilla dorada central
//   - Jeans con costura lateral, bolsillos y reflejo tobillo
//   - Zapatillas de dos colores (cuerpo blanco + suela oscura + logo rojo)
//   - Brazos con manga corta y pulsera dorada en muñeca
//   - Versión mujer con trenza y cintura marcada
// ═══════════════════════════════════════════════

const SPR_P = 3;      // tamaño de cada "pixel" en px reales
const CENTRO = 9;     // columna que se alinea con la X del jugador

// ── Colores por defecto ───────────────────────
export const AVATAR_REF = {
  genero:        'hombre',
  piel:          '#F2C98C',   // tono cálido mediterráneo
  cabello:       '#3B1F0A',   // castaño oscuro
  ropa:          'pantalon',
  colorRopa:     '#1C2B4A',   // azul marino profundo
  colorPantalon: '#2B4EA8',   // jean azul medio
};

// ── Ajuste de color ───────────────────────────
function hex2rgb(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mezcla(hex, k) {   // k<0 oscurece, k>0 aclara
  const t = k < 0 ? 0 : 255, a = Math.abs(k);
  const [r, g, b] = hex2rgb(hex);
  const f = (c) => Math.round(c + (t - c) * a).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
function sombra(hex) {
  const [r, g, b] = hex2rgb(hex);
  return (r * 0.3 + g * 0.59 + b * 0.11) < 70 ? mezcla(hex, 0.14) : mezcla(hex, -0.28);
}

function paletaAvatar(av) {
  const a = { ...AVATAR_REF, ...(av || {}) };
  return {
    // cabello
    H: a.cabello,                      // base
    h: mezcla(a.cabello, -0.35),       // sombra
    L: mezcla(a.cabello,  0.28),       // reflejo / mechón claro
    // piel
    S: a.piel,                         // base
    s: mezcla(a.piel, -0.20),          // sombra suave
    M: mezcla(a.piel, -0.38),          // sombra profunda (cuello, nuca)
    // ojos / boca
    E: '#1A1220',                      // pupila
    e: '#FFFFFF',                      // blanco del ojo
    b: '#E8A080',                      // labio
    // ropa superior
    N: a.colorRopa,                    // base
    n: sombra(a.colorRopa),            // sombra
    l: mezcla(a.colorRopa,  0.16),     // brillo / pliegue
    X: mezcla(a.colorRopa,  0.35),     // logo/detalle claro en camiseta
    // cinturón
    G: '#3A2A14',                      // cuero
    B: '#D4AF37',                      // hebilla dorada
    // pantalón
    Q: a.colorPantalon,                // base
    q: mezcla(a.colorPantalon, -0.26), // costura / sombra
    C: mezcla(a.colorPantalon,  0.20), // reflejo tobillo
    // zapatilla
    K: '#F0EDE8',                      // cuerpo (blanco sucio)
    k: '#CFCABC',                      // lateral / sombra zapatilla
    Z: '#D63020',                      // logo/stripe rojo
    z: '#1C1C1C',                      // suela oscura
    // short / pierna desnuda
    T: a.colorPantalon,
    t: mezcla(a.colorPantalon, -0.26),
    // pulsera / accesorio
    W: '#D4AF37',                      // dorado pulsera
  };
}

// ════════════════════════════════════════════════
//  CABEZA + TORSO (18 × 22) — vista ESPALDA
// ════════════════════════════════════════════════
const ESPALDA = [
  /* 0  cabello punta */   '.....hH...Hh......',
  /* 1  cabello alto  */   '....HHL.LHHh......',
  /* 2  cabeza ancha  */   '..hHHHLLLHHHHh....',
  /* 3  cabeza llena  */   '..HHHHHHHHHHHHh...',
  /* 4  nuca sombra   */   '..HHHhHHHHHHhHH...',
  /* 5  c/orejas      */   '.HHHHhHHHHHHhHHHH.',
  /* 6  base cabello  */   '..HHHHHHHHHHhHHH..',
  /* 7                */   '..HHHHHHHHHHhHHH..',
  /* 8  cabello fin   */   '..HHHHHHHHHHHHHh..',
  /* 9  cuello+orejas */   '..SMHHhHHHHhHHMS..',
  /* 10               */   '..SSMHhHHHHhHMSS..',
  /* 11 base cuello   */   '...SSSHHHHHHSSSs..',
  /* 12 nuca/hombros  */   '....sMHHHHHHMs....',
  /* 13 cuello piel   */   '.......SSSS.......',
  /* 14 cuello remera */   '......NNssNN......',
  /* 15 hombros manga */   '..NNNNNNNNNNNNNl..',
  /* 16 pecho         */   '..NNNNNNNNNNNNNl..',
  /* 17 pecho pliegue */   '..NnNNNNNNNNNnNl..',
  /* 18 torso         */   '....NNNNNNNNNn....',
  /* 19 logo          */   '....NnXXXXXnN.....',
  /* 20 torso bajo    */   '....NNNNNNNNNn....',
  /* 21 dobladillo    */   '....nNNNNNNNnn....',
];

// ════════════════════════════════════════════════
//  CABEZA + TORSO (18 × 22) — vista FRENTE
// ════════════════════════════════════════════════
const FRENTE = [
  /* 0  mechones      */   '.....hH...Hh......',
  /* 1               */    '....HHL.LHHh......',
  /* 2               */    '..hHHHLLLHHHHh....',
  /* 3               */    '..HHHHHHHHHHHHh...',
  /* 4  flequillo    */    '..HHHhHHHHHHhHH...',
  /* 5  frente piel  */    '...HSSHSHSHSSSh...',
  /* 6  cejas        */    '...HSsHHSSHHssh...',
  /* 7  ojos         */    '..SHSeESSSSeESHS..',
  /* 8               */    '..SHSEESSSEEEsHs..',
  /* 9  nariz        */    '...HSSSSMsSSSSH...',
  /* 10 mejillas     */    '....SSSSSSssSSS...',
  /* 11 boca         */    '.....sSSbSSSSs....',
  /* 12 mentón       */    '.......SssS.......',
  /* 13 cuello       */    '.......SSSS.......',
  /* 14 cuello remera*/    '......NNssNN......',
  /* 15 hombros      */    '..NNNNNNNNNNNNNl..',
  /* 16 pecho        */    '..NNNNNNNNNNNNNl..',
  /* 17 botón        */    '..NnNNNBNNNNNnNl..',
  /* 18 torso        */    '....NNNBNNNNNn....',
  /* 19 logo frontal */    '....NnXXXXXnN.....',
  /* 20              */    '....NNNNNNNNNn....',
  /* 21 dobladillo   */    '....nNNNNNNNnn....',
];

// Ajuste femenino: cintura marcada
function siluetaFemenina(mapa) {
  const s = mapa.slice();
  s[15] = '..NNNNNNNNNNNNNl..';
  s[16] = '..NNNNNNNNNNNNNl..';
  s[17] = '...NNNNNNNNNNNn...';
  s[18] = '...NNNBNNNNNNNn...';
  s[19] = '...NnXXXXXnNNn....';
  s[20] = '...NNNNNNNNNNNn...';
  s[21] = '...nNNNNNNNNNnn...';
  return s;
}
const ESPALDA_MUJER = siluetaFemenina(ESPALDA);
const FRENTE_MUJER  = siluetaFemenina(FRENTE);
const UPPER_H       = ESPALDA.length;
const TORSO_DESDE   = 18;

// ── Pelo largo / trenza (género 'mujer') ──────
const PELO_LARGO_ESPALDA = {
  12: '...hHHHHHHHHHh....',
  13: '....HHHhHHhHHH....',
  14: '....HHHHhHHHHH....',
  15: '...HHHHHHHHhHHH...',
  16: '....HHHhLHhHHH....',
  17: '....hHHHHHHHHh....',
  18: '....hHHhLHHHHh....',
  19: '.....hHHHHHHh.....',
  20: '.....hHHhLHHh.....',
  21: '......hHHHHh......',
};
const PELO_LARGO_FRENTE = {};
for (let r = 10; r <= 17; r++) PELO_LARGO_FRENTE[r] = '..HH..........HH..';

// ════════════════════════════════════════════════
//  PIERNAS (18 × 10) — vistas desde atrás
//  G=cinturón cuero  B=hebilla dorada
//  Q=jean base  q=costura/sombra  C=reflejo tobillo
//  K=zapatilla cuerpo  k=lateral zap  Z=logo rojo  z=suela oscura
// ════════════════════════════════════════════════
const CINTURON   = '....GGBGGGBGGGg....'.slice(0, 18);
const CINTURON_F = '....GGBGGGBGGGg....'.slice(0, 18);

const LEGS = {
  run0: [  // pierna derecha levantada (suela visible)
    CINTURON,
    '....QQQqQQQqQQ....',
    '....QqqQQQQqqQ....',
    '....QqqQQQQqqQ....',
    '....QQQQ..QQQQ....',
    '....QQQQ..QQQQ....',
    '....QQQq..CCCq....',
    '....zzzz..KKKKk...',
    '...kKKKK..kkZkk...',
    '...kKKKK..........',
  ],
  run1: [  // neutral — las dos apoyadas
    CINTURON,
    '....QQQqQQQqQQ....',
    '....QqqQQQQqqQ....',
    '....QqqQQQQqqQ....',
    '....QQQQ..QQQQ....',
    '....QQQQ..QQQQ....',
    '....QQQq..QQQq....',
    '....CCCq..CCCq....',
    '...KKKKk..KKKKk...',
    '...zZzkk..zZzkk...',
  ],
  run2: [  // pierna izquierda levantada
    CINTURON,
    '....QQQqQQQqQQ....',
    '....QqqQQQQqqQ....',
    '....QqqQQQQqqQ....',
    '....QQQQ..QQQQ....',
    '....QQQQ..QQQQ....',
    '....CCCq..QQQq....',
    '....KKKk..zzzz....',
    '....kkZk..kKKKK...',
    '..........kKKKK...',
  ],
  salto: [
    CINTURON,
    '....QqqQQQQqqQ....',
    '....QqqQQQQqqQ....',
    '....QQQQ..QQQQ....',
    '....QQQq..QQQq....',
    '....CCCq..CCCq....',
    '....KKKk..KKKk....',
    '....zZzk..zZzk....',
    '..................',
    '..................',
  ],
  agachado: [
    CINTURON,
    '....QQQqQQQqQQ....',
    '...QQQQqQQQqQQQQ..',
    '...CCCq....qCCC...',
    '..KKKKk....kKKKK..',
    '..zZzkk....kkzZz..',
  ],
};

const RUN_SEQ = ['run0', 'run1', 'run2', 'run1'];
const BOB     = [0, 1, 0, 1];

// ── Pintado ───────────────────────────────────
function blit(ctx, mapa, pal, ox, oy, P, filas) {
  let out = 0;
  const arr = Array.isArray(mapa) ? mapa : null;
  const n   = arr ? arr.length : 0;
  for (let r = 0; r < n; r++) {
    if (filas && filas.has(r)) continue;
    const fila = arr[r];
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
  const arr = [];
  for (let r = 0; r < UPPER_H; r++) arr.push(filasObj[r] || '');
  blit(ctx, arr, pal, ox, oy, P, filas);
}

function peloEnMovimiento(paso) {
  const mapa = { ...PELO_LARGO_ESPALDA };
  const dir  = paso === 0 ? -1 : paso === 2 ? 1 : 0;
  if (!dir) return mapa;
  for (let r = 15; r <= 21; r++) {
    const fila = mapa[r];
    if (!fila) continue;
    mapa[r] = dir < 0 ? `${fila.slice(1)}.` : `.${fila.slice(0, -1)}`;
  }
  return mapa;
}

// ── Brazos con manga + pulsera ────────────────
function brazo(ctx, pal, x, y, largo, P, sombraOn, balanceo = 0) {
  for (let i = 0; i < largo; i++) {
    const quiebre = i < 2 ? 0 : balanceo === 1 ? 1 : balanceo === -1 ? -1 : 0;
    const esManga = i < 3;
    const esMano  = i === largo - 1;
    ctx.fillStyle = esMano
      ? pal.s
      : esManga
        ? (sombraOn ? pal.n : pal.N)
        : (sombraOn ? pal.s : pal.S);
    ctx.fillRect(x + quiebre * P, y + i * P, 2 * P, P);
    // pulsera dorada en la muñeca
    if (i === largo - 2) {
      ctx.fillStyle = pal.W;
      ctx.fillRect(x + quiebre * P, y + i * P, P, P);
    }
  }
  const manoX = x + (largo < 5 ? 0 : balanceo) * P;
  ctx.fillStyle = pal.s;
  ctx.fillRect(manoX, y + largo * P, P, P);
}

// ── API pública ───────────────────────────────
/**
 * Dibuja al personaje con los pies en (x, y).
 * opts: { vista, frame, correr, aire, agachar, lean, victoria, P }
 */
export function drawPersonaje(ctx, x, y, av, opts = {}) {
  const {
    vista    = 'espalda',
    frame    = 0,
    correr   = false,
    aire     = false,
    victoria = false,
    agachar  = false,
    lean     = 0,
  } = opts;
  const P    = opts.P || SPR_P;
  const pal  = paletaAvatar(av);
  const paso = Math.floor(frame / 4) % 4;

  const legKey = agachar ? 'agachado' : aire ? 'salto' : correr ? RUN_SEQ[paso] : 'run1';
  let legs     = LEGS[legKey];
  const top    = legs.findIndex((f) => /[^.]/.test(f));

  if (vista === 'frente') {
    legs = legs.map((f, i) => (i === 0 ? CINTURON_F : f.replace(/q/g, 'Q')));
  }
  if (av && av.ropa === 'short') {
    const cortas = legKey === 'agachado' ? 2 : 4;
    legs = legs.map((f, i) =>
      i - top < cortas
        ? f.replace(/[QqG]/g, (m) => (m === 'q' ? 't' : m === 'G' ? 'G' : 'T'))
        : f.replace(/[QC]/g, 'S').replace(/q/g, 's')
    );
  }

  const bob      = correr && !agachar && !aire ? BOB[paso] : 0;
  const ox       = Math.round(x) - CENTRO * P;
  const legsY    = Math.round(y) - legs.length * P;
  const legsTopY = legsY + top * P;

  const filasFuera = agachar ? new Set([TORSO_DESDE + 1, TORSO_DESDE + 2]) : null;
  const quitadas   = filasFuera ? filasFuera.size : 0;
  const upperY     = legsTopY - (UPPER_H - quitadas) * P - bob * P;
  const uox        = ox + lean * P;

  // Piernas
  blit(ctx, legs, pal, ox, legsTopY - top * P, P);

  // Balanceo de brazos
  let izq = 0, der = 0;
  if (aire || victoria) { izq = 1; der = 1; }
  else if (correr) {
    const f = [[-1, 1], [0, 0], [1, -1], [0, 0]][paso];
    izq = f[0]; der = f[1];
  }
  const largoBase    = agachar ? 4 : 6;
  const yBrazo       = upperY + TORSO_DESDE * P;
  const dibujaBrazos = () => {
    const L  = (s) => (s === 1 ? largoBase - 2 : s === -1 ? largoBase + 1 : largoBase);
    const dy = (s) => (s === 1 ? -P : s === -1 ? P : 0);
    const dx = (s) => (s === -1 ? P : 0);
    brazo(ctx, pal, uox + 2 * P - dx(izq),  yBrazo + dy(izq),  L(izq),  P, false, izq);
    brazo(ctx, pal, uox + 14 * P + dx(der), yBrazo + dy(der), L(der), P, false, der);
  };

  // Cuerpo superior
  const mujer = av && av.genero === 'mujer';
  const base  = mujer
    ? (vista === 'frente' ? FRENTE_MUJER : ESPALDA_MUJER)
    : (vista === 'frente' ? FRENTE       : ESPALDA);
  blit(ctx, base, pal, uox, upperY, P, filasFuera);

  if (mujer) {
    const pelo = vista === 'frente' ? PELO_LARGO_FRENTE : peloEnMovimiento(paso);
    blitDisperso(ctx, pelo, pal, uox, upperY, P, filasFuera);
  }

  dibujaBrazos();
}
