// Prueba offline del evaluador (no necesita Supabase ni el servidor):  npm run test:evaluador
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { evaluarCodigo, evaluarContraReferencia, ConfigInvalida } from './src/evaluador/evaluarCodigo.js';
import { juzgarEnProlog } from './src/evaluador/prolog.js';

const configs = JSON.parse(readFileSync(new URL('./src/evaluador/configs-ejemplo.json', import.meta.url), 'utf8'));
const C = (titulo) => configs[titulo];

const SUMA = 'U1 · CÓDIGO — Suma de dos números';
const AREA = 'U1 · CÓDIGO — Área de un rectángulo';
const PAR = 'U2 · CÓDIGO — Par o impar';
const MAYOR = 'U2 · CÓDIGO — Mayor de dos números';
const TABLA = 'U3 · CÓDIGO — Tabla de multiplicar';
const MIENTRAS = 'U3 · CÓDIGO — Suma con Mientras';

const SUMA_CONDICIONAL_CW = {
  casos: [
    { entradas: ['4', '4', '3', '8', '7'], salida: ['8'] },
    { entradas: ['5', '0', '-4', '5', '12', '3'], salida: ['2'] },
    { entradas: ['3', '4', '4', '0'], salida: ['2'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'PARA', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CIRCULO_AREA_PERIMETRO = {
  casos: [
    { entradas: ['1'], salida: ['3.141592653589793', '6.283185307179586'] },
    { entradas: ['2'], salida: ['12.566370614359172', '12.566370614359172'] },
    { entradas: ['3'], salida: ['28.274333882308138', '18.84955592153876'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const MONITOREO_PEDIDOS_HASTA_CERO = {
  casos: [
    { entradas: ['3', '2', '4', '3', '0'], salida: ['3', '3', '1'] },
    { entradas: ['5', '-2', '7', '0'], salida: ['5', '1', '1'] },
    { entradas: ['2', '0'], salida: ['2', '0', '0'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'REPETIR', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CONTAR_PRODUCTOS_CANTIDAD_PAR = {
  casos: [
    { entradas: ['4', '2', '3', '6', '9'], salida: ['2'] },
    { entradas: ['3', '1', '5', '7'], salida: ['0'] },
    { entradas: ['5', '2', '4', '8', '10', '11'], salida: ['4'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

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

const codigoSumaCondicionalCW = `Algoritmo SumaCondicionalGrupoCW
  Definir N, i Como Entero
  Definir X, termino, suma Como Real
  suma <- 0
  Escribir "Ingrese la cantidad total de elementos (N):"
  Leer N
  Si N <= 0 Entonces
    Escribir "Error: La cantidad de elementos N debe ser un número entero mayor a cero."
  Sino
    Para i <- 1 Hasta N Con Paso 1 Hacer
      Escribir "Ingrese el valor entero para la cantidad ", i, ":"
      Leer X
      Si X MOD 4 = 0 Entonces
        termino <- (X * 1) + (-2)
        suma <- suma + termino
      FinSi
    FinPara
    Escribir "REPORTE TÉCNICO - GRUPO CW"
    Escribir "SUMA CONDICIONAL ACUMULADA: ", suma
  FinSi
FinAlgoritmo`;
await caso('CW: acepta solución con ciclo Para, MOD 4 y salida decorada', SUMA_CONDICIONAL_CW, codigoSumaCondicionalCW, true);

const codigoAreaPerimetroCirculo = `Algoritmo CalcularAreaYPerimetroCirculo
  Definir radio, area, perimetro, PI Como Real
  PI <- 3.14159265
  Escribir "Ingrese el radio del círculo:"
  Leer radio
  Si radio <= 0 Entonces
    Escribir "Error: El radio debe ser un valor estrictamente mayor a cero."
  Sino
    area <- PI * (radio * radio)
    perimetro <- 2 * PI * radio
    Escribir "REPORTE GEOMÉTRICO - CÍRCULO"
    Escribir "ÁREA TOTAL CALCULADA: ", area
    Escribir "PERÍMETRO CALCULADO: ", perimetro
  FinSi
FinAlgoritmo`;
await caso('Círculo: acepta área primero, perímetro después, PI aproximado y reporte', CIRCULO_AREA_PERIMETRO, codigoAreaPerimetroCirculo, true);

const codigoMonitoreoPedidos = `Algoritmo MonitoreoPedidosMinimos
  Definir pedido, minimo Como Real
  Definir contadorValidos, contadorTotal Como Entero
  contadorValidos <- 0
  contadorTotal <- 0
  Escribir "Ingrese el umbral mínimo requerido por pedido:"
  Leer minimo
  Si minimo < 0 Entonces
    Escribir "Error: El umbral mínimo no puede ser un valor negativo."
  Sino
    Repetir
      Leer pedido
      Si pedido < 0 Entonces
        Escribir "Advertencia: El pedido no puede ser negativo."
      Sino
        Si pedido <> 0 Entonces
          contadorTotal <- contadorTotal + 1
          Si pedido > minimo Entonces
            contadorValidos <- contadorValidos + 1
            Escribir "Pedido válido (supera el mínimo)."
          Sino
            Escribir "Pedido por debajo del umbral mínimo."
          FinSi
        FinSi
      FinSi
    Hasta Que pedido = 0
    Escribir "Umbral mínimo: ", minimo
    Escribir "Total de pedidos procesados: ", contadorTotal
    Escribir "Pedidos válidos (> mínimo): ", contadorValidos
  FinSi
FinAlgoritmo`;
await caso('Monitoreo: acepta centinela cero, estructura Repetir y pedido estrictamente mayor', MONITOREO_PEDIDOS_HASTA_CERO, codigoMonitoreoPedidos, true);

const codigoProductosCantidadPar = `Algoritmo ProductosCantidadPar
  Definir N, cantidad, contador, i Como Entero
  contador <- 0
  i <- 1
  Escribir "Ingrese la cantidad de productos:"
  Leer N
  Mientras i <= N Hacer
    Escribir "Ingrese la cantidad del producto ", i, ":"
    Leer cantidad
    Si cantidad MOD 2 = 0 Entonces
      contador <- contador + 1
    FinSi
    i <- i + 1
  FinMientras
  Escribir "Cantidad de productos con cantidad par: ", contador
FinAlgoritmo`;
await caso('Productos: acepta conteo de cantidades pares con Mientras y Si', CONTAR_PRODUCTOS_CANTIDAD_PAR, codigoProductosCantidadPar, true);

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
await caso('CW: rechaza sumar X + 2 en vez de X - 2', SUMA_CONDICIONAL_CW, codigoSumaCondicionalCW.replace('(X * 1) + (-2)', '(X * 1) + 2'), false);
await caso('Círculo: rechaza mostrar el perímetro antes del área', CIRCULO_AREA_PERIMETRO, codigoAreaPerimetroCirculo.replace('Escribir "ÁREA TOTAL CALCULADA: ", area\n    Escribir "PERÍMETRO CALCULADO: ", perimetro', 'Escribir "PERÍMETRO CALCULADO: ", perimetro\n    Escribir "ÁREA TOTAL CALCULADA: ", area'), false);
await caso('Monitoreo: rechaza contar pedidos iguales al mínimo como válidos', MONITOREO_PEDIDOS_HASTA_CERO, codigoMonitoreoPedidos.replace('pedido > minimo', 'pedido >= minimo'), false);
await caso('Productos: rechaza contar las cantidades impares', CONTAR_PRODUCTOS_CANTIDAD_PAR, codigoProductosCantidadPar.replace('cantidad MOD 2 = 0', 'cantidad MOD 2 <> 0'), false);
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

// Durante la migración, verifica que el juez JS mantenga los veredictos del juez Prolog.
async function compararJueces(nombre, codigo, config) {
  const directo = await evaluarCodigo(codigo, config);
  const prolog = await evaluarCodigo(codigo, config, juzgarEnProlog);
  assert.deepEqual(directo, prolog, `Los jueces discrepan en ${nombre}`);
  n++;
  console.log(`✓ ambos jueces coinciden: ${nombre}`);
}

const configParidad = {
  casos: [
    { entradas: ['2', '3'], salida: ['5'] },
    { entradas: ['10', '4'], salida: ['14'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};
await compararJueces('respuesta correcta con salida numérica', `Proceso Suma
Definir x, y, resultado Como Real
Leer x, y
resultado <- x + y
Escribir "La suma es: ", resultado
FinProceso`, configParidad);
await compararJueces('respuesta incorrecta', `Proceso Suma
Definir x, y, resultado Como Real
Leer x, y
resultado <- x - y
Escribir resultado
FinProceso`, configParidad);
await compararJueces('error de sintaxis', 'Proceso SinCierre\nEscribir 1', configParidad);
await compararJueces('estructura requerida', `Proceso Bucle
Definir i, total Como Entero
i <- 0
total <- 0
Mientras i < 1 Hacer
total <- total + 1
i <- i + 1
FinMientras
Escribir total
FinProceso`, {
  casos: [{ entradas: [], salida: ['1'] }],
  estructura: { requiere: ['MIENTRAS'], prohibe: ['PARA'], minimos: { DECLARACION: 2 } },
  comparacion: { modo: 'exacto' },
});

// Las referencias y los casos que se publican con SQL deben coincidir.
let referenciasMigracion = 0;
for (const archivo of [
  new URL('./supabase/migrations/011_fix_beginner_questions_and_weighted_tests.sql', import.meta.url),
  new URL('./supabase/migrations/012_repair_failed_loop_question_cases.sql', import.meta.url),
]) {
  const sql = readFileSync(archivo, 'utf8');
  for (const [sentencia] of sql.matchAll(/UPDATE\s+algoritmos\.questions\s+SET[\s\S]*?;/gi)) {
    const respuesta = sentencia.match(/expected_answer\s*=\s*\$(\w+)\$([\s\S]*?)\$\1\$/i)?.[2]?.trim();
    const configTexto = sentencia.match(/evaluation_config\s*=\s*'([\s\S]*?)'::jsonb/i)?.[1];
    if (!respuesta || !configTexto) continue;
    const resultado = await evaluarCodigo(respuesta, JSON.parse(configTexto));
    const id = sentencia.match(/WHERE\s+question_id\s*=\s*(\d+)/i)?.[1] ?? '?';
    assert.equal(resultado.correcto, true, `La referencia de ${id} incluida en la migración debe pasar sus casos: ${resultado.mensaje}`);
    referenciasMigracion++;
  }
}
assert.equal(referenciasMigracion, 15, 'Se deben validar la referencia de costo total y las catorce preguntas reparadas');
n++;
console.log('✓ las referencias y los casos de las migraciones coinciden');

console.log(`\nTodo en orden: ${n} comprobaciones.`);
process.exit(0);
