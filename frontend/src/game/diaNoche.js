// ═══════════════════════════════════════════════
//  CICLO DÍA/NOCHE
// ═══════════════════════════════════════════════
export const DAY_SPEED = 0.00006;

export function isNight(dayTime) {
  const t = ((dayTime % 1) + 1) % 1;
  return t > 0.6 || t < 0.15; // noche/amanecer
}

export function timeLabel(dayTime) {
  const labels = ['🌅 Amanecer', '☀️ Día', '🌇 Atardecer', '🌙 Noche'];
  const idx = Math.floor(((dayTime % 1 + 1) % 1) * 4);
  return labels[idx];
}
