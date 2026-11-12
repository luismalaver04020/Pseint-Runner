import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { evaluarCodigo, evaluarContraReferencia, normalizarConfig } from './src/evaluador/evaluarCodigo.js';
import { juzgarEnProlog } from './src/evaluador/prolog.js';

const compararConProlog = process.argv.includes('--comparar-prolog');

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
    const { data, error } = await supabase
      .schema('algoritmos')
      .from('questions')
      .select('question_id,label,prompt,expected_answer,evaluation_config,question_type')
      .eq('published', true)
      .in('question_type', ['codigo', 'codigo_pseudocodigo'])
      .order('question_id')
      .range(inicio, inicio + tamanoPagina - 1);

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
    } else if (/^Leer\b/i.test(limpia)) {
      salida.push('Escribir "Ingrese el dato:"');
      salida.push(linea);
    } else {
      salida.push(linea);
    }
  }

  return salida.join('\n');
}

function varianteIncorrecta(codigo) {
  let escrituras = 0;
  const salida = codigo.split(/\r?\n/).map((linea) => {
    if (!/^\s*Escribir\b/i.test(linea)) return linea;
    escrituras++;
    return linea.replace(/Escribir\b.*/i, 'Escribir "RESPUESTA_INCORRECTA"');
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
let referenciasCorrectas = 0;
let variantesValidasCorrectas = 0;
let variantesIncorrectasRechazadas = 0;
let preguntasConCasosExplicitos = 0;
let preguntasConFallback = 0;
let preguntasConCasosDebiles = 0;

for (const pregunta of preguntas) {
  const id = `${pregunta.question_id} (${pregunta.label ?? 'sin etiqueta'})`;
  const referencia = pregunta.expected_answer?.trim() ?? '';
  if (pregunta.evaluation_config?.casos?.length) preguntasConCasosExplicitos++;
  else preguntasConFallback++;

  if (!esProgramaCompleto(referencia)) {
    if (pregunta.evaluation_config?.casos?.length) {
      try {
        const { casos } = normalizarConfig(pregunta.evaluation_config);
        const todosEsperadosSonCero = casos.every((caso) =>
          caso.salida.length > 0 && caso.salida.every((valor) => Number(valor) === 0)
        );
        if (todosEsperadosSonCero) preguntasConCasosDebiles++;
        pendientesRevision.push({
          id,
          motivo: 'tiene casos ejecutables, pero no referencia para verificar el algoritmo esperado',
          resultadosTodosCero: todosEsperadosSonCero,
        });
      } catch (error) {
        fallas.push({ id, error: `configuración de casos inválida: ${error.message}` });
      }
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

    const incorrecta = varianteIncorrecta(referencia);
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

console.log(JSON.stringify({
  publicadas: preguntas.length,
  referenciasCorrectas,
  preguntasConCasosExplicitos,
  preguntasConFallback,
  preguntasConCasosDebiles,
  variantesValidasCorrectas,
  variantesIncorrectasRechazadas,
  omitidas: omitidas.length,
  pendientesRevision: pendientesRevision.length,
  fallas: fallas.length,
  omitidasPorUnidad,
  muestraOmitidas: omitidas.slice(0, 10),
  muestraPendientes: pendientesRevision.slice(0, 20),
  detalleFallas: fallas,
}, null, 2));

if (fallas.length || omitidas.length) process.exitCode = 1;
