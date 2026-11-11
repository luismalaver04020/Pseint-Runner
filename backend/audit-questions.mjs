import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { normalizarConfig } from './src/evaluador/evaluarCodigo.js';
import { juzgarEnProlog } from './src/evaluador/prolog.js';
import { juzgarEnJavaScript } from './src/evaluador/juez.js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para auditar el banco.');
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function cargarPreguntas() {
  const filas = [];
  const tamanoPagina = 500;

  for (let inicio = 0; ; inicio += tamanoPagina) {
    const { data, error } = await supabase
      .schema('algoritmos')
      .from('questions')
      .select('question_id,label,published,evaluation_config,question_type')
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

// Construye hechos estructurales de control para probar la configuración del juez.
// Esto no reemplaza la revisión semántica de una solución de estudiante.
function programaQueCumpleReglas(reglas) {
  const cantidades = new Map();
  for (const tipo of reglas.requiere) cantidades.set(tipo, Math.max(1, cantidades.get(tipo) ?? 0));
  for (const [tipo, minimo] of Object.entries(reglas.minimos)) {
    cantidades.set(tipo, Math.max(minimo, cantidades.get(tipo) ?? 0));
  }

  const programa = [];
  let linea = 1;
  for (const [tipo, cantidad] of cantidades) {
    for (let i = 0; i < cantidad; i++) programa.push([linea++, tipo, tipo]);
  }
  for (const palabra of reglas.requiere_texto) {
    programa.push([linea++, 'EXPRESION', palabra]);
  }
  return programa;
}

function entradaJuez(config, caso, incorrecta = false) {
  const { reglas } = normalizarConfig(config);
  return {
    programa: programaQueCumpleReglas(reglas),
    reglas,
    casos: [{
      id: caso.id,
      visible: caso.visible ? 'si' : 'no',
      estado: 'ok',
      esperado: caso.salida,
      obtenido: incorrecta ? ['__resultado_incorrecto__'] : caso.salida,
    }],
  };
}

const preguntas = await cargarPreguntas();
const fallas = [];
let configuracionesValidas = 0;
let aprobadasPorAmbosJueces = 0;
let rechazadasPorAmbosJueces = 0;
let casosAuditados = 0;

for (const pregunta of preguntas) {
  const id = `${pregunta.question_id} (${pregunta.label ?? 'sin etiqueta'})`;
  try {
    const config = pregunta.evaluation_config;
    const { casos } = normalizarConfig(config);
    if (casos.length === 0) throw new Error('no tiene casos de prueba');
    configuracionesValidas++;

    for (const caso of casos) {
      const correcta = entradaJuez(config, caso);
      const incorrecta = entradaJuez(config, caso, true);
      const bienProlog = await juzgarEnProlog(correcta);
      const bienJavaScript = juzgarEnJavaScript(correcta);
      const malProlog = await juzgarEnProlog(incorrecta);
      const malJavaScript = juzgarEnJavaScript(incorrecta);

      assert.equal(bienProlog.veredicto, 'correcto', `Prolog rechazó el caso ${caso.id} correcto`);
      assert.equal(malProlog.veredicto, 'incorrecto', `Prolog aceptó el caso ${caso.id} alterado`);
      assert.deepEqual(bienProlog, bienJavaScript, `Los jueces discrepan al aceptar el caso ${caso.id}`);
      assert.deepEqual(malProlog, malJavaScript, `Los jueces discrepan al rechazar el caso ${caso.id}`);
      casosAuditados++;
    }
    aprobadasPorAmbosJueces++;
    rechazadasPorAmbosJueces++;
  } catch (error) {
    fallas.push({ id, error: error.message });
  }
}

console.log(JSON.stringify({
  publicadas: preguntas.length,
  configuracionesValidas,
  casosAuditados,
  aceptadasPorAmbosJueces: aprobadasPorAmbosJueces,
  incorrectasRechazadasPorAmbosJueces: rechazadasPorAmbosJueces,
  fallas: fallas.length,
  detalleFallas: fallas,
}, null, 2));

if (fallas.length || configuracionesValidas !== preguntas.length) process.exitCode = 1;
