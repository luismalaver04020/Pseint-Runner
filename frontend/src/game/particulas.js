// ═══════════════════════════════════════════════
//  PARTÍCULAS
// ═══════════════════════════════════════════════
export function burst(parts, x, y, col) {
  for (let i = 0; i < 12; i++) {
    parts.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 4 - 1,
      life: 28, maxL: 28, col,
      r: 3 + Math.random() * 3,
    });
  }
}

export function updateParticles(parts) {
  parts.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life--;
  });
  return parts.filter((p) => p.life > 0);
}

export function renderParticles(ctx, parts) {
  parts.forEach((p) => {
    ctx.globalAlpha = p.life / p.maxL;
    ctx.beginPath();
    ctx.arc(p.x, p.y, (p.r * p.life) / p.maxL, 0, Math.PI * 2);
    ctx.fillStyle = p.col;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}
