// Resolución virtual y ajuste de píxeles del Canvas 2D.

export const PSX_WIDTH = 320;
export const PSX_HEIGHT = 240;

export function configurePSXCanvas(ctx) {
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
}

export function snapPSX(value, step = 1) {
  return Math.round(value / step) * step;
}
