import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const csvs = args.filter((arg) => arg.startsWith('--csv=')).map((arg) => arg.slice(6));
const reportPath = args.find((arg) => arg.startsWith('--report='))?.slice(9);
const sqlPath = args.find((arg) => arg.startsWith('--sql='))?.slice(6);
const overridesPath = args.find((arg) => arg.startsWith('--overrides='))?.slice(12);
if (!csvs.length) throw new Error('Indica las exportaciones con --csv=archivo.csv.');

function leerCsvJson(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter(Boolean);
  return lines.slice(1).flatMap((line) => {
    if (!line.startsWith('"') || !line.endsWith('"')) throw new Error(`CSV no reconocido: ${path}`);
    return JSON.parse(line.slice(1, -1).replace(/""/g, '"'));
  });
}

const reglas = [
  { nombre: 'puntajes que alcanzan el mínimo', match: /puntajes que alcanzan el mínimo/i, entrada: 'lista', accion: 'contar', prueba: (x) => x >= 11, elementos: 'puntajes', objetivo: 'los puntajes iguales o superiores a 11' },
  { nombre: 'contadores pares mayores a 2', match: /contadores pares mayores a 2/i, entrada: 'cualquiera', accion: 'contar', prueba: (x) => x % 2 === 0 && x > 2, elementos: 'valores', objetivo: 'los valores pares mayores que 2' },
  { nombre: 'control de pares', match: /control de pares/i, entrada: 'cualquiera', accion: 'contar', prueba: (x) => x % 2 === 0, elementos: 'valores', objetivo: 'los valores pares (X MOD 2 = 0)' },
  { nombre: 'reservas positivas', match: /reservas positivas/i, entrada: 'cualquiera', accion: 'contar', prueba: (x) => x > 0, elementos: 'reservas', objetivo: 'las reservas mayores que cero' },
  { nombre: 'reporte de impares', match: /reporte de impares/i, entrada: 'cualquiera', accion: 'contar', prueba: (x) => Math.abs(x % 2) === 1, elementos: 'valores', objetivo: 'los valores impares (X MOD 2 <> 0)' },
  { nombre: 'productos con cantidad par', match: /productos con cantidad par/i, entrada: 'lista', accion: 'sumar', prueba: (x) => x % 2 === 0, elementos: 'cantidades', objetivo: 'las cantidades pares (X MOD 2 = 0)' },
  { nombre: 'piezas divisibles entre cuatro', match: /piezas divisibles entre cuatro/i, entrada: 'cualquiera', accion: 'contar', prueba: (x) => x % 4 === 0, elementos: 'valores', objetivo: 'los valores divisibles entre 4 (X MOD 4 = 0)' },
  { nombre: 'temperaturas bajo cero', match: /temperaturas bajo cero/i, entrada: 'cualquiera', accion: 'contar', prueba: (x) => x < 0, elementos: 'valores', objetivo: 'las temperaturas menores que cero' },
  { nombre: 'registros entre 5 y 15', match: /registros entre 5 y 15/i, entrada: 'lista', accion: 'contar', prueba: (x) => x >= 5 && x <= 15, elementos: 'registros', objetivo: 'los registros entre 5 y 15, incluidos ambos límites' },
  { nombre: 'mediciones no negativas', match: /mediciones no negativas/i, entrada: 'lista', accion: 'sumar', prueba: (x) => x >= 0, elementos: 'mediciones', objetivo: 'las mediciones mayores o iguales que cero' },
  { nombre: 'notas desaprobatorias', match: /notas desaprobatorias/i, entrada: 'cualquiera', accion: 'contar', prueba: (x) => x < 11, elementos: 'notas', objetivo: 'las notas menores que 11' },
];

const casosLimite = {
  'puntajes que alcanzan el mínimo': { lista: { entradas: ['2', '10', '11'], salida: ['1'] } },
  'contadores pares mayores a 2': { lista: { entradas: ['3', '2', '4', '6'], salida: ['2'] }, sentinela: { entradas: ['2', '4', '6', '0'], salida: ['2'] } },
  'control de pares': { lista: { entradas: ['3', '-2', '0', '4'], salida: ['3'] }, sentinela: { entradas: ['-2', '4', '0'], salida: ['2'] } },
  'reservas positivas': { lista: { entradas: ['3', '1', '0', '-1'], salida: ['1'] }, sentinela: { entradas: ['1', '0'], salida: ['1'] } },
  'reporte de impares': { lista: { entradas: ['3', '1', '2', '3'], salida: ['2'] }, sentinela: { entradas: ['1', '2', '3', '0'], salida: ['2'] } },
  'productos con cantidad par': { lista: { entradas: ['3', '2', '3', '4'], salida: ['6'] }, sentinela: { entradas: ['2', '3', '4', '0'], salida: ['6'] } },
  'piezas divisibles entre cuatro': { lista: { entradas: ['3', '4', '5', '8'], salida: ['2'] }, sentinela: { entradas: ['4', '5', '8', '0'], salida: ['2'] } },
  'temperaturas bajo cero': { lista: { entradas: ['3', '-1', '0', '1'], salida: ['1'] }, sentinela: { entradas: ['-1', '0'], salida: ['1'] } },
  'registros entre 5 y 15': { lista: { entradas: ['3', '5', '15', '16'], salida: ['2'] }, sentinela: { entradas: ['5', '15', '16', '0'], salida: ['2'] } },
  'mediciones no negativas': { lista: { entradas: ['3', '-1', '0', '1'], salida: ['1'] }, sentinela: { entradas: ['-1', '1', '0'], salida: ['1'] } },
  'notas desaprobatorias': { lista: { entradas: ['2', '10', '11'], salida: ['1'] }, sentinela: { entradas: ['10', '11', '0'], salida: ['1'] } },
};

const correccionesConOrdenDeEntrada = new Map([
  [1772, { tipo: 'progresion', prompt: 'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.' }],
  [1769, { tipo: 'progresion', prompt: 'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.' }],
  [1765, { tipo: 'tabla', prompt: 'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.' }],
  [1699, { tipo: 'tabla', prompt: 'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.' }],
]);

function validarCorreccionDeEntrada(q, candidata) {
  const casos = (q.config ?? q.evaluation_config)?.casos ?? [];
  if (!casos.length) return false;
  return casos.every((caso) => {
    const entradas = (caso.entradas ?? []).map(Number);
    const esperada = (caso.salida ?? []).map((n) => Number(String(n).replace(',', '.')));
    if (candidata.tipo === 'progresion') {
      if (entradas.length !== 3 || !esperada.length) return false;
      const [inicio, paso, limite] = entradas;
      const salida = [];
      for (let valor = inicio, iteraciones = 0; valor <= limite && iteraciones < 1000; valor += paso, iteraciones++) salida.push(valor);
      return JSON.stringify(salida) === JSON.stringify(esperada);
    }
    if (candidata.tipo === 'tabla') {
      if (entradas.length !== 2 || !esperada.length) return false;
      const [base, limite] = entradas;
      const salida = Array.from({ length: limite }, (_, i) => base * (i + 1));
      return JSON.stringify(salida) === JSON.stringify(esperada);
    }
    return false;
  });
}

function salidaNumerica(caso) {
  if (!Array.isArray(caso.salida) || caso.salida.length !== 1) return null;
  const n = Number(String(caso.salida[0]).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function calcular(caso, regla, prompt) {
  const values = (caso.entradas ?? []).map(Number);
  if (!values.length || values.some((n) => !Number.isFinite(n))) return null;
  let data;
  const sentinel = /hasta (?:que se ingrese|ingresar) (?:cero|0)|termina con cero|centinela/i.test(prompt);
  const lista = !sentinel && (regla.entrada === 'lista' || /lista de datos|lista de valores|procesa una lista|lee N y luego N/i.test(prompt));
  if (sentinel) {
    if (values.at(-1) !== 0) return null;
    data = values.slice(0, -1);
  } else if (lista) {
    const n = values[0];
    if (!Number.isInteger(n) || n < 0 || values.length !== n + 1) return null;
    data = values.slice(1);
  } else {
    return null;
  }
  const seleccionados = data.filter(regla.prueba);
  return regla.accion === 'contar' ? seleccionados.length : seleccionados.reduce((total, value) => total + value, 0);
}

function crearPrompt(prompt, regla) {
  const ciclo = /REPETIR-HASTA QUE/i.test(prompt) ? 'Repetir-Hasta Que' : /MIENTRAS/i.test(prompt) ? 'Mientras' : null;
  const sentinel = /hasta (?:que se ingrese|ingresar) (?:cero|0)|termina con cero|centinela/i.test(prompt) || regla.entrada === 'sentinela';
  const instruccion = regla.accion === 'contar' ? `Cuenta ${regla.objetivo}` : `Suma ${regla.objetivo}`;
  if (sentinel) {
    return `Lee valores enteros hasta ingresar 0. Sin procesar el 0, ${instruccion.toLocaleLowerCase('es')}. Usa un ciclo ${ciclo ?? 'que termine al leer 0'} y una estructura Si.`;
  }
  if (regla.entrada === 'lista') {
    return `Lee N y luego N ${regla.elementos}. ${instruccion}. Usa un ciclo ${ciclo ?? 'Mientras'} y una estructura Si.`;
  }
  if (ciclo === 'Mientras') return `Lee N y luego N valores enteros. ${instruccion}. Usa un ciclo Mientras y una estructura Si.`;
  return `Lee valores enteros hasta ingresar 0. Sin procesar el 0, ${instruccion.toLocaleLowerCase('es')}. Usa un ciclo ${ciclo ?? 'Mientras'} y una estructura Si.`;
}

const preguntas = new Map(csvs.flatMap(leerCsvJson).map((q) => [q.id ?? q.question_id, q]));
const correcciones = [];
const pendientes = [];
const overrides = [];
for (const q of preguntas.values()) {
  const prompt = q.prompt ?? '';
  const correccionEntrada = correccionesConOrdenDeEntrada.get(Number(q.id ?? q.question_id));
  if (correccionEntrada) {
    if (validarCorreccionDeEntrada(q, correccionEntrada)) {
      const fila = { id: q.id ?? q.question_id, label: q.label, regla: correccionEntrada.tipo, promptActual: prompt, promptCorregido: correccionEntrada.prompt, casosValidados: (q.config ?? q.evaluation_config).casos.length, casoLimite: null };
      correcciones.push(fila);
      overrides.push({ ...q, prompt: correccionEntrada.prompt });
    } else {
      pendientes.push({ id: q.id ?? q.question_id, label: q.label, prompt, motivo: 'el orden de entrada propuesto no coincide con los casos' });
    }
    continue;
  }
  const regla = reglas.find((item) => item.match.test(prompt));
  if (!regla) {
    const accionExplicita = /\b(cuenta|contar|contador(?:es)?|cuenta cu[aá]nt[oa]s?|conteo|suma|sumar|acumulaci[oó]n|acumula|multiplica|calcula el [aá]rea|calcula el per[ií]metro|calcula el total|mayor|m[aá]ximo|m[ií]nimo|promedio|ordena|imprime)\b/i.test(prompt);
    const umbralEsEntrada = /\blee\b[^.]*\b(l[ií]mite|tope|umbral)\b/i.test(prompt);
    const faltaUmbral = /\b(umbral|tope|l[ií]mite|m[ií]nimo|m[aá]ximo)\b/i.test(prompt)
      && !/\b\d+(?:[.,]\d+)?\b/.test(prompt)
      && !umbralEsEntrada;
    const operacionVaga = /procesa una lista de datos|procesa una lista de valores|calcula el resultado|control de pares/i.test(prompt) && !accionExplicita;
    const conceptosMezclados = /conteo de divisiones exactas/i.test(prompt) && /progresi[oó]n/i.test(prompt);
    if (faltaUmbral || operacionVaga || conceptosMezclados) {
      pendientes.push({ id: q.id ?? q.question_id, label: q.label, prompt, motivo: conceptosMezclados ? 'combina dos retos distintos en la misma consigna' : faltaUmbral ? 'falta especificar el valor del umbral, tope o límite' : 'no declara si debe contar, sumar u otra operación' });
    }
    continue;
  }
  const config = q.config ?? q.evaluation_config ?? {};
  const casos = config.casos ?? [];
  if (!casos.length) {
    pendientes.push({ id: q.id, label: q.label, prompt, motivo: 'sin casos de prueba' });
    continue;
  }
  const resultados = casos.map((caso) => ({ esperado: salidaNumerica(caso), calculado: calcular(caso, regla, prompt) }));
  if (resultados.some(({ esperado, calculado }) => esperado === null || calculado === null || Math.abs(esperado - calculado) > 1e-6)) {
    pendientes.push({ id: q.id, label: q.label, prompt, motivo: 'la regla candidata no coincide con todos los casos', resultados });
    continue;
  }
  const promptCorregido = crearPrompt(prompt, regla);
  if (promptCorregido !== prompt) {
    const sentinel = /hasta (?:que se ingrese|ingresar) (?:cero|0)|termina con cero|centinela/i.test(prompt);
    const casoLimite = casosLimite[regla.nombre]?.[sentinel ? 'sentinela' : 'lista'];
    if (casoLimite) {
      const esperado = salidaNumerica(casoLimite);
      const calculado = calcular(casoLimite, regla, promptCorregido);
      if (esperado === null || calculado === null || Math.abs(esperado - calculado) > 1e-6) {
        pendientes.push({ id: q.id ?? q.question_id, label: q.label, prompt, motivo: 'el caso adicional de frontera no coincide con la regla propuesta', esperado, calculado });
        continue;
      }
    }
    correcciones.push({ id: q.id ?? q.question_id, label: q.label, regla: regla.nombre, promptActual: prompt, promptCorregido, casosValidados: casos.length, casoLimite: casoLimite ? { ...casoLimite, visible: false } : null });
    const configActual = q.config ?? q.evaluation_config ?? {};
    overrides.push({
      ...q,
      prompt: promptCorregido,
      config: casoLimite ? { ...configActual, casos: [...(configActual.casos ?? []), { ...casoLimite, visible: false }] } : configActual,
    });
  }
}

const reporte = {
  totalPreguntas: preguntas.size,
  preguntasConReglasConfirmadasPorTodosLosCasos: correcciones.length,
  preguntasParaRevisionManual: pendientes.length,
  correcciones,
  pendientes,
};
console.log(JSON.stringify({ ...reporte, correcciones: correcciones.length, pendientes: pendientes.length }, null, 2));
if (reportPath) {
  const target = resolve(reportPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(reporte, null, 2)}\n`, 'utf8');
}
if (overridesPath) {
  const target = resolve(overridesPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');
}
if (sqlPath) {
  const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;
  const statements = correcciones.map((row) => {
    const promptState = `    SELECT prompt INTO prompt_actual FROM algoritmos.questions WHERE question_id = ${row.id} AND label = ${quote(row.label)};\n    IF NOT FOUND THEN\n        preguntas_omitidas := preguntas_omitidas + 1;\n        RAISE NOTICE 'Se omite % (%): no existe en Supabase', ${row.id}, ${quote(row.label)};\n    ELSIF prompt_actual = ${quote(row.promptActual)} THEN\n        UPDATE algoritmos.questions SET prompt = ${quote(row.promptCorregido)} WHERE question_id = ${row.id} AND label = ${quote(row.label)};\n        GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;\n        IF filas_actualizadas <> 1 THEN RAISE EXCEPTION 'No se pudo actualizar la pregunta % (%)', ${row.id}, ${quote(row.label)}; END IF;\n        prompt_actual := ${quote(row.promptCorregido)};\n        preguntas_actualizadas := preguntas_actualizadas + 1;\n    ELSIF prompt_actual = ${quote(row.promptCorregido)} THEN\n        preguntas_ya_corregidas := preguntas_ya_corregidas + 1;\n    ELSE\n        preguntas_omitidas := preguntas_omitidas + 1;\n        RAISE NOTICE 'Se omite % (%): su consigna actual difiere del export y de esta propuesta', ${row.id}, ${quote(row.label)};\n    END IF;`;
    if (!row.casoLimite) return promptState;
    const caso = quote(JSON.stringify(row.casoLimite));
    const entradas = quote(JSON.stringify(row.casoLimite.entradas));
    const salida = quote(JSON.stringify(row.casoLimite.salida));
    const addCase = `    IF prompt_actual = ${quote(row.promptCorregido)} THEN\n        UPDATE algoritmos.questions q SET evaluation_config = jsonb_set(COALESCE(q.evaluation_config, '{}'::jsonb), '{casos}', COALESCE(q.evaluation_config->'casos', '[]'::jsonb) || ${caso}::jsonb, true) WHERE q.question_id = ${row.id} AND q.label = ${quote(row.label)} AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(q.evaluation_config->'casos', '[]'::jsonb)) AS prueba(caso) WHERE prueba.caso->'entradas' = ${entradas}::jsonb AND prueba.caso->'salida' = ${salida}::jsonb);\n    END IF;`;
    return `${promptState}\n${addCase}`;
  });
  const target = resolve(sqlPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `-- Aclara las consignas confirmadas por sus pruebas.\n-- Conserva los cambios realizados en Supabase desde la exportación:\n-- modifica solo textos intactos, reconoce textos ya corregidos y omite conflictos.\nBEGIN;\nDO $$\nDECLARE\n    prompt_actual TEXT;\n    filas_actualizadas INTEGER;\n    preguntas_actualizadas INTEGER := 0;\n    preguntas_ya_corregidas INTEGER := 0;\n    preguntas_omitidas INTEGER := 0;\nBEGIN\n${statements.join('\n')}\n    RAISE NOTICE 'Resultado: % enunciados actualizados, % ya estaban corregidos y % omitidos para revisión', preguntas_actualizadas, preguntas_ya_corregidas, preguntas_omitidas;\nEND $$;\nCOMMIT;\n`, 'utf8');
}
