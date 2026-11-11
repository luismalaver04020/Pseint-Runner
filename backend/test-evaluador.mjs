// Prueba offline del evaluador (no necesita Supabase ni el servidor):  npm run test:evaluador
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { evaluarCodigo, evaluarContraReferencia, ConfigInvalida } from './src/evaluador/evaluarCodigo.js';

const configs = JSON.parse(readFileSync(new URL('./src/evaluador/configs-ejemplo.json', import.meta.url), 'utf8'));
const C = (titulo) => configs[titulo];

const SUMA = 'U1 · CÓDIGO — Suma de dos números';
const AREA = 'U1 · CÓDIGO — Área de un rectángulo';
const PAR = 'U2 · CÓDIGO — Par o impar';
const MAYOR = 'U2 · CÓDIGO — Mayor de dos números';
const TABLA = 'U3 · CÓDIGO — Tabla de multiplicar';
const MIENTRAS = 'U3 · CÓDIGO — Suma con Mientras';

let n = 0;
async function caso(nombre, titulo, codigo, esperado, extra) {
  const r = await evaluarCodigo(codigo, typeof titulo === 'string' ? C(titulo) : titulo);
  assert.equal(r.correcto, esperado, `${nombre}\n${r.mensaje}\n${JSON.stringify(r.motivos)}`);
  if (extra) extra(r);
  n++;
  console.log(`${esperado ? '✓' : '✗'} (${esperado ? 'aprueba' : 'rechaza'}) ${nombre}`);
}

// ── Soluciones correctas (las del campo "ejemplo" del juego) ──
await caso('Suma: solución de ejemplo', SUMA, `Proceso Suma
  Definir a, b, suma Como Entero
  Leer a
  Leer b
  suma <- a + b
  Escribir suma
FinProceso`, true);
await caso('Suma: con texto alrededor del resultado', SUMA, `Proceso Suma
  Definir a, b, suma Como Entero
  Leer a
  Leer b
  suma <- a + b
  Escribir "La suma es: ", suma
FinProceso`, true);
await caso('Área: solución de ejemplo', AREA, `Proceso Area
  Definir base, altura, area Como Real
  Leer base
  Leer altura
  area <- base * altura
  Escribir area
FinProceso`, true);
{
  const codigoConValidacionYMensajes = `Algoritmo CalcularAreaRectangulo
  Definir base, altura, area Como Real
  Escribir "Ingrese la longitud de la base del rectángulo:"
  Leer base
  Escribir "Ingrese la longitud de la altura del rectángulo:"
  Leer altura
  Si base > 0 Y altura > 0 Entonces
    area <- base * altura
    Escribir "--------------------------------------------------"
    Escribir "El área del rectángulo es: ", area
    Escribir "--------------------------------------------------"
  Sino
    Escribir "Error: La base y la altura deben ser valores mayores que cero."
  FinSi
FinAlgoritmo`;
  const r = await evaluarContraReferencia(codigoConValidacionYMensajes, `Proceso Area
  Definir base, altura, area Como Real
  Leer base
  Leer altura
  area <- base * altura
  Escribir area
FinProceso`, {}, 'Calcula el área de un rectángulo con base y altura positivas.');
  assert.equal(r.correcto, true, `Área con validación y mensajes\n${r.mensaje}\n${JSON.stringify(r.motivos)}`);
  n++;
  console.log('✓ (aprueba) Área: acepta validación positiva, mensajes y separadores');
}
{
  const ponderado = {
    casos: [
      { entradas: ['16', '30', '18', '30', '14', '40'], salida: ['15.8'] },
      { entradas: ['18', '33', '22', '35', '20', '32'], salida: ['20.04'] },
      { entradas: ['32', '20', '72', '30', '84', '50'], salida: ['70'], visible: false },
    ],
    estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA'] },
    comparacion: { modo: 'numeros', tolerancia: 0.000001 },
  };
  const codigo = `Algoritmo CalcularCalificacionPonderada
  Definir nota1, nota2, nota3 Como Real
  Definir peso1, peso2, peso3 Como Real
  Definir calificacionFinal Como Real
  Leer nota1
  Leer peso1
  Leer nota2
  Leer peso2
  Leer nota3
  Leer peso3
  Si (peso1 + peso2 + peso3 <> 100) Entonces
    Escribir "Error: la suma de los porcentajes debe ser 100%."
  Sino
    Si (nota1 < 0 O nota2 < 0 O nota3 < 0 O peso1 < 0 O peso2 < 0 O peso3 < 0) Entonces
      Escribir "Error: no se permiten valores negativos."
    Sino
      calificacionFinal <- (nota1 * (peso1 / 100)) + (nota2 * (peso2 / 100)) + (nota3 * (peso3 / 100))
      Escribir "CALIFICACIÓN FINAL PONDERADA: ", calificacionFinal
    FinSi
  FinSi
FinAlgoritmo`;
  const r = await evaluarCodigo(codigo, ponderado);
  assert.equal(r.correcto, true, `Ponderado con pesos válidos\n${r.mensaje}\n${JSON.stringify(r.motivos)}`);
  n++;
  console.log('✓ (aprueba) Promedio ponderado: los tres casos usan pesos que suman 100');
}
await caso('Par/Impar: solución de ejemplo', PAR, `Proceso ParImpar
  Definir n Como Entero
  Leer n
  Si n MOD 2 = 0 Entonces
    Escribir "Par"
  SiNo
    Escribir "Impar"
  FinSi
FinProceso`, true);
await caso('Par/Impar: sin distinguir mayúsculas ("PAR")', PAR, `Proceso ParImpar
  Definir n Como Entero
  Leer n
  Si n MOD 2 = 0 Entonces
    Escribir "PAR"
  SiNo
    Escribir "IMPAR"
  FinSi
FinProceso`, true);
await caso('Mayor: solución de ejemplo', MAYOR, `Proceso Mayor
  Definir a, b Como Entero
  Leer a
  Leer b
  Si a > b Entonces
    Escribir a
  SiNo
    Escribir b
  FinSi
FinProceso`, true);
await caso('Tabla: formato "5 x 1 = 5"', TABLA, `Proceso Tabla
  Definir n, i Como Entero
  Leer n
  Para i <- 1 Hasta 10 Hacer
    Escribir n, " x ", i, " = ", n*i
  FinPara
FinProceso`, true);
await caso('Tabla: solo los resultados', TABLA, `Proceso Tabla
  Definir n, i Como Entero
  Leer n
  Para i <- 1 Hasta 10 Hacer
    Escribir n*i
  FinPara
FinProceso`, true);
await caso('Mientras: solución de ejemplo', MIENTRAS, `Proceso SumaMientras
  Definir i, suma Como Entero
  i <- 1
  suma <- 0
  Mientras i <= 10 Hacer
    suma <- suma + i
    i <- i + 1
  FinMientras
  Escribir suma
FinProceso`, true);

// ── Soluciones incorrectas ──
await caso('Suma: resta en vez de suma (salida distinta)', SUMA, `Proceso Suma
  Definir a, b, suma Como Entero
  Leer a
  Leer b
  suma <- a - b
  Escribir suma
FinProceso`, false, (r) => {
  assert.ok(r.motivos.some((m) => m.codigo === 'falta_palabra' && m.palabra === '+'));
  assert.ok(r.motivos.some((m) => m.codigo === 'salida_distinta'));
});
await caso('Par/Impar: respuestas invertidas', PAR, `Proceso ParImpar
  Definir n Como Entero
  Leer n
  Si n MOD 2 = 0 Entonces
    Escribir "Impar"
  SiNo
    Escribir "Par"
  FinSi
FinProceso`, false);
await caso('Par/Impar: "impar" para un par no se cuela como "Par"', PAR, `Proceso ParImpar
  Definir n Como Entero
  Leer n
  Si n MOD 2 = 0 Entonces
    Escribir "El numero es impar"
  SiNo
    Escribir "El numero es impar"
  FinSi
FinProceso`, false);
await caso('Par/Impar: sin SiNo (falta estructura)', PAR, `Proceso ParImpar
  Definir n Como Entero
  Leer n
  Si n MOD 2 = 0 Entonces
    Escribir "Par"
  FinSi
FinProceso`, false, (r) => assert.ok(r.motivos.some((m) => m.codigo === 'falta_estructura' && m.tipo === 'SINO')));
await caso('Mientras: usa Para (estructura prohibida)', MIENTRAS, `Proceso SumaMientras
  Definir i, suma Como Entero
  suma <- 0
  Para i <- 1 Hasta 10 Hacer
    suma <- suma + i
  FinPara
  Escribir suma
FinProceso`, false, (r) => {
  assert.ok(r.motivos.some((m) => m.codigo === 'estructura_prohibida'));
  assert.ok(r.motivos.some((m) => m.codigo === 'falta_estructura' && m.tipo === 'MIENTRAS'));
});
await caso('Tabla: resultados erróneos', TABLA, `Proceso Tabla
  Definir n, i Como Entero
  Leer n
  Para i <- 1 Hasta 10 Hacer
    Escribir n+i
  FinPara
FinProceso`, false);
await caso('Palabra clave solo en un comentario no cuenta', PAR, `Proceso ParImpar
  Definir n Como Entero
  // usar MOD
  Leer n
  Si n > 0 Entonces
    Escribir "Par"
  SiNo
    Escribir "Impar"
  FinSi
FinProceso`, false, (r) => assert.ok(r.motivos.some((m) => m.codigo === 'falta_palabra')));
await caso('MOD dentro de otro identificador no cuenta', PAR, `Proceso ParImpar
  Definir modelo Como Entero
  Leer modelo
  Si modelo > 0 Entonces
    Escribir "Par"
  SiNo
    Escribir "Impar"
  FinSi
FinProceso`, false, (r) => assert.ok(r.motivos.some((m) => m.codigo === 'falta_palabra' && m.palabra === 'MOD')));

// ── Errores del alumno ──
await caso('Error de sintaxis (falta FinProceso)', SUMA, `Proceso Suma
  Definir a Como Entero
  Leer a
  Escribir a`, false, (r) => {
  assert.equal(r.motivos[0].codigo, 'error_sintaxis');
  assert.match(r.mensaje, /FinAlgoritmo|FinProceso/);
});
await caso('Error al ejecutar (variable sin declarar)', SUMA, `Proceso Suma
  Leer a
  Escribir a
FinProceso`, false);
await caso('Bucle infinito se corta (no cuelga el servidor)', MIENTRAS, `Proceso Infinito
  Definir i Como Entero
  i <- 1
  Mientras i > 0 Hacer
    i <- i + 1
  FinMientras
  Escribir i
FinProceso`, false, (r) => assert.match(JSON.stringify(r.casos), /límite de instrucciones/));

// ── Casos ocultos ──
await caso('Caso oculto no revela entradas ni salida esperada', SUMA, `Proceso Suma
  Definir a, b, suma Como Entero
  Leer a
  Leer b
  suma <- a + b + 1
  Escribir suma
FinProceso`, false, (r) => {
  const oculto = r.casos.find((c) => !c.visible);
  assert.deepEqual(Object.keys(oculto).sort(), ['id', 'paso', 'visible']);
});

// ── Seguridad: lo que escribe el alumno es dato, nunca consulta Prolog ──
await caso('Código con comillas y sintaxis Prolog no altera el juez', PAR, `Proceso ParImpar
  Definir n Como Entero
  Leer n
  Si n MOD 2 = 0 Entonces
    Escribir "Par'), halt. %\\"
  SiNo
    Escribir "Impar"
  FinSi
FinProceso`, false);

// ── Configuración inválida ──
for (const [nombre, cfg] of Object.entries({
  'config vacía': {},
  'tipo de estructura mal escrito': { casos: [{ entradas: [], salida: ['1'] }], estructura: { requiere: ['MIENTRA'] } },
  'caso sin salida': { casos: [{ entradas: ['1'] }] },
  'modo desconocido': { casos: [{ entradas: [], salida: ['1'] }], comparacion: { modo: 'raro' } },
})) {
  await assert.rejects(() => evaluarCodigo('Proceso A\n Escribir 1\nFinProceso', cfg), ConfigInvalida, nombre);
  n++;
  console.log(`✓ (rechaza config) ${nombre}`);
}

// ── Carga: 300 evaluaciones seguidas ──
const t0 = Date.now();
for (let i = 0; i < 300; i++) {
  await evaluarCodigo(`Proceso Suma
  Definir a, b, suma Como Entero
  Leer a
  Leer b
  suma <- a + b
  Escribir suma
FinProceso`, C(SUMA));
}
console.log(`✓ 300 evaluaciones seguidas en ${Date.now() - t0} ms (memoria: ${Math.round(process.memoryUsage().rss / 1048576)} MB)`);



// ── Compatibilidad con preguntas legacy: comparación contra expected_answer ──
const referenciaMientras = `Proceso Suma
  Definir i, suma Como Entero
  i <- 1
  suma <- 0
  Mientras i <= 10 Hacer
    suma <- suma + i
    i <- i + 1
  FinMientras
  Escribir suma
FinProceso`;
const solucionParaEquivalente = `Proceso Suma
  Definir i, total Como Entero
  total <- 0
  Para i <- 1 Hasta 10 Hacer
    total <- total + i
  FinPara
  Escribir "Resultado: ", total
FinProceso`;
const rEquivalente = await evaluarContraReferencia(solucionParaEquivalente, referenciaMientras, { keywords: ['Mientras'], min_ratio: 0.6 });
assert.equal(rEquivalente.correcto, true, 'Debe aceptar Para cuando la referencia usa Mientras si el resultado coincide');
n++;
console.log('✓ acepta estructura distinta con comportamiento equivalente');
const rIncorrecto = await evaluarContraReferencia(`Proceso Suma
  Definir i, total Como Entero
  total <- 0
  Para i <- 1 Hasta 10 Hacer
    total <- total + i + 1
  FinPara
  Escribir total
FinProceso`, referenciaMientras, { keywords: ['Mientras'], min_ratio: 0.6 });
assert.equal(rIncorrecto.correcto, false, 'Debe rechazar una solución con resultado incorrecto');
n++;
console.log('✓ rechaza algoritmo distinto con resultado incorrecto');

console.log(`\nTodo en orden: ${n} comprobaciones.`);
process.exit(0);
