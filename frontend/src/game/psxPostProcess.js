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

  // Conserva un toque retro sin las franjas RGB que formaban una cuadrícula
  // muy visible al ampliar el canvas en pantallas grandes.
  ctx.fillStyle = 'rgba(4, 9, 20, .035)';
  for (let y = frame % 4; y < H; y += 4) ctx.fillRect(0, y, W, 1);

  // Viñeta suave: enmarca la escena sin apagar el cielo ni los bordes.
  const vignette = ctx.createRadialGradient(W / 2, H * .46, H * .2, W / 2, H * .46, W * .78);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(.72, "rgba(3,10,24,.025)");
  vignette.addColorStop(1, "rgba(3,10,24,.22)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(190, 224, 238, .08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.restore();
}
