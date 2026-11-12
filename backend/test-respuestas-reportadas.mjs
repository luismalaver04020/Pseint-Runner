import assert from 'node:assert/strict';
import { evaluarCodigo } from './src/evaluador/evaluarCodigo.js';
import { generarSolucionPrueba } from './src/evaluador/generarSolucionPrueba.js';

const configGrupoDR = {
  casos: [
    { entradas: ['4', '0', '3', '7', '7'], salida: ['31'] },
    { entradas: ['5', '-2', '0', '3', '7', '7'], salida: ['31'] },
    { entradas: ['0'], salida: ['0'], visible: false },
    { entradas: ['3', '3', '7', '0'], salida: ['18'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'PARA', 'CONDICIONAL'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};
const respuestaGrupoDR = `Algoritmo Grupo_DR
    Definir N, X, suma Como Entero
    suma <- 0
    Leer N
    Para i <- 1 Hasta N Hacer
        Leer X
        Si X >= 3 Y X <= 7 Entonces
            suma <- suma + (X * 2 + (-1))
        FinSi
    FinPara
    Escribir suma
FinAlgoritmo`;
const solucionGrupoDR = respuestaGrupoDR.replace('Definir N, X, suma', 'Definir N, i, X, suma');

const configVuelto = {
  casos: [
    { entradas: ['30', '50'], salida: ['20'] },
    { entradas: ['75', '100'], salida: ['25'] },
    { entradas: ['20', '20'], salida: ['0'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA'] },
  comparacion: { modo: 'numeros', tolerancia: 0.000001 },
};
const respuestaVuelto = `Algoritmo Calcular_Vuelto
    Definir compra, pago, vuelto Como Real
    Escribir "Ingrese el monto de la compra:"
    Leer compra
    Escribir "Ingrese el monto pagado:"
    Leer pago
    vuelto <- pago - compra
    Escribir "El vuelto es: ", vuelto
FinAlgoritmo`;

const configCriterios = {
  casos: [
    { entradas: ['19', '83'], salida: ['Aprobado con prioridad'] },
    { entradas: ['19', '81'], salida: ['Requiere validación técnica'] },
    { entradas: ['17', '81'], salida: ['No autorizado'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'CONDICIONAL', 'SINO', 'ESCRITURA'] },
  comparacion: { modo: 'exacto', tolerancia: 0.000001, ignorar_mayusculas: true },
};
const respuestaCriterios = `Algoritmo Evaluar_Autorizacion
    Definir nota, asistencia Como Real
    Leer nota
    Leer asistencia
    Si nota >= 18 Y asistencia >= 82 Entonces
        Escribir "Aprobado con prioridad"
    Sino
        Si nota >= 18 O asistencia >= 82 Entonces
            Escribir "Requiere validacion tecnica"
        Sino
            Escribir "No autorizado"
        FinSi
    FinSi
FinAlgoritmo`;

const resultados = [];
async function verificar(nombre, codigo, config, esperado) {
  const resultado = await evaluarCodigo(codigo, config);
  assert.equal(resultado.correcto, esperado, `${nombre}: ${resultado.mensaje}`);
  resultados.push({ pregunta: nombre, esperado, correcto: resultado.correcto, casos_ok: resultado.casos_ok, casos_total: resultado.casos_total, motivos: resultado.motivos });
}

await verificar('Grupo DR: respuesta enviada sin declarar i', respuestaGrupoDR, configGrupoDR, false);
await verificar('Grupo DR: misma respuesta declarando i', solucionGrupoDR, configGrupoDR, true);
await verificar('Vuelto: solución enviada con compra primero y pago después', respuestaVuelto, configVuelto, true);
await verificar('Doble criterio: acepta salida sin tildes', respuestaCriterios, configCriterios, true);

async function verificarGenerada(nombre, label, prompt, config) {
  const candidata = generarSolucionPrueba({ label, prompt, evaluation_config: config });
  assert.ok(candidata?.codigo, `${nombre}: se esperaba generar una respuesta`);
  await verificar(nombre, candidata.codigo, config, true);
}

await verificarGenerada('Generador: reto de suma condicional grupo DR', 'U3-HC-217',
  'En la actividad escolar del grupo DR, lee N y luego N cantidades enteras. Suma X * 2 + (-1) solo cuando X cumpla X >= 3 Y X <= 7; muestra la suma. Usa un ciclo Para.', configGrupoDR);

await verificarGenerada('Generador: suma impares desde 1 hasta N', 'U3-IC-003',
  'Suma solo los valores impares desde 1 hasta n. Escribe un algoritmo PSeInt que lea n y muestre el resultado. Resuélvelo usando un ciclo Para.', {
    casos: [{ entradas: ['3'], salida: ['4'] }, { entradas: ['6'], salida: ['9'] }],
    estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'PARA', 'CONDICIONAL'] },
    comparacion: { modo: 'numeros', tolerancia: 0.000001 },
  });

await verificarGenerada('Generador: suma valores positivos impares', 'U3-HC-285',
  'Lee N y luego N números enteros. Suma los valores positivos impares y muestra el resultado. Usa un ciclo Para y una estructura Si.', {
    casos: [{ entradas: ['4', '-3', '0', '4', '7'], salida: ['7'] }, { entradas: ['4', '5', '-5', '2', '3'], salida: ['8'] }],
    estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'PARA', 'CONDICIONAL'] },
    comparacion: { modo: 'numeros', tolerancia: 0.000001 },
  });

await verificarGenerada('Generador: conversión km a m, cm y mm', 'U1-IC-006',
  'Convierte una distancia en kilómetros a metros, centímetros y milímetros.', {
    casos: [{ entradas: ['1.5'], salida: ['1500', '150000', '1500000'] }],
    comparacion: { modo: 'numeros', tolerancia: 0.000001 },
  });

await verificarGenerada('Generador: cuenta pares estrictamente mayores que 2 en una lista', 'U3-HC-239',
  'Lee N y luego N valores enteros. Cuenta los valores pares mayores que 2. Usa un ciclo Mientras y una estructura Si.', {
    casos: [
      { entradas: ['4', '3', '-2', '4', '6'], salida: ['2'] },
      { entradas: ['5', '4', '10', '-3', '5', '8'], salida: ['3'] },
      { entradas: ['4', '2', '0', '12', '-6'], salida: ['1'], visible: false },
      { entradas: ['3', '2', '4', '6'], salida: ['2'], visible: false },
    ],
    estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS', 'CONDICIONAL'] },
    comparacion: { modo: 'numeros', tolerancia: 0.000001 },
  });

await verificarGenerada('Generador: cuenta pares mayores que 2 con Repetir y centinela', 'U3-HC-279',
  'Lee valores enteros hasta ingresar 0. Sin procesar el 0, cuenta los valores pares mayores que 2. Usa un ciclo Repetir-Hasta Que y una estructura Si.', {
    casos: [
      { entradas: ['3', '-2', '4', '0'], salida: ['1'] },
      { entradas: ['4', '10', '-3', '5', '0'], salida: ['2'] },
      { entradas: ['2', '0'], salida: ['0'], visible: false },
      { entradas: ['2', '4', '6', '0'], salida: ['2'], visible: false },
    ],
    estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'REPETIR', 'CONDICIONAL'] },
    comparacion: { modo: 'numeros', tolerancia: 0.000001 },
  });

await verificarGenerada('Generador: imprime progresión con incremento y límite', 'U3-IC-039',
  'Lee el valor inicial, el incremento y el límite. Imprime la progresión comenzando en el valor inicial y sumando el incremento mientras no se supere el límite. Usa un ciclo Mientras.', {
    casos: [
      { entradas: ['2', '3', '11'], salida: ['2', '5', '8', '11'] },
      { entradas: ['1', '4', '10'], salida: ['1', '5', '9'] },
      { entradas: ['5', '2', '8'], salida: ['5', '7'] },
    ],
    estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'MIENTRAS'] },
    comparacion: { modo: 'numeros', tolerancia: 0.000001 },
  });

await verificarGenerada('Generador: imprime tabla hasta el límite indicado', 'U3-IC-018',
  'Lee la base y el límite. Muestra la tabla desde base × 1 hasta base × límite usando un ciclo Para.', {
    casos: [
      { entradas: ['3', '4'], salida: ['3', '6', '9', '12'] },
      { entradas: ['5', '3'], salida: ['5', '10', '15'] },
      { entradas: ['7', '2'], salida: ['7', '14'] },
    ],
    estructura: { requiere: ['DECLARACION', 'LECTURA', 'ESCRITURA', 'PARA'] },
    comparacion: { modo: 'numeros', tolerancia: 0.000001 },
  });

const configLimiteTermico = {
  casos: [
    { entradas: ['79'], salida: ['Temperatura normal'] },
    { entradas: ['80'], salida: ['Temperatura normal'] },
    { entradas: ['81'], salida: ['Alerta térmica'], visible: false },
  ],
  estructura: { requiere: ['DECLARACION', 'LECTURA', 'CONDICIONAL', 'SINO', 'ESCRITURA'] },
  comparacion: { modo: 'exacto', ignorar_mayusculas: true },
};
const respuestaLimiteTermico = `Algoritmo Evaluar_Temperatura
Definir temperatura Como Real
Leer temperatura
Si temperatura >= 80 Entonces
    Escribir "Alerta térmica"
Sino
    Escribir "Temperatura normal"
FinSi
FinAlgoritmo`;
const solucionLimiteTermico = respuestaLimiteTermico.replace('temperatura >= 80', 'temperatura > 80');
await verificar('Límite térmico: >= 80 falla porque el caso 80 es normal', respuestaLimiteTermico, configLimiteTermico, false);
await verificar('Límite térmico: > 80 coincide con las pruebas configuradas', solucionLimiteTermico, configLimiteTermico, true);

console.log(JSON.stringify({ total: resultados.length, aprobadas: resultados.filter((r) => r.correcto === r.esperado).length, resultados }, null, 2));
