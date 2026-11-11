// Auditoría previa a la migración 013. Compara sus casos con expected_answer
// mientras las respuestas de referencia todavía existen en Supabase.
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { normalizarConfig } from './src/evaluador/evaluarCodigo.js';
import { analizarCodigo } from './src/evaluador/parser.js';
import { ejecutarCodigo } from './src/evaluador/interprete.js';
import { juzgarEnJavaScript } from './src/evaluador/juez.js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');

const rutaMigracion = new URL('./supabase/migrations/013_case_based_code_grading.sql', import.meta.url);
const sql = await readFile(rutaMigracion, 'utf8');
const configuraciones = new Map();
const patron = /UPDATE algoritmos\.questions SET evaluation_config = \$cfg\$(.*?)\$cfg\$::jsonb WHERE question_id = (\d+);/gs;

for (const coincidencia of sql.matchAll(patron)) {
  const [, json, id] = coincidencia;
  if (configuraciones.has(Number(id))) throw new Error(`La migración repite question_id ${id}.`);
  configuraciones.set(Number(id), JSON.parse(json));
}
if (configuraciones.size !== 106) {
  throw new Error(`Se esperaban 106 configuraciones legacy y se encontraron ${configuraciones.size}.`);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const preguntas = [];
const tamanoPagina = 500;
for (let inicio = 0; ; inicio += tamanoPagina) {
  const { data, error } = await supabase
    .schema('algoritmos')
    .from('questions')
    .select('question_id,label,published,question_type,evaluation_config,expected_answer')
    .eq('published', true)
    .in('question_type', ['codigo', 'codigo_pseudocodigo'])
    .order('question_id')
    .range(inicio, inicio + tamanoPagina - 1);
  if (error) throw new Error(`No se pudo leer el banco: ${error.message}`);
  preguntas.push(...(data ?? []));
  if (!data || data.length < tamanoPagina) break;
}

const porId = new Map(preguntas.map((fila) => [fila.question_id, fila]));
const fallas = [];
let casosRevisados = 0;
let casosExistentesEnBanco = 0;
let casosMigracion = 0;
let referenciasEjecutables = 0;
let referenciasNoEjecutables = 0;

for (const pregunta of preguntas) {
  const { question_id: id, label, expected_answer: referencia } = pregunta;
  if (typeof referencia !== 'string' || !referencia.trim()) {
    fallas.push({ id, label, problema: 'no existe una respuesta de referencia para la auditoría previa' });
    continue;
  }

  let configCruda = pregunta.evaluation_config;
  if (!Array.isArray(configCruda?.casos) || configCruda.casos.length === 0) {
    configCruda = configuraciones.get(id);
    if (!configCruda) {
      fallas.push({ id, label, problema: 'no tiene casos y no aparece en la migración 013' });
      continue;
    }
    casosMigracion += configCruda.casos?.length ?? 0;
  } else {
    casosExistentesEnBanco += configCruda.casos.length;
  }

  try {
    const { casos, reglas } = normalizarConfig(configCruda);
    try {
      analizarCodigo(referencia);
      referenciasEjecutables++;
    } catch {
      // 194 filas conservan texto parcial/prosa en expected_answer y ya tienen
      // casos propios. No son respuestas modelo ejecutables para esta auditoría.
      referenciasNoEjecutables++;
      continue;
    }

    // Este chequeo contrasta salidas. Las reglas estructurales se conservan
    // aparte y se validan con los jueces en audit:questions después de migrar.
    const reglasSoloSalida = {
      ...reglas,
      requiere: [],
      prohibe: [],
      minimos: {},
      requiere_texto: [],
      prohibe_texto: [],
    };

    for (const caso of casos) {
      casosRevisados++;
      let obtenido = [];
      let estado = 'ok';
      let mensaje = '';
      try {
        obtenido = ejecutarCodigo(referencia, caso.entradas).lineas;
      } catch (error) {
        estado = 'error';
        mensaje = String(error?.message ?? error);
      }

      const veredicto = juzgarEnJavaScript({
        programa: [],
        reglas: reglasSoloSalida,
        casos: [{
          id: caso.id,
          visible: 'si',
          estado,
          mensaje,
          esperado: caso.salida,
          obtenido,
        }],
      });
      if (veredicto.veredicto !== 'correcto') {
        fallas.push({ id, label, caso: caso.id, problema: estado === 'error' ? mensaje : 'salida distinta' });
      }
    }
  } catch (error) {
    fallas.push({ id, problema: String(error?.message ?? error) });
  }
}

console.log(JSON.stringify({
  configuracionesLegacyEnMigracion: configuraciones.size,
  preguntasEnBanco: preguntas.length,
  casosPreexistentesEnBanco: casosExistentesEnBanco,
  casosPropuestosPorMigracion: casosMigracion,
  casosRevisados,
  referenciasEjecutables,
  referenciasNoEjecutables,
  fallas: fallas.length,
  detalleFallas: fallas,
}, null, 2));

if (fallas.length || preguntas.length !== 1006 || referenciasEjecutables !== 812) process.exitCode = 1;
