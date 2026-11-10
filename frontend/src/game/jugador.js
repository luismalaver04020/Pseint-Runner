// ═══════════════════════════════════════════════
//  JUGADOR — física vertical (salto) + carriles (izq/centro/der)
// ═══════════════════════════════════════════════
export const LANES = [-1, 0, 1]; // izquierda, centro, derecha

export function crearJugador() {
  return {
    lane: 0,           // carril objetivo (-1, 0, 1)
    laneVisual: 0,      // posición suavizada (para animar el deslizamiento)
    jumpOffset: 0,      // 0 = en el piso, negativo = altura de salto (px)
    pvy: 0,
    onGround: true,
    doubleJumped: false,
    duck: false,
  };
}

export function moverCarril(jugador, dir) {
  const idx = LANES.indexOf(jugador.lane);
  const nuevo = LANES[Math.min(2, Math.max(0, idx + dir))];
  jugador.lane = nuevo;
}

export function actualizarLane(jugador) {
  jugador.laneVisual += (jugador.lane - jugador.laneVisual) * 0.22;
}

// Salto / doble salto. Devuelve true si el salto se ejecutó.
export function saltar(jugador, H, parts, screenX, screenY) {
  if (jugador.onGround) {
    jugador.pvy = -H * 0.03;
    jugador.onGround = false;
    return true;
  }
  if (!jugador.doubleJumped) {
    jugador.pvy = -H * 0.024;
    jugador.doubleJumped = true;
    if (parts) {
      parts.push({
        x: screenX ?? 0, y: screenY ?? 0,
        vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 4 - 1,
        life: 28, maxL: 28, col: "#80aaff", r: 3 + Math.random() * 3,
      });
    }
    return true;
  }
  return false;
}

export function actualizarFisica(jugador, H) {
  jugador.pvy += H * 0.002; // gravedad
  jugador.jumpOffset += jugador.pvy;
  if (jugador.jumpOffset >= 0) {
    jugador.jumpOffset = 0;
    jugador.pvy = 0;
    jugador.onGround = true;
    jugador.doubleJumped = false;
  }
}
