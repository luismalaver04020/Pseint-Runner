import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { evaluarCodigo, evaluarContraReferencia, normalizarConfig } from './src/evaluador/evaluarCodigo.js';
import { juzgarEnProlog } from './src/evaluador/prolog.js';

const compararConProlog = process.argv.includes('--comparar-prolog');
const valorArgumento = (nombre) => process.argv.find((arg) => arg.startsWith(`--${nombre}=`))?.slice(nombre.length + 3);
const filtrarId = valorArgumento('question');
const filtrarEtiqueta = valorArgumento('label');
const rutaReporte = valorArgumento('report');

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para auditar el banco.');
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function cargarPreguntas() {
  const filas = [];
  const tamanoPagina = 500;

  for (let inicio = 0; ; inicio += tamanoPagina) {
    let consulta = supabase
      .schema('algoritmos')
      .from('questions')
      .select('question_id,label,prompt,expected_answer,evaluation_config,question_type')
      .eq('published', true)
      .in('question_type', ['codigo', 'codigo_pseudocodigo'])
      .order('question_id');

    if (filtrarId) consulta = consulta.eq('question_id', Number(filtrarId));
    if (filtrarEtiqueta) consulta = consulta.eq('label', filtrarEtiqueta);

    const { data, error } = await consulta.range(inicio, inicio + tamanoPagina - 1);

    if (error) throw new Error(`No se pudo leer el banco de preguntas: ${error.message}`);
    filas.push(...(data ?? []));
    if (!data || data.length < tamanoPagina) break;
  }

  return filas;
}

function esProgramaCompleto(texto) {
  return /^\s*(Algoritmo|Proceso)\b/i.test(texto ?? '');
}

function varianteFormato(codigo) {
  const lineas = codigo.split(/\r?\n/);
  const salida = [];

  for (const linea of lineas) {
    const limpia = linea.trim();

    if (/^Algoritmo\b/i.test(limpia)) {
      salida.push(linea.replace(/^\s*Algoritmo\b/i, 'Proceso'));
    } else if (/^FinAlgoritmo\s*$/i.test(limpia)) {
      salida.push(linea.replace(/FinAlgoritmo/i, 'FinProceso'));
    } else {
      salida.push(linea);
    }
  }

  return salida.join('\n');
}

function varianteIncorrecta(codigo, configuracion = {}) {
  let escrituras = 0;
  const comparacion = configuracion?.comparacion?.modo ?? 'exacto';
  const salidas = configuracion?.casos?.flatMap((caso) => caso.salida ?? []) ?? [];
  const esperanNumeros = salidas.some((salida) => /[-+]?\d+(?:[.,]\d+)?/.test(String(salida)));
  const requiereMarcadorNumerico = comparacion === 'numeros' || (comparacion === 'semantico' && esperanNumeros);
  let marcador = 987654321;
  const numerosEsperados = new Set(salidas.flatMap((salida) => (String(salida).match(/[-+]?\d+(?:[.,]\d+)?/g) ?? []).map(Number)));
  while (numerosEsperados.has(marcador)) marcador++;
  const salidaMutante = requiereMarcadorNumerico
    ? `Escribir "RESPUESTA_INCORRECTA ${marcador}"`
    : 'Escribir "RESPUESTA_INCORRECTA"';
  const salida = codigo.split(/\r?\n/).map((linea) => {
    if (!/^\s*Escribir\b/i.test(linea)) return linea;
    escrituras++;
    return linea.replace(/Escribir\b.*/i, salidaMutante);
  });

  return escrituras ? salida.join('\n') : null;
}

async function evaluarReferencia(pregunta, codigo, ejecutar = evaluarCodigo) {
  if (pregunta.evaluation_config?.casos?.length) {
    return ejecutar(codigo, pregunta.evaluation_config);
  }
  return evaluarContraReferencia(codigo, pregunta.expected_answer, {}, pregunta.prompt ?? '', ejecutar);
}

async function evaluarYCompararJueces(pregunta, codigo) {
  const resultado = await evaluarReferencia(pregunta, codigo);
  if (compararConProlog) {
    const resultadoProlog = await evaluarReferencia(
      pregunta,
      codigo,
      (programa, configuracion) => evaluarCodigo(programa, configuracion, juzgarEnProlog)
    );
    assert.deepEqual(resultado, resultadoProlog, 'El juez JS y el juez Prolog discrepan');
  }
  return resultado;
}

const preguntas = await cargarPreguntas();
const fallas = [];
const omitidas = [];
const pendientesRevision = [];
const alertasCalidad = [];
let referenciasCorrectas = 0;
let variantesValidasCorrectas = 0;
let variantesIncorrectasRechazadas = 0;
let preguntasConCasosExplicitos = 0;
let preguntasConFallback = 0;
let preguntasConCasosDebiles = 0;
let preguntasConCasosOcultos = 0;
let casosEvaluados = 0;

for (const pregunta of preguntas) {
  const id = `${pregunta.question_id} (${pregunta.label ?? 'sin etiqueta'})`;
  const referencia = pregunta.expected_answer?.trim() ?? '';
  if (!pregunta.prompt?.trim()) {
    fallas.push({ id, error: 'enunciado vacío en una pregunta publicada' });
  }
  if (pregunta.evaluation_config?.casos?.length) preguntasConCasosExplicitos++;
  else preguntasConFallback++;

  if (pregunta.evaluation_config?.casos?.length) {
    try {
      const { casos } = normalizarConfig(pregunta.evaluation_config);
      casosEvaluados += casos.length;
      const visibles = casos.filter((caso) => caso.visible !== false).length;
      const ocultos = casos.length - visibles;
      if (ocultos > 0) preguntasConCasosOcultos++;
      if (!visibles || !ocultos) {
        alertasCalidad.push({
          id,
          nivel: 'revision',
          motivo: !visibles ? 'no tiene casos visibles' : 'no tiene casos ocultos',
        });
      }

      const salidasUnicas = new Set(casos.map((caso) => JSON.stringify(caso.salida)));
      const todasCero = casos.every((caso) =>
        caso.salida.length > 0 && caso.salida.every((valor) => Number(valor) === 0)
      );
      if (salidasUnicas.size === 1 || todasCero) {
        alertasCalidad.push({
          id,
          nivel: 'revision',
          motivo: todasCero
            ? 'todos los casos esperan cero; podrían no detectar algoritmos incompletos'
            : 'todos los casos esperan la misma salida; revisar que distingan soluciones incorrectas',
        });
        preguntasConCasosDebiles++;
      }
    } catch (error) {
      fallas.push({ id, error: `configuración de casos inválida: ${error.message}` });
      continue;
    }
  }

  if (!esProgramaCompleto(referencia)) {
    if (pregunta.evaluation_config?.casos?.length) {
      pendientesRevision.push({
        id,
        motivo: 'tiene casos ejecutables, pero no referencia para verificar el algoritmo esperado',
      });
      continue;
    }
    omitidas.push({ id, motivo: 'no tiene referencia ni casos explícitos ejecutables' });
    continue;
  }

  try {
    const resultadoReferencia = await evaluarYCompararJueces(pregunta, referencia);
    assert.equal(
      resultadoReferencia.correcto,
      true,
      `La respuesta de referencia falló: ${resultadoReferencia.mensaje}`
    );
    referenciasCorrectas++;

    const variante = varianteFormato(referencia);
    const resultadoVariante = await evaluarYCompararJueces(pregunta, variante);
    assert.equal(
      resultadoVariante.correcto,
      true,
      `La variante de formato falló: ${resultadoVariante.mensaje}`
    );
    variantesValidasCorrectas++;

    const incorrecta = varianteIncorrecta(referencia, pregunta.evaluation_config);
    if (incorrecta) {
      const resultadoIncorrecto = await evaluarYCompararJueces(pregunta, incorrecta);
      assert.equal(resultadoIncorrecto.correcto, false, 'Aceptó una respuesta intencionalmente incorrecta');
      variantesIncorrectasRechazadas++;
    }
  } catch (error) {
    fallas.push({ id, error: error.message });
  }
}

const omitidasPorUnidad = omitidas.reduce((resumen, pregunta) => {
  const unidad = pregunta.id.match(/\(U(\d+)-/)?.[1] ?? 'sin unidad';
  resumen[unidad] = (resumen[unidad] ?? 0) + 1;
  return resumen;
}, {});

const reporte = {
  generadoEn: new Date().toISOString(),
  filtro: { question_id: filtrarId ?? null, label: filtrarEtiqueta ?? null },
  publicadas: preguntas.length,
  referenciasCorrectas,
  preguntasConCasosExplicitos,
  preguntasConFallback,
  casosEvaluados,
  preguntasConCasosOcultos,
  preguntasConCasosDebiles,
  variantesValidasCorrectas,
  variantesIncorrectasRechazadas,
  omitidas: omitidas.length,
  pendientesRevision: pendientesRevision.length,
  fallas: fallas.length,
  omitidasPorUnidad,
  muestraOmitidas: omitidas.slice(0, 10),
  detalleOmitidas: omitidas,
  muestraPendientes: pendientesRevision.slice(0, 20),
  detallePendientes: pendientesRevision,
  alertasCalidad,
  detalleFallas: fallas,
};

const salidaReporte = JSON.stringify(reporte, null, 2);
console.log(salidaReporte);
if (rutaReporte) {
  const destino = resolve(rutaReporte);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, `${salidaReporte}\n`, 'utf8');
}

if (fallas.length || omitidas.length || (filtrarId || filtrarEtiqueta) && preguntas.length === 0) process.exitCode = 1;
