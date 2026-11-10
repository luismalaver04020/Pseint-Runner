// ─── CONFIGURACIÓN DE LAS 4 ZONAS DEL PERÚ ───

export const ZONAS = {

  rocosa: {
    id: 'rocosa', nombre: '🏔️ Sierra Andina', unidad: 'unidad1',
    skyTop: '#1a6eaf', skyMid: '#4a9fd4', skyBot: '#c5dff5',
    groundDay: '#8B5E3C', groundNight: '#4a3020',
    roadColor: '#8B7355', fogDay: '100,80,50', fogNight: '40,25,10',
    combiBody: '#C05621', combiTop: '#E07B39',
    obsPool: ['roca', 'llama', 'hueco', 'cono', 'combi', 'bajo'],
    mapX: 0.62, mapY: 0.05, mapW: 0.35, mapH: 0.25,
    mapColor: '#C2813A',
    info: '📘 Unidad 1 · Estructura Secuencial (Semanas 1-6)\nAlgoritmos, lógica, pseudocódigo, tipos de datos.',
  },
  selva: {
    id: 'selva', nombre: '🌿 Amazonía', unidad: 'unidad2',
    skyTop: '#0d3b0d', skyMid: '#1a6b1a', skyBot: '#4a9b4a',
    groundDay: '#4a1f0a', groundNight: '#2d0f05',
    roadColor: '#5a3520', fogDay: '30,70,30', fogNight: '10,30,10',
    combiBody: '#2d5e2d', combiTop: '#1a3d1a',
    obsPool: ['tronco', 'hueco', 'roca', 'cono', 'combi', 'bajo', 'bajo'],
    mapX: 0.62, mapY: 0.32, mapW: 0.35, mapH: 0.28,
    mapColor: '#22c55e',
    info: '📙 Unidad 2 · Estructuras Condicionales (Semanas 7-12)\nSi, SiNo, Según, operadores relacionales y lógicos.',
  },
  costera: {
    id: 'costera', nombre: '🌊 Costa del Pacífico', unidad: 'unidad3',
    skyTop: '#8a9cb0', skyMid: '#b0c0cc', skyBot: '#d5e5ee',
    groundDay: '#c8b870', groundNight: '#5a5030',
    roadColor: '#555566', fogDay: '100,130,160', fogNight: '30,50,80',
    combiBody: '#D4B850', combiTop: '#E8CC60',
    obsPool: ['ambulante', 'hueco', 'cono', 'taxi', 'combi', 'bajo'],
    mapX: 0.0, mapY: 0.05, mapW: 0.28, mapH: 0.55,
    mapColor: '#38bdf8',
    info: '📗 Unidad 3 · Estructuras Repetitivas (Semanas 13-18)\nPara, Mientras, Repetir-HastaQue, acumuladores.',
  },
  ciudad: {
    id: 'ciudad', nombre: '🏙️ Lima Urbana', unidad: 'all',
    skyTop: '#03050f', skyMid: '#08122e', skyBot: '#1a2a4a',
    groundDay: '#2a2a36', groundNight: '#1a1a28',
    roadColor: '#2a2a3a', fogDay: '20,20,40', fogNight: '5,5,20',
    combiBody: '#7B2FBE', combiTop: '#9333EA',
    obsPool: ['taxi', 'mototaxi', 'cono', 'hueco', 'combi', 'ambulante', 'roca', 'bajo'],
    mapX: 0.10, mapY: 0.60, mapW: 0.80, mapH: 0.38,
    mapColor: '#a78bfa',
    info: '🎓 Nivel Final · Todo el sílabo mezclado\nU1 + U2 + U3 combinados. Mayor velocidad y dificultad.',
  },
};

export const ZONAS_ORDEN = ['rocosa', 'selva', 'costera', 'ciudad'];

export const DIFICULTAD_CONFIG = {
  facil:      { lives: 6, speed: 4, nextPowerup: 2000,  qRange: [12000, 22000], dmg: 1, label: '🟢 Fácil' },
  intermedio: { lives: 4, speed: 5, nextPowerup: 3500,  qRange: [8000,  16000], dmg: 1, label: '🟡 Intermedio' },
  dificil:    { lives: 2, speed: 6, nextPowerup: 6000,  qRange: [5000,  10000], dmg: 2, label: '🔴 Difícil' },
};
