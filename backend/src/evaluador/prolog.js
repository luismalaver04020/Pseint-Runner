// ─── MOTOR PROLOG (swipl-wasm) ───
// Arranca SWI-Prolog una sola vez, carga las reglas de prolog/reglas.pl y expone:
//   · juzgarEnProlog(entrada)  → pasa los hechos al juez y devuelve su veredicto.
import { readFile } from 'node:fs/promises';
import SWIPL from 'swipl-wasm';

const RUTA_REGLAS = new URL('./prolog/reglas.pl', import.meta.url);

let motorProlog = null;
let inicializando = null;

export async function obtenerMotorProlog() {
  if (motorProlog) return motorProlog;
  if (inicializando) return inicializando;

  inicializando = (async () => {
    const swipl = await SWIPL({ arguments: ['-q'] });
    const reglas = await readFile(RUTA_REGLAS, 'utf8');
    await swipl.prolog.load_string(reglas, 'reglas.pl');

    // Comprobación inmediata: si las reglas tuvieran un error de sintaxis, falla aquí y no en un examen.
    const prueba = swipl.prolog.query('current_predicate(juez_pseint:juzgar/2)').once();
    if (!prueba?.success) throw new Error('No se pudieron cargar las reglas de prolog/reglas.pl');

    motorProlog = swipl;
    console.log('Motor Prolog iniciado y reglas cargadas.');
    return motorProlog;
  })().catch((error) => {
    inicializando = null;
    throw error;
  });

  return inicializando;
}

// Los datos del alumno viajan como ARGUMENTOS (no se concatenan al texto de la consulta),
// así que nada de lo que escriba un alumno puede alterar la consulta Prolog.
export async function juzgarEnProlog(entrada) {
  const swipl = await obtenerMotorProlog();
  const resultado = swipl.prolog
    .query('juez_pseint:juzgar(Entrada, Salida)', { Entrada: entrada })
    .once();

  if (resultado?.error) throw new Error(`Error del juez Prolog: ${resultado.message}`);
  if (!resultado?.success) throw new Error('El juez Prolog no pudo emitir un veredicto.');
  return resultado.Salida;
}

