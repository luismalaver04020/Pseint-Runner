import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const csvs = args.filter((arg) => arg.startsWith('--csv=')).map((arg) => arg.slice(6));
const reportPath = args.find((arg) => arg.startsWith('--report='))?.slice(9);
const sqlPath = args.find((arg) => arg.startsWith('--sql='))?.slice(6);
if (!csvs.length) throw new Error('Pasa las exportaciones del banco usando --csv=archivo.csv.');

const reglasCriterio = new Map([
  ['límite de circulación', { operador: '<=', frase: 'es menor o igual que' }],
  ['porcentaje mínimo de asistencia', { operador: '>=', frase: 'es mayor o igual que' }],
  ['máximo de presión operativa', { operador: '>', frase: 'es mayor que' }],
  ['meta diaria de producción', { operador: '>=', frase: 'es mayor o igual que' }],
  ['máximo de humedad permitido', { operador: '<=', frase: 'es menor o igual que' }],
  ['mínimo de reserva de agua', { operador: '<', frase: 'es menor que' }],
  ['punto de reposición', { operador: '<', frase: 'es menor que' }],
  ['límite térmico de seguridad', { operador: '>', frase: 'es mayor que' }],
  ['nivel crítico de batería', { operador: '<=', frase: 'es menor o igual que' }],
  ['nota mínima de aprobación', { operador: '>=', frase: 'es mayor o igual que' }],
].map(([criterio, regla]) => [sinTildes(criterio), regla]));

function sinTildes(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}

function leerCsvJson(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter(Boolean);
  return lines.slice(1).flatMap((line) => {
    if (!line.startsWith('"') || !line.endsWith('"')) throw new Error(`Formato CSV no reconocido: ${path}`);
    return JSON.parse(line.slice(1, -1).replace(/""/g, '"'));
  });
}

function contextoSinPrefijo(texto) {
  let contexto = texto.trim();
  contexto = contexto.replace(/^en\s+/i, '');
  // Corrige duplicaciones encontradas en el banco como «En en el control…».
  contexto = contexto.replace(/^en\s+/i, '');
  return contexto.charAt(0).toLocaleLowerCase('es') + contexto.slice(1);
}

function generarPromptClaro(prompt, partes, regla) {
  const [, contexto, variable, criterio, umbral, salidaSi, salidaNo] = partes;
  return `En ${contextoSinPrefijo(contexto)}, lee ${variable}. Muestra «${salidaSi}» si ${variable} ${regla.frase} ${umbral}; en caso contrario, muestra «${salidaNo}».`;
}

function validarCasos(casos, umbral, regla, salidaSi, salidaNo) {
  const vistos = new Set();
  for (const caso of casos) {
    const valor = Number(caso.entradas?.[0]);
    if (!Number.isFinite(valor) || !Array.isArray(caso.salida) || caso.salida.length !== 1) return false;
    const cumple = regla.operador === '<=' ? valor <= umbral
      : regla.operador === '>=' ? valor >= umbral
        : regla.operador === '<' ? valor < umbral
          : valor > umbral;
    if (caso.salida[0] !== (cumple ? salidaSi : salidaNo)) return false;
    if (valor === umbral - 1) vistos.add('abajo');
    if (valor === umbral) vistos.add('borde');
    if (valor === umbral + 1) vistos.add('arriba');
  }
  return ['abajo', 'borde', 'arriba'].every((lado) => vistos.has(lado));
}

const preguntas = new Map(csvs.flatMap(leerCsvJson).map((q) => [q.id ?? q.question_id, q]));
const candidatos = [];
const otrasFronteras = [];
let preguntasConTildesQueSeNormalizan = 0;
let configuracionesQueProhibenOmitirTildes = 0;

for (const pregunta of preguntas.values()) {
  const prompt = pregunta.prompt ?? '';
  const config = pregunta.config ?? pregunta.evaluation_config ?? {};
  const outputs = (config.casos ?? []).flatMap((caso) => caso.salida ?? []);
  if (outputs.some((salida) => /[áéíóúüñ]/i.test(String(salida)))) preguntasConTildesQueSeNormalizan++;
  if (config.comparacion?.ignorar_tildes === false) configuracionesQueProhibenOmitirTildes++;

  const match = prompt.match(/^En\s+(.+?),\s*decide si\s+(\w+)\s+cumple el criterio\s+«([^»]+)»\s+de\s+(\d+(?:[.,]\d+)?)[.]?\s*Si se cumple, muestra\s+«([^»]+)»;\s*en caso contrario, muestra\s+«([^»]+)»\.?$/i);
  if (match) {
    const criterion = sinTildes(match[3]);
    const threshold = Number(match[4].replace(',', '.'));
    const cases = config.casos ?? [];
    const hasBoundary = cases.some((caso) => caso.entradas?.some((input) => Number(input) === threshold));
    if (!hasBoundary) continue;
    const rule = reglasCriterio.get(criterion);
    const generatedPrompt = rule ? generarPromptClaro(prompt, match, rule) : null;
    const casesConfirmRule = rule && validarCasos(cases, threshold, rule, match[5], match[6]);
    if (generatedPrompt && casesConfirmRule) {
      candidatos.push({
        id: pregunta.id ?? pregunta.question_id,
        label: pregunta.label,
        promptActual: prompt,
        promptCorregido: generatedPrompt,
        criterio: criterion,
        operadorInferidoDeLosCasos: rule.operador,
        umbral: threshold,
        casos: cases.length,
      });
    } else {
      otrasFronteras.push({
        id: pregunta.id ?? pregunta.question_id,
        label: pregunta.label,
        prompt,
        criterio: criterion,
        umbral: threshold,
        motivo: !rule ? 'criterio sin regla automática; revisar manualmente' : 'los casos no respaldan una única regla',
      });
    }
    continue;
  }

  if (/criterio|l[ií]mite|umbral|m[ií]nimo|m[aá]ximo/i.test(prompt)) {
    const numericInputs = (config.casos ?? []).flatMap((caso) => caso.entradas ?? []).map(Number).filter(Number.isFinite);
    const boundary = numericInputs.filter((value) => new RegExp(`(?:de|a|en)\\s*${value}(?:\\D|$)`, 'i').test(prompt));
    if (boundary.length) otrasFronteras.push({
      id: pregunta.id ?? pregunta.question_id,
      label: pregunta.label,
      prompt,
      motivo: 'posible frontera que la heurística no pudo clasificar',
    });
  }
}

const report = {
  totalPreguntas: preguntas.size,
  preguntasConSalidasAcentuadas: preguntasConTildesQueSeNormalizan,
  configuracionesConIgnorarTildesDesactivado: configuracionesQueProhibenOmitirTildes,
  promptsAmbiguosConCasosQueConfirmanUmbral: candidatos.length,
  otrosCasosDeFronteraParaRevision: otrasFronteras.length,
  candidatos,
  otrasFronteras,
};
console.log(JSON.stringify({ ...report, candidatos: candidatos.length, otrasFronteras: otrasFronteras.length }, null, 2));

if (reportPath) {
  const target = resolve(reportPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

if (sqlPath) {
  const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;
  const updates = candidatos.map((row) => `    UPDATE algoritmos.questions SET prompt = ${quote(row.promptCorregido)} WHERE question_id = ${row.id} AND label = ${quote(row.label)};\n    GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;\n    IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar exactamente la pregunta % (%)', ${row.id}, ${quote(row.label)}; END IF;`);
  const target = resolve(sqlPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `-- Ajusta los enunciados de umbral solo cuando los casos de prueba\n-- confirman el comportamiento en N-1, N y N+1.\nBEGIN;\nDO $$\nDECLARE\n    filas_actualizadas INTEGER;\nBEGIN\n${updates.join('\n')}\nEND $$;\nCOMMIT;\n`, 'utf8');
}
