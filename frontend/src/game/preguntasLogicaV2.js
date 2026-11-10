const Q_RANGE = {
  facil: [12000, 22000],
  intermedio: [8000, 16000],
  dificil: [5000, 10000],
};

export function proximoDelay(dificultad) {
  const [min, max] = Q_RANGE[dificultad] || Q_RANGE.intermedio;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const INFO_UNIDADES = {
  unidad1: {
    clave: 'unidad1',
    titulo: 'Unidad 1',
    tema: 'Estructura Secuencial',
    icono: '📘',
  },
  unidad2: {
    clave: 'unidad2',
    titulo: 'Unidad 2',
    tema: 'Estructuras Condicionales',
    icono: '📙',
  },
  unidad3: {
    clave: 'unidad3',
    titulo: 'Unidad 3',
    tema: 'Estructuras Repetitivas',
    icono: '📗',
  },
};
