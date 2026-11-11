const Q_RANGE = {
  facil: [12000, 22000],
  intermedio: [8000, 16000],
  dificil: [5000, 10000],
};

export function proximoDelay(dificultad) {
  const [min, max] = Q_RANGE[dificultad] || Q_RANGE.intermedio;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

