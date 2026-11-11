// ─── EVALUADOR DE PREGUNTAS DE CÓDIGO (Node analiza, ejecuta y decide) ───
//
//   código del alumno ──► parser.js ──► estructura del programa ─┐
//                    └──► interprete.js ──► salida de cada caso ─┴──► juez.js ──► veredicto
//
// `config` es el contenido de `evaluation_config` de la pregunta (ver docs/EVALUACION_CODIGO.md).
import { analizarCodigo } from './parser.js';
import { ejecutarCodigo } from './interprete.js';
import { juzgarEnJavaScript } from './juez.js';

// Límites: protegen al servidor (el intérprete ya corta a 100 000 instrucciones por caso).
export const LIMITES = {
  caracteresCodigo: 6000,
  casos: 30,
  entradasPorCaso: 100,
  lineasSalida: 200,
  caracteresLinea: 300,
};

// Tipos de instrucción que reconoce parser.js (se usan en requiere / prohibe / minimos).
export const TIPOS_INSTRUCCION = [
  'DECLARACION', 'DIMENSION', 'LECTURA', 'ESCRITURA', 'ASIGNACION',
  'CONDICIONAL', 'SINO', 'FIN_CONDICIONAL',
  'PARA', 'FIN_PARA', 'MIENTRAS', 'FIN_MIENTRAS', 'REPETIR', 'HASTA_QUE',
  'EXPRESION', 'COMENTARIO',
];

const MODOS = ['exacto', 'subsecuencia', 'contiene', 'numeros', 'semantico'];

export class ConfigInvalida extends Error {}
export class CodigoInvalido extends Error {}

// ── 1. Validar y normalizar la configuración que viene de la base de datos ──
export function normalizarConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new ConfigInvalida('la configuración está vacía');
  }

  const casosEntrada = config.casos ?? [];
  if (!Array.isArray(casosEntrada)) throw new ConfigInvalida('"casos" debe ser una lista');
  if (casosEntrada.length > LIMITES.casos) throw new ConfigInvalida(`máximo ${LIMITES.casos} casos de prueba`);

  const casos = casosEntrada.map((c, i) => {
    if (!c || typeof c !== 'object') throw new ConfigInvalida(`el caso ${i + 1} no es un objeto`);
    const entradas = c.entradas ?? [];
    if (!Array.isArray(entradas) || entradas.length > LIMITES.entradasPorCaso) {
      throw new ConfigInvalida(`"entradas" del caso ${i + 1} debe ser una lista corta`);
    }
    const salida = Array.isArray(c.salida)
      ? c.salida.map(String)
      : String(c.salida ?? '').split('\n').filter((l) => l.length > 0);
    if (salida.length === 0) throw new ConfigInvalida(`el caso ${i + 1} no tiene "salida" esperada`);
    return {
      id: i + 1,
      entradas: entradas.map(String),
      salida: salida.map(recortar),
      visible: c.visible !== false && c.oculto !== true,
    };
  });

  const est = config.estructura ?? {};
  const listaDeTipos = (valor, nombre) => {
    const lista = valor ?? [];
    if (!Array.isArray(lista)) throw new ConfigInvalida(`"${nombre}" debe ser una lista`);
    for (const t of lista) {
      if (!TIPOS_INSTRUCCION.includes(t)) throw new ConfigInvalida(`"${nombre}": tipo desconocido «${t}»`);
    }
    return lista;
  };
  const listaDeTextos = (valor, nombre) => {
    const lista = valor ?? [];
    if (!Array.isArray(lista) || lista.some((t) => typeof t !== 'string' || !t.trim())) {
      throw new ConfigInvalida(`"${nombre}" debe ser una lista de textos`);
    }
    return lista.map((t) => t.trim());
  };

  const minimos = est.minimos ?? {};
  if (typeof minimos !== 'object' || Array.isArray(minimos)) throw new ConfigInvalida('"minimos" debe ser un objeto');
  for (const [tipo, n] of Object.entries(minimos)) {
    if (!TIPOS_INSTRUCCION.includes(tipo)) throw new ConfigInvalida(`"minimos": tipo desconocido «${tipo}»`);
    if (!Number.isInteger(n) || n < 1) throw new ConfigInvalida(`"minimos.${tipo}" debe ser un entero ≥ 1`);
  }

  const cmp = config.comparacion ?? {};
  const modo = cmp.modo ?? 'exacto';
  if (!MODOS.includes(modo)) throw new ConfigInvalida(`"comparacion.modo" debe ser: ${MODOS.join(', ')}`);
  const tolerancia = cmp.tolerancia ?? 0.000001;
  if (typeof tolerancia !== 'number' || !(tolerancia >= 0)) throw new ConfigInvalida('"comparacion.tolerancia" debe ser un número ≥ 0');

  const reglas = {
    requiere: listaDeTipos(est.requiere, 'requiere'),
    prohibe: listaDeTipos(est.prohibe, 'prohibe'),
    minimos,
    requiere_texto: listaDeTextos(est.requiere_texto, 'requiere_texto'),
    prohibe_texto: listaDeTextos(est.prohibe_texto, 'prohibe_texto'),
    ignorar_mayusculas: cmp.ignorar_mayusculas === false ? 'no' : 'si',
    tolerancia,
    modo,
  };

  const hayReglas = reglas.requiere.length || reglas.prohibe.length || reglas.requiere_texto.length ||
    reglas.prohibe_texto.length || Object.keys(minimos).length;
  if (casos.length === 0 && !hayReglas) {
    throw new ConfigInvalida('no define casos de prueba ni reglas de estructura');
  }

  return { casos, reglas };
}

// ── Compatibilidad con preguntas existentes (keywords/min_ratio) ──
// En lugar de aceptar por palabras clave, ejecuta la respuesta de referencia y
// compara el comportamiento del alumno con ella ante varias entradas.
// Las preguntas legacy no declaran el dominio de sus entradas. Usamos valores
// positivos por defecto (adecuados para medidas, cantidades y divisores) y
// añadimos negativos/cero solo cuando el enunciado pide evaluar esos casos.
const VECTORES_NUMERICOS = [
  [1, 2, 3, 4], [2, 5, 7, 3], [10, 3, 2, 7], [4, 2, 8, 6],
  [9, 5, 3, 2], [6, 8, 4, 7], [3, 9, 2, 5], [10, 4, 6, 8],
  [7, 1, 20, 3], [5, 2, 8, 11], [4, 8, 12, 16], [9, 3, 7, 2],
];
const VECTORES_NUMERICOS_CON_SIGNO = [
  [0, 0, 0, 0], [1, 2, 3, 4], [-1, 5, 10, 2], [10, -3, 2, 7],
  [2, 2, 2, 2], [100, 0, -5, 1], [3, 9, -2, 5], [-10, -4, 6, 8],
  [7, 1, 20, -3], [50, -20, 0, 11], [4, 8, 12, 16], [99, 3, -7, 2],
];
const VECTORES_TEXTO = ['', 'a', 'Hola', '0', 'Z', 'Peru', 'x', '123', 'cadena', 'b', 'test', 'ñ'];
const VECTORES_LOGICOS = ['Verdadero', 'Falso'];

function entradasDeReferencia(codigoReferencia) {
  const analisis = analizarCodigo(codigoReferencia);
  const tipos = new Map();
  for (const i of analisis.instrucciones) {
    if (i.tipo !== 'DECLARACION') continue;
    const m = i.codigo.match(/^Definir\s+(.+?)\s+Como\s+(Entero|Real|Cadena|Caracter|Logico)$/i);
    if (!m) continue;
    for (const nombre of m[1].split(',')) tipos.set(nombre.trim().toLowerCase(), m[2].toLowerCase());
  }
  const nombres = [];
  for (const i of analisis.instrucciones) {
    if (i.tipo !== 'LECTURA') continue;
    const m = i.codigo.match(/^Leer\s+(.+)$/i);
    if (m) for (const nombre of m[1].split(',')) nombres.push(nombre.trim().toLowerCase());
  }
  return nombres.map((nombre) => {
    const tipo = tipos.get(nombre);
    if (!tipo) throw new ConfigInvalida(`la respuesta de referencia lee «${nombre}», pero no declara su tipo`);
    return tipo;
  });
}

function generarEntradas(tipos, enunciado = '') {
  if (!tipos.length) return [[]];
  const cantidadCasos = 12;
  const requiereSignos = /\b(negativ[oa]s?|menor(?:es)?\s+que\s+cero|positiv[oa]s?\s+y\s+negativ[oa]s?|cero)\b/i.test(enunciado);
  const vectores = requiereSignos ? VECTORES_NUMERICOS_CON_SIGNO : VECTORES_NUMERICOS;
  // Se preparan hasta 30 repeticiones del patrón de Leer. Esto también cubre
  // ejercicios que leen datos dentro de un ciclo (sin exigir que el alumno
  // tenga exactamente la misma estructura que la referencia).
  const tiposDeEntrada = Array.from({ length: Math.min(30, Math.ceil(100 / tipos.length)) }, () => tipos).flat().slice(0, LIMITES.entradasPorCaso);
  return Array.from({ length: cantidadCasos }, (_, caso) => tiposDeEntrada.map((tipo, indice) => {
    const variable = indice % tipos.length;
    const repeticion = Math.floor(indice / tipos.length);
    const pos = (caso + repeticion * 2 + variable * 3) % vectores.length;
    if (tipo === 'entero') return String(Math.trunc(vectores[pos][variable % 4]));
    if (tipo === 'real') return String(vectores[pos][variable % 4] + ((caso + repeticion + variable) % 3 === 0 ? 0.5 : 0));
    if (tipo === 'cadena') return VECTORES_TEXTO[(caso + repeticion + variable * 2) % VECTORES_TEXTO.length];
    if (tipo === 'caracter') return ['a', 'Z', '0', 'ñ', 'x', 'b'][(caso + repeticion + variable) % 6];
    if (tipo === 'logico') return VECTORES_LOGICOS[(caso + repeticion + variable) % 2];
    throw new ConfigInvalida(`tipo de entrada no soportado en la referencia: ${tipo}`);
  }));
}

export async function evaluarContraReferencia(codigo, referencia, configAntigua = {}, enunciado = '', juzgador = evaluarCodigo) {
  if (typeof referencia !== 'string' || !referencia.trim()) {
    throw new ConfigInvalida('la pregunta usa configuración antigua y no tiene expected_answer de referencia');
  }
  let entradas;
  let tiposEntrada;
  try {
    tiposEntrada = entradasDeReferencia(referencia);
    entradas = generarEntradas(tiposEntrada, enunciado);
  }
  catch (e) {
    if (e instanceof ConfigInvalida) throw e;
    throw new ConfigInvalida(`no se pudo analizar la respuesta de referencia: ${e.message}`);
  }

  const casos = [];
  for (let i = 0; i < entradas.length; i++) {
    let esperado;
    try {
      esperado = ejecutarCodigo(referencia, entradas[i]).lineas;
    } catch {
      // Una entrada generada puede quedar fuera del dominio del ejercicio
      // (por ejemplo, división entre cero). No debe inutilizar toda la pregunta.
      continue;
    }
    if (!esperado.length) throw new ConfigInvalida('la respuesta de referencia no produce ninguna salida');
    casos.push({ entradas: entradas[i], salida: esperado, visible: i < 4 });
  }

  if (casos.length < (tiposEntrada.length ? 4 : 1)) {
    throw new ConfigInvalida('la respuesta de referencia no pudo ejecutarse con suficientes entradas válidas');
  }

  // keywords/min_ratio son metadatos antiguos, no condiciones obligatorias:
  // exigirlos impediría aceptar soluciones equivalentes con otras estructuras.
  return juzgador(codigo, {
    casos,
    estructura: {},
    comparacion: { modo: 'semantico', ignorar_mayusculas: true, tolerancia: 0.000001 },
  });
}

const recortar = (t) => String(t).slice(0, LIMITES.caracteresLinea);

// ── 2. Ejecutar el código con las entradas de un caso ──
function ejecutarCaso(codigo, caso) {
  try {
    const r = ejecutarCodigo(codigo, caso.entradas);
    const lineas = r.lineas.slice(0, LIMITES.lineasSalida).map(recortar);
    return {
      estado: 'ok',
      mensaje: '',
      lineas: quitarMensajesDeEntrada(lineas, caso.salida),
    };
  } catch (e) {
    return { estado: 'error', mensaje: String(e?.message ?? e).slice(0, 200), lineas: [] };
  }
}

// Los mensajes que piden datos al jugador son interfaz, no resultado del algoritmo.
// Se quitan antes de comparar para que `Escribir "Ingrese..."` no invalide una salida
// correcta. Las líneas esperadas se conservan aunque su texto parezca una solicitud.
function quitarMensajesDeEntrada(lineas, esperadas) {
  const normalizar = (texto) => String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es');
  const salidasEsperadas = new Set(esperadas.map(normalizar));
  const esSolicitud = /^(?:por favor[,:]?\s*)?(?:ingrese|ingresa|introduzca|introduce|digite|digita|escriba|escribe|proporcione|proporciona|indique|indica|capture|captura)\b/i;

  return lineas.filter((linea) => {
    const texto = normalizar(linea);
    return salidasEsperadas.has(texto) || !esSolicitud.test(texto);
  });
}

// ── 3. Evaluar: ejecuta los casos, aplica las reglas y presenta el resultado ──
export async function evaluarCodigo(codigo, configCruda, juzgador = juzgarEnJavaScript) {
  if (typeof codigo !== 'string' || !codigo.trim()) throw new CodigoInvalido('Escribe tu código antes de enviarlo');
  if (codigo.length > LIMITES.caracteresCodigo) throw new CodigoInvalido('El código es demasiado largo');

  const { casos, reglas } = normalizarConfig(configCruda);

  const entrada = { programa: [], reglas, casos: [] };
  let ejecuciones = [];

  try {
    const analisis = analizarCodigo(codigo);
    entrada.programa = analisis.instrucciones.map((i) => [i.linea, i.tipo, i.codigo]);
    ejecuciones = casos.map((caso) => ejecutarCaso(codigo, caso));
    entrada.casos = casos.map((caso, i) => ({
      id: caso.id,
      visible: caso.visible ? 'si' : 'no',
      estado: ejecuciones[i].estado,
      mensaje: ejecuciones[i].mensaje,
      esperado: caso.salida,
      obtenido: ejecuciones[i].lineas,
    }));
  } catch (e) {
    // El parser rechazó el código: el veredicto igualmente lo emite Prolog.
    entrada.error_sintaxis = String(e?.message ?? e).slice(0, 200);
    entrada.casos = casos.map((c) => ({ id: c.id }));
  }

  const juicio = await juzgador(entrada);
  return presentar(juicio, casos, ejecuciones);
}

// ── 4. Resultado para el frontend: los casos ocultos no revelan datos ──
function presentar(juicio, casos, ejecuciones) {
  const correcto = juicio.veredicto === 'correcto';
  const motivos = juicio.motivos ?? [];

  const detalleCasos = (juicio.casos ?? []).map((r) => {
    const caso = casos.find((c) => c.id === r.id);
    const ejecucion = ejecuciones[r.id - 1];
    const base = { id: r.id, paso: r.paso === 'si', visible: caso.visible };
    if (!caso.visible) return base;
    return {
      ...base,
      entradas: caso.entradas,
      esperado: caso.salida,
      obtenido: ejecucion?.lineas ?? [],
      ...(r.causa === 'error_ejecucion' ? { error: r.detalle } : {}),
    };
  });

  return {
    correcto,
    mensaje: redactarMensaje(correcto, motivos, detalleCasos, juicio.casos_ok, juicio.casos_total),
    casos_ok: juicio.casos_ok,
    casos_total: juicio.casos_total,
    motivos,
    casos: detalleCasos,
  };
}

const NOMBRE_TIPO = {
  DECLARACION: 'una declaración con Definir', DIMENSION: 'una dimensión con Dimension',
  LECTURA: 'una lectura con Leer', ESCRITURA: 'una salida con Escribir',
  ASIGNACION: 'una asignación (<-)', CONDICIONAL: 'un condicional Si', SINO: 'un SiNo', FIN_CONDICIONAL: 'un FinSi',
  PARA: 'un ciclo Para', FIN_PARA: 'un FinPara', MIENTRAS: 'un ciclo Mientras', FIN_MIENTRAS: 'un FinMientras',
  REPETIR: 'un ciclo Repetir', HASTA_QUE: 'un Hasta Que', EXPRESION: 'una expresión', COMENTARIO: 'un comentario',
};
const nombreTipo = (t) => NOMBRE_TIPO[t] ?? t;

function redactarMensaje(correcto, motivos, casos, casosOk, casosTotal) {
  if (correcto) return '¡Correcto! Tu código cumple con lo pedido.';

  const motivo = motivos[0];
  if (motivo?.codigo === 'error_sintaxis') {
    return motivo.detalle
      ? `Hay un error de sintaxis: ${motivo.detalle}`
      : 'Hay un error de sintaxis. Revisa cómo escribiste las instrucciones.';
  }
  if (motivo?.codigo === 'falta_estructura') return `Falta usar ${nombreTipo(motivo.tipo)}.`;
  if (motivo?.codigo === 'estructura_prohibida') return `Quita ${nombreTipo(motivo.tipo)}; este ejercicio no la pide.`;
  if (motivo?.codigo === 'pocas_estructuras') return `Agrega ${nombreTipo(motivo.tipo)}.`;
  if (motivo?.codigo === 'falta_palabra') return `Falta usar «${motivo.palabra}».`;
  if (motivo?.codigo === 'palabra_prohibida') return `Quita «${motivo.palabra}» de tu código.`;

  const casoFallido = casos.find((caso) => !caso.paso && caso.visible);
  if (casoFallido?.error) return 'El código no se pudo ejecutar. Revisa las instrucciones y los índices.';
  if (casoFallido) return 'La respuesta que muestra tu código no coincide con la esperada.';
  return 'Tu código no cumple con lo pedido. Revisa la lógica del algoritmo.';
}

const describirEntradas = (e) => (e.length ? `las entradas ${e.join(', ')}` : 'este caso');
