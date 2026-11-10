// ─── VALIDACIONES PARA INICIAR PARTIDA ───
// Única fuente de verdad de las dificultades que acepta el juego y la base de datos.
export const DIFICULTADES = ['facil', 'intermedio', 'dificil'];

export const esDificultadValida = (d) => typeof d === 'string' && DIFICULTADES.includes(d);

export const MSG_FALTA_DIFICULTAD = 'Debes seleccionar una dificultad antes de comenzar';
export const MSG_ELIGE_DIFICULTAD = 'Selecciona una dificultad para continuar';
