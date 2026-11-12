import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { evaluarCodigo, evaluarContraReferencia } from './src/evaluador/evaluarCodigo.js';
import { generarSolucionPrueba } from './src/evaluador/generarSolucionPrueba.js';

const argumentos = process.argv.slice(2);
const csvs = argumentos.filter((arg) => arg.startsWith('--csv=')).map((arg) => arg.slice(6));
const rutaReporte = argumentos.find((arg) => arg.startsWith('--report='))?.slice(9);
const rutaSql = argumentos.find((arg) => arg.startsWith('--sql='))?.slice(6);
const rutaCsv = argumentos.find((arg) => arg.startsWith('--csv-report='))?.slice(13);
const rutaOverrides = argumentos.find((arg) => arg.startsWith('--override-json='))?.slice(16);
if (!csvs.length) {
  throw new Error('Indica al menos un CSV exportado del banco con --csv=archivo.csv.');
}

function cargarExportacion(ruta) {
  const lineas = readFileSync(ruta, 'utf8').split(/\r?\n/).filter(Boolean);
  return lineas.slice(1).flatMap((linea) => {
    if (!linea.startsWith('"') || !linea.endsWith('"')) {
      throw new Error(`Formato CSV no reconocido en ${ruta}. Exporta la columna JSON como CSV.`);
    }
    const json = linea.slice(1, -1).replace(/""/g, '"');
    return JSON.parse(json);
  });
}

const preguntas = csvs.flatMap(cargarExportacion);
const unicas = new Map(preguntas.map((pregunta) => [pregunta.id ?? pregunta.question_id, pregunta]));
if (rutaOverrides) {
  const overrides = JSON.parse(readFileSync(resolve(rutaOverrides), 'utf8'));
  for (const pregunta of overrides) unicas.set(pregunta.id ?? pregunta.question_id, pregunta);
}
const resultados = [];
const correcciones = [];

for (const pregunta of unicas.values()) {
  const id = pregunta.id ?? pregunta.question_id;
  const answer = generarSolucionPrueba({
    question_id: id,
    label: pregunta.label,
    prompt: pregunta.prompt,
    evaluation_config: pregunta.config ?? pregunta.evaluation_config,
    expected_answer: pregunta.reference ?? pregunta.expected_answer,
  });
  const config = pregunta.config ?? pregunta.evaluation_config;
  const referencia = pregunta.reference ?? pregunta.expected_answer;

  if (!answer && !referencia) {
    resultados.push({ id, label: pregunta.label, estado: 'SIN_SOLUCION_GENERADA', regla: null, correcta: null, error: null });
    continue;
  }

  const codigo = answer?.codigo ?? referencia;
  let evaluacion;
  try {
    evaluacion = config?.casos?.length
      ? await evaluarCodigo(codigo, config)
      : await evaluarContraReferencia(codigo, referencia, {}, pregunta.prompt ?? '');
    const correcto = evaluacion.correcto === true;
    const estado = correcto ? 'PASA' : 'NO_PASA';
    resultados.push({
      id,
      label: pregunta.label,
      prompt: pregunta.prompt,
      estado,
      origen: answer ? 'respuesta_generada' : 'referencia_existente',
      regla: answer?.regla ?? null,
      confianza: answer?.confianza ?? null,
      correcta: correcto,
      mensaje: evaluacion.mensaje,
      motivos: evaluacion.motivos,
      casos_ok: evaluacion.casos_ok,
      casos_total: evaluacion.casos_total,
      detalle_casos: evaluacion.casos,
      respuesta: codigo,
    });

    if (correcto && answer && answer.confianza === 'alta' && !referencia && config?.casos?.length) {
      correcciones.push({ id, codigo: answer.codigo });
    }
  } catch (error) {
    resultados.push({
      id,
      label: pregunta.label,
      prompt: pregunta.prompt,
      estado: 'ERROR_EJECUCION',
      origen: answer ? 'respuesta_generada' : 'referencia_existente',
      regla: answer?.regla ?? null,
      confianza: answer?.confianza ?? null,
      correcta: false,
      error: error.message,
      respuesta: codigo,
    });
  }
}

const resumen = {
  total: unicas.size,
  pasan: resultados.filter((item) => item.estado === 'PASA').length,
  noPasan: resultados.filter((item) => item.estado === 'NO_PASA').length,
  erroresEjecucion: resultados.filter((item) => item.estado === 'ERROR_EJECUCION').length,
  sinSolucionGenerada: resultados.filter((item) => item.estado === 'SIN_SOLUCION_GENERADA').length,
  correccionesAutomaticasSeguras: correcciones.length,
  porUnidad: Object.fromEntries(['U1', 'U2', 'U3'].map((unidad) => [unidad, Object.fromEntries(
    ['PASA', 'NO_PASA', 'ERROR_EJECUCION', 'SIN_SOLUCION_GENERADA'].map((estado) => [estado,
      resultados.filter((item) => item.label?.startsWith(`${unidad}-`) && item.estado === estado).length]),
  )])),
};
const reporte = { resumen, preguntas: resultados };
const jsonReporte = JSON.stringify(reporte, null, 2);
console.log(JSON.stringify(resumen, null, 2));
if (argumentos.includes('--detalle')) console.log(JSON.stringify({
  noPasan: resultados.filter((item) => item.estado === 'NO_PASA').map(({ id, label, regla, confianza, mensaje, motivos }) => ({ id, label, regla, confianza, mensaje, motivos })),
  sinSolucionGenerada: resultados.filter((item) => item.estado === 'SIN_SOLUCION_GENERADA').map(({ id, label, prompt }) => ({ id, label, prompt })),
}, null, 2));

if (rutaReporte) {
  const destino = resolve(rutaReporte);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, `${jsonReporte}\n`, 'utf8');
}

if (rutaSql) {
  const literal = (texto) => `'${texto.replace(/'/g, "''")}'`;
  const statements = correcciones.map(({ id, codigo }) =>
    `UPDATE algoritmos.questions SET expected_answer = ${literal(codigo)} WHERE question_id = ${id} AND expected_answer IS NULL;`
  );
  const destino = resolve(rutaSql);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, `BEGIN;\n${statements.join('\n')}\nCOMMIT;\n`, 'utf8');
}

if (rutaCsv) {
  const celda = (valor) => `"${String(valor ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  const lineas = [
    ['id', 'label', 'estado', 'origen', 'confianza', 'regla', 'motivos', 'prompt'].map(celda).join(','),
    ...resultados.map((item) => [
      item.id,
      item.label,
      item.estado,
      item.origen,
      item.confianza,
      item.regla,
      item.error ?? item.motivos?.map((motivo) => motivo.codigo).join('; '),
      item.prompt,
    ].map(celda).join(',')),
  ];
  const destino = resolve(rutaCsv);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, `${lineas.join('\n')}\n`, 'utf8');
}

if (resumen.noPasan || resumen.erroresEjecucion) process.exitCode = 1;
