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

const CIRCULO_AREA_PERIMETRO = {
  casos: [
    { entradas: ['1'], salida: ['3.141592653589793', '6.283185307179586'] },
    { entradas: ['2'], salida: ['12.566370614359172', '12.566370614359172'] },
    { entradas: ['3'], salida: ['28.274333882308138', '18.84955592153876'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const SUMA_PRODUCTOS_CANTIDAD_PAR = {
  casos: [
    { entradas: ['4', '3', '-2', '4', '6'], salida: ['8'] },
    { entradas: ['5', '4', '10', '-3', '5', '8'], salida: ['22'] },
    { entradas: ['4', '2', '0', '12', '-6'], salida: ['8'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CONTAR_MONTOS_INFERIORES_A_100 = {
  casos: [
    { entradas: ['3', '-2', '4', '0'], salida: ['3'] },
    { entradas: ['4', '10', '-3', '5', '0'], salida: ['4'] },
    { entradas: ['100', '99', '0'], salida: ['1'] },
    { entradas: ['0'], salida: ['0'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CW_PREGUNTA_PUBLICADA = {
  casos: [
    { entradas: ['4', '0', '3', '6', '4'], salida: ['0'] },
    { entradas: ['5', '-2', '0', '3', '6', '4'], salida: ['0'] },
    { entradas: ['0'], salida: ['0'] },
    { entradas: ['3', '3', '6', '0'], salida: ['-2'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'PARA', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CONTAR_MAYORES_100_CENTINELA = {
  casos: [
    { entradas: ['99', '100', '101', '200', '0'], salida: ['2'] },
    { entradas: ['100', '150', '0'], salida: ['1'] },
    { entradas: ['0'], salida: ['0'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CONTAR_MAYORES_100_REPETIR = {
  casos: CONTAR_MAYORES_100_CENTINELA.casos,
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'REPETIR', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CONTAR_MAYORES_100_LISTA = {
  casos: [
    { entradas: ['4', '99', '100', '101', '200'], salida: ['2'] },
    { entradas: ['3', '100', '150', '200'], salida: ['2'] },
    { entradas: ['2', '50', '100'], salida: ['0'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CONTAR_PUNTAJES_MIN_11 = {
  casos: [
    { entradas: ['10', '11', '14', '0'], salida: ['2'] },
    { entradas: ['11', '9', '15', '0'], salida: ['2'] },
    { entradas: ['0'], salida: ['0'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};

const CONTAR_PUNTAJES_MIN_11_REPETIR = {
  casos: CONTAR_PUNTAJES_MIN_11.casos,
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'REPETIR', 'CONDICIONAL'] },
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
  Para i <- 1 Hasta N Con Paso 1 Hacer
    Escribir "Ingrese el valor entero para la cantidad ", i, ":"
    Leer X
    Si X MOD 4 = 0 Entonces
      termino <- (X * 1) + (-2)
      suma <- suma + termino
    FinSi
  FinPara
  Escribir "SUMA CONDICIONAL ACUMULADA: ", suma
FinAlgoritmo`;
await caso('CW publicado: acepta N=0 y conserva el acumulador inicializado', CW_PREGUNTA_PUBLICADA, codigoSumaCondicionalCW, true);

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
  Escribir "Cantidad de productos pares: ", contador
FinAlgoritmo`;
const CONTAR_PRODUCTOS_CANTIDAD_PAR = {
  casos: [
    { entradas: ['4', '3', '-2', '4', '6'], salida: ['3'] },
    { entradas: ['5', '4', '10', '-3', '5', '8'], salida: ['3'] },
    { entradas: ['4', '2', '0', '12', '-6'], salida: ['4'] },
    { entradas: ['0'], salida: ['0'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};
await caso('Productos: cuenta cantidades pares según la consigna', CONTAR_PRODUCTOS_CANTIDAD_PAR, codigoProductosCantidadPar, true);
await caso('Productos: rechaza sumar cantidades cuando la consigna pide contarlas', CONTAR_PRODUCTOS_CANTIDAD_PAR, codigoProductosCantidadPar.replace('contador <- contador + 1', 'contador <- contador + cantidad'), false);

const codigoSumaProductosCantidadPar = `Algoritmo SumarCantidadesPares
  Definir N, cantidad, suma, i Como Entero
  suma <- 0
  i <- 1
  Leer N
  Mientras i <= N Hacer
    Leer cantidad
    Si cantidad MOD 2 = 0 Entonces
      suma <- suma + cantidad
    FinSi
    i <- i + 1
  FinMientras
  Escribir suma
FinAlgoritmo`;
await caso('Productos: conserva la suma cuando la operación está explícita', SUMA_PRODUCTOS_CANTIDAD_PAR, codigoSumaProductosCantidadPar, true);
await caso('Productos: rechaza contar cuando la operación explícita es sumar', SUMA_PRODUCTOS_CANTIDAD_PAR, codigoSumaProductosCantidadPar.replace('suma <- suma + cantidad', 'suma <- suma + 1'), false);

const codigoMontosInferiores = `Algoritmo MontosInferioresAlLimite
  Definir monto, contador Como Entero
  contador <- 0
  Escribir "Ingrese un monto (0 para terminar):"
  Leer monto
  Mientras monto <> 0 Hacer
    Si monto < 100 Entonces
      contador <- contador + 1
    FinSi
    Escribir "Ingrese otro monto (0 para terminar):"
    Leer monto
  FinMientras
  Escribir "Cantidad de montos inferiores a 100: ", contador
FinAlgoritmo`;
await caso('Montos: cuenta valores menores que 100 y excluye el centinela', CONTAR_MONTOS_INFERIORES_A_100, codigoMontosInferiores, true);
await caso('Montos: rechaza sumar valores cuando la consigna pide contarlos', CONTAR_MONTOS_INFERIORES_A_100, codigoMontosInferiores.replace('contador <- contador + 1', 'contador <- contador + monto'), false);

const CONTAR_MONTOS_REPETIR = {
  ...CONTAR_MONTOS_INFERIORES_A_100,
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'REPETIR', 'CONDICIONAL'] },
};
const codigoMontosInferioresRepetir = `Algoritmo MontosInferioresAlLimite
  Definir monto, contador Como Entero
  contador <- 0
  Repetir
    Leer monto
    Si monto <> 0 Y monto < 100 Entonces
      contador <- contador + 1
    FinSi
  Hasta Que monto = 0
  Escribir "Cantidad de montos inferiores a 100: ", contador
FinAlgoritmo`;
await caso('Montos: cuenta con Repetir y excluye el centinela', CONTAR_MONTOS_REPETIR, codigoMontosInferioresRepetir, true);
await caso('Montos: rechaza sumar valores cuando Repetir debe contarlos', CONTAR_MONTOS_REPETIR, codigoMontosInferioresRepetir.replace('contador <- contador + 1', 'contador <- contador + monto'), false);

const codigoContarMayoresMientras = `Algoritmo ContarMayores
  Definir valor, contador Como Entero
  contador <- 0
  Leer valor
  Mientras valor <> 0 Hacer
    Si valor > 100 Entonces
      contador <- contador + 1
    FinSi
    Leer valor
  FinMientras
  Escribir contador
FinAlgoritmo`;
await caso('Secuencia: detecta mayores que 100, respeta > estricto y excluye el centinela', CONTAR_MAYORES_100_CENTINELA, codigoContarMayoresMientras, true);
await caso('Secuencia: rechaza incluir el límite 100', CONTAR_MAYORES_100_CENTINELA, codigoContarMayoresMientras.replace('valor > 100', 'valor >= 100'), false);

const codigoContarMayoresRepetir = `Algoritmo ContarMayoresRepetir
  Definir valor, contador Como Entero
  contador <- 0
  Repetir
    Leer valor
    Si valor <> 0 Y valor > 100 Entonces
      contador <- contador + 1
    FinSi
  Hasta Que valor = 0
  Escribir contador
FinAlgoritmo`;
await caso('Secuencia: procesa centinela con Repetir sin contarlo', CONTAR_MAYORES_100_REPETIR, codigoContarMayoresRepetir, true);

const codigoContarLista = `Algoritmo ContarMayoresLista
  Definir N, i, valor, contador Como Entero
  Leer N
  i <- 1
  contador <- 0
  Mientras i <= N Hacer
    Leer valor
    Si valor > 100 Entonces
      contador <- contador + 1
    FinSi
    i <- i + 1
  FinMientras
  Escribir contador
FinAlgoritmo`;
await caso('Lista: lee exactamente N datos y cuenta solo mayores que 100', CONTAR_MAYORES_100_LISTA, codigoContarLista, true);

const codigoPuntajesMinimos = `Algoritmo ContarPuntajes
  Definir puntaje, contador Como Entero
  contador <- 0
  Leer puntaje
  Mientras puntaje <> 0 Hacer
    Si puntaje >= 11 Entonces
      contador <- contador + 1
    FinSi
    Leer puntaje
  FinMientras
  Escribir contador
FinAlgoritmo`;
await caso('Puntajes: cuenta 11 como mínimo y detiene el ciclo con cero', CONTAR_PUNTAJES_MIN_11, codigoPuntajesMinimos, true);
await caso('Puntajes: rechaza usar > 11 y excluir el mínimo exacto', CONTAR_PUNTAJES_MIN_11, codigoPuntajesMinimos.replace('puntaje >= 11', 'puntaje > 11'), false);

const codigoPuntajesRepetir = codigoContarMayoresRepetir
  .replaceAll('ContarMayoresRepetir', 'ContarPuntajesRepetir')
  .replaceAll('valor', 'puntaje')
  .replaceAll('puntaje > 100', 'puntaje >= 11');
await caso('Puntajes: cuenta los que alcanzan 11 usando Repetir', CONTAR_PUNTAJES_MIN_11_REPETIR, codigoPuntajesRepetir, true);

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
await caso('CW: rechaza sumar X + 2 en vez de X - 2', CW_PREGUNTA_PUBLICADA, codigoSumaCondicionalCW.replace('(X * 1) + (-2)', '(X * 1) + 2'), false);
await caso('CW: rechaza bloquear N=0 cuando la salida esperada es suma cero', CW_PREGUNTA_PUBLICADA, codigoSumaCondicionalCW.replace('Para i <- 1 Hasta N Con Paso 1 Hacer', 'Si N <= 0 Entonces\n    Escribir "Error"\n  Sino\n  Para i <- 1 Hasta N Con Paso 1 Hacer').replace('FinAlgoritmo', '  FinSi\nFinAlgoritmo'), false);
await caso('Círculo: rechaza mostrar el perímetro antes del área', CIRCULO_AREA_PERIMETRO, codigoAreaPerimetroCirculo.replace('Escribir "ÁREA TOTAL CALCULADA: ", area\n    Escribir "PERÍMETRO CALCULADO: ", perimetro', 'Escribir "PERÍMETRO CALCULADO: ", perimetro\n    Escribir "ÁREA TOTAL CALCULADA: ", area'), false);
await caso('Productos: rechaza seleccionar cantidades impares', CONTAR_PRODUCTOS_CANTIDAD_PAR, codigoProductosCantidadPar.replace('cantidad MOD 2 = 0', 'cantidad MOD 2 <> 0'), false);
await caso('Montos: rechaza incluir el límite 100 como inferior', CONTAR_MONTOS_INFERIORES_A_100, codigoMontosInferiores.replace('monto < 100', 'monto <= 100'), false);
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

const configTildes = {
  casos: [{ entradas: [], salida: ['¡Aprobación rápida!'] }],
  estructura: { requiere_texto: ['APROBACIÓN'] },
  comparacion: { modo: 'exacto', ignorar_mayusculas: true, ignorar_tildes: true },
};
await compararJueces('acepta mayúsculas y vocales sin tilde también en requisitos', `Proceso Texto
Escribir "¡Aprobacion rapida!"
FinProceso`, configTildes);
assert.equal((await evaluarCodigo(`Proceso Texto
Escribir "¡Aprobacion rapida!"
FinProceso`, configTildes)).correcto, true);

const configUnicodeCombinado = {
  casos: [{ entradas: [], salida: ['ñandú'] }],
  estructura: { requiere_texto: ['ñandú'] },
  comparacion: { modo: 'exacto', ignorar_tildes: true },
};
const codigoUnicodeCombinado = `Proceso Texto
Escribir "n\u0303andu\u0301"
FinProceso`;
await compararJueces('normaliza tildes Unicode combinadas y conserva ñ', codigoUnicodeCombinado, configUnicodeCombinado);
assert.equal((await evaluarCodigo(codigoUnicodeCombinado, configUnicodeCombinado)).correcto, true);

const configEne = {
  casos: [{ entradas: [], salida: ['año'] }],
  comparacion: { modo: 'exacto', ignorar_mayusculas: true, ignorar_tildes: true },
};
await compararJueces('conserva la diferencia entre n y ñ', `Proceso Texto
Escribir "ano"
FinProceso`, configEne);
const resultadoEne = await evaluarCodigo(`Proceso Texto
Escribir "ano"
FinProceso`, configEne);
assert.equal(resultadoEne.correcto, false, 'Ignorar tildes no debe convertir n en ñ');
assert.equal((await evaluarCodigo(`Proceso Texto
Escribir "ano"
FinProceso`, configEne, juzgarEnProlog)).correcto, false);

const configAcentoDesactivado = {
  casos: [{ entradas: [], salida: ['aprobación'] }],
  comparacion: { modo: 'exacto', ignorar_mayusculas: true, ignorar_tildes: false },
};
await compararJueces('respeta ignorar_tildes=false', `Proceso Texto
Escribir "aprobacion"
FinProceso`, configAcentoDesactivado);
assert.equal((await evaluarCodigo(`Proceso Texto
Escribir "aprobacion"
FinProceso`, configAcentoDesactivado)).correcto, false);

const configEtiquetaNumerica = {
  casos: [{ entradas: [], salida: ['7'] }],
  comparacion: { modo: 'exacto', tolerancia: 0.000001 },
};
const codigoEtiquetaNumerica = `Proceso Resultado
Escribir "Resultado calculado: ", 7
FinProceso`;
await compararJueces('acepta etiqueta decorativa junto a resultado numérico', codigoEtiquetaNumerica, configEtiquetaNumerica);
assert.equal((await evaluarCodigo(codigoEtiquetaNumerica, configEtiquetaNumerica)).correcto, true);

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
