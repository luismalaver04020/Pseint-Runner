// ─── MODO "SIN REGISTRO" ───
// Cuando juega un docente/administrador (modo prueba) o alguien en la demo,
// la partida NO cuenta en el ranking ni en las estadísticas del grupo.
let sinRegistro = false;
export const setSinRegistro = (v) => { sinRegistro = !!v; };
export const esSinRegistro = () => sinRegistro;
