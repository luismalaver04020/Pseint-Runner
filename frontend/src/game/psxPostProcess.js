// Postprocesado retro para Canvas 2D. El proyecto no usa WebGL, por lo que
// este módulo reproduce el acabado PS1/CRT sin depender de shaders GLSL.

export const PSX_WIDTH = 320;
export const PSX_HEIGHT = 240;

export function configurePSXCanvas(ctx) {
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
}

export function snapPSX(value, step = 1) {
  return Math.round(value / step) * step;
}

export function renderCRT(ctx, W, H, frame) {
  ctx.save();

  // Scanlines: alternan luminosidad por línea, visibles al escalar 320×240.
  ctx.fillStyle = "rgba(1, 7, 20, .16)";
  for (let y = frame % 2; y < H; y += 2) ctx.fillRect(0, y, W, 1);

  // Máscara RGB discreta, equivalente a la separación cromática de una CRT.
  ctx.globalAlpha = .10;
  for (let x = 0; x < W; x += 3) {
    ctx.fillStyle = x % 9 === 0 ? "#ff376e" : x % 9 === 3 ? "#4ce5ff" : "#667cff";
    ctx.fillRect(x, 0, 1, H);
  }

  // Viñeta y esquinas curvas de televisión antigua.
  ctx.globalAlpha = 1;
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * .18, W / 2, H / 2, W * .72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(.72, "rgba(0,4,18,.05)");
  vignette.addColorStop(1, "rgba(0,0,0,.48)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(110, 235, 255, .25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.restore();
}
