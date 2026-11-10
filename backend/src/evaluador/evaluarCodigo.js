// ─── EVALUADOR DE PREGUNTAS DE CÓDIGO (Node prepara · Prolog decide) ───
//
//   código del alumno ──► parser.js ──► estructura del programa ─┐
//                    └──► interprete.js ──► salida de cada caso ─┴──► reglas.pl (Prolog) ──► veredicto
//
// `config` es el contenido de `evaluation_config` de la pregunta (ver docs/EVALUACION_PROLOG.md).
import { analizarCodigo } from './parser.js';
import { ejecutarCodigo } from './interprete.js';
import { juzgarEnProlog } from './prolog.js';

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
  'DECLARACION', 'LECTURA', 'ESCRITURA', 'ASIGNACION',
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
const VECTORES_NUMERICOS = [
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

function generarEntradas(tipos) {
  if (!tipos.length) return [[]];
  const cantidadCasos = 12;
  // Se preparan hasta 30 repeticiones del patrón de Leer. Esto también cubre
  // ejercicios que leen datos dentro de un ciclo (sin exigir que el alumno
  // tenga exactamente la misma estructura que la referencia).
  const tiposDeEntrada = Array.from({ length: Math.min(30, Math.ceil(100 / tipos.length)) }, () => tipos).flat().slice(0, LIMITES.entradasPorCaso);
  return Array.from({ length: cantidadCasos }, (_, caso) => tiposDeEntrada.map((tipo, indice) => {
    const variable = indice % tipos.length;
    const repeticion = Math.floor(indice / tipos.length);
    const pos = (caso + repeticion * 2 + variable * 3) % VECTORES_NUMERICOS.length;
    if (tipo === 'entero') return String(Math.trunc(VECTORES_NUMERICOS[pos][variable % 4]));
    if (tipo === 'real') return String(VECTORES_NUMERICOS[pos][variable % 4] + ((caso + repeticion + variable) % 3 === 0 ? 0.5 : 0));
    if (tipo === 'cadena') return VECTORES_TEXTO[(caso + repeticion + variable * 2) % VECTORES_TEXTO.length];
    if (tipo === 'caracter') return ['a', 'Z', '0', 'ñ', 'x', 'b'][(caso + repeticion + variable) % 6];
    if (tipo === 'logico') return VECTORES_LOGICOS[(caso + repeticion + variable) % 2];
    throw new ConfigInvalida(`tipo de entrada no soportado en la referencia: ${tipo}`);
  }));
}

export async function evaluarContraReferencia(codigo, referencia, configAntigua = {}) {
  if (typeof referencia !== 'string' || !referencia.trim()) {
    throw new ConfigInvalida('la pregunta usa configuración antigua y no tiene expected_answer de referencia');
  }
  let entradas;
  try { entradas = generarEntradas(entradasDeReferencia(referencia)); }
  catch (e) {
    if (e instanceof ConfigInvalida) throw e;
    throw new ConfigInvalida(`no se pudo analizar la respuesta de referencia: ${e.message}`);
  }

  const casos = [];
  for (let i = 0; i < entradas.length; i++) {
    let esperado;
    try {
      esperado = ejecutarCodigo(referencia, entradas[i]).lineas;
    } catch (e) {
      throw new ConfigInvalida(`la respuesta de referencia no se puede ejecutar en la prueba ${i + 1}: ${e.message}`);
    }
    if (!esperado.length) throw new ConfigInvalida('la respuesta de referencia no produce ninguna salida');
    casos.push({ entradas: entradas[i], salida: esperado, visible: i < 4 });
  }

  // keywords/min_ratio son metadatos antiguos, no condiciones obligatorias:
  // exigirlos impediría aceptar soluciones equivalentes con otras estructuras.
  return evaluarCodigo(codigo, {
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
    return { estado: 'ok', mensaje: '', lineas: r.lineas.slice(0, LIMITES.lineasSalida).map(recortar) };
  } catch (e) {
    return { estado: 'error', mensaje: String(e?.message ?? e).slice(0, 200), lineas: [] };
  }
}

// ── 3. Evaluar: arma los hechos, llama al juez Prolog y presenta el resultado ──
export async function evaluarCodigo(codigo, configCruda) {
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

  const juicio = await juzgarEnProlog(entrada);
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
    mensaje: redactarMensaje(correcto, motivos, detalleCasos),
    casos_ok: juicio.casos_ok,
    casos_total: juicio.casos_total,
    motivos,
    casos: detalleCasos,
  };
}

const NOMBRE_TIPO = {
  DECLARACION: 'una declaración con Definir', LECTURA: 'una lectura con Leer', ESCRITURA: 'una salida con Escribir',
  ASIGNACION: 'una asignación (<-)', CONDICIONAL: 'un condicional Si', SINO: 'un SiNo', FIN_CONDICIONAL: 'un FinSi',
  PARA: 'un ciclo Para', FIN_PARA: 'un FinPara', MIENTRAS: 'un ciclo Mientras', FIN_MIENTRAS: 'un FinMientras',
  REPETIR: 'un ciclo Repetir', HASTA_QUE: 'un Hasta Que', EXPRESION: 'una expresión', COMENTARIO: 'un comentario',
};
const nombreTipo = (t) => NOMBRE_TIPO[t] ?? t;

function redactarMensaje(correcto, motivos, casos) {
  if (correcto) return '✓ ¡CORRECTO! Tu algoritmo pasó todas las pruebas.';

  const lineas = [];
  for (const m of motivos) {
    switch (m.codigo) {
      case 'error_sintaxis': lineas.push(`✗ Error en tu código: ${m.detalle}`); break;
      case 'falta_estructura': lineas.push(`✗ Tu algoritmo debe usar ${nombreTipo(m.tipo)}.`); break;
      case 'estructura_prohibida': lineas.push(`✗ En este ejercicio no debes usar ${nombreTipo(m.tipo)}.`); break;
      case 'pocas_estructuras': lineas.push(`✗ Necesitas al menos ${m.minimo} de: ${nombreTipo(m.tipo)} (tienes ${m.encontrado}).`); break;
      case 'falta_palabra': lineas.push(`✗ Falta usar «${m.palabra}».`); break;
      case 'palabra_prohibida': lineas.push(`✗ No uses «${m.palabra}» en este ejercicio.`); break;
      default: break; // los casos fallidos se resumen abajo
    }
  }

  const fallidos = casos.filter((c) => !c.paso);
  if (fallidos.length) {
    const visible = fallidos.find((c) => c.visible);
    if (visible?.error) {
      lineas.push(`✗ Al ejecutar tu código con ${describirEntradas(visible.entradas)} ocurrió un error: ${visible.error}`);
    } else if (visible) {
      lineas.push(
        `✗ Con ${describirEntradas(visible.entradas)} se esperaba «${visible.esperado.join(' | ')}» ` +
        `pero tu código mostró «${visible.obtenido.join(' | ') || 'nada'}».`,
      );
    } else {
      lineas.push('✗ Tu código falló en una prueba oculta.');
    }
    if (fallidos.length > 1) lineas.push(`(Fallaron ${fallidos.length} de ${casos.length} pruebas.)`);
  }
  return lineas.join('\n');
}

const describirEntradas = (e) => (e.length ? `las entradas ${e.join(', ')}` : 'este caso');
