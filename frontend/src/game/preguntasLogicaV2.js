const Q_RANGE = {
  facil: [36000, 45000],
  intermedio: [32000, 40000],
  dificil: [28000, 36000],
};

const Q_FIRST_RANGE = {
  facil: [40000, 48000],
  intermedio: [36000, 44000],
  dificil: [32000, 40000],
};

export function proximoDelay(dificultad, primera = false) {
  const rangos = primera ? Q_FIRST_RANGE : Q_RANGE;
  const [min, max] = rangos[dificultad] || rangos.intermedio;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

