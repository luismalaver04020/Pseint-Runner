// Pruebas del parser/intérprete sin iniciar Prolog ni conectarse a Supabase.
import assert from 'node:assert/strict';
import { analizarCodigo } from './src/evaluador/parser.js';
import { ejecutarCodigo } from './src/evaluador/interprete.js';

let total = 0;
function prueba(nombre, fn) {
  fn();
  total++;
  console.log(`✓ ${nombre}`);
}

prueba('suma con Leer y Escribir', () => {
  const r = ejecutarCodigo(`Proceso Suma
Definir a, b, resultado Como Entero
Leer a
Leer b
resultado <- a + b
Escribir resultado
FinProceso`, ['3', '4']);
  assert.deepEqual(r.lineas, ['7']);
});

prueba('ciclo Para', () => {
  const r = ejecutarCodigo(`Proceso Conteo
Definir i Como Entero
Para i <- 1 Hasta 3 Hacer
Escribir i
FinPara
FinProceso`);
  assert.deepEqual(r.lineas, ['1', '2', '3']);
});

prueba('ciclo Mientras', () => {
  const r = ejecutarCodigo(`Proceso Conteo
Definir i Como Entero
i <- 1
Mientras i <= 3 Hacer
Escribir i
i <- i + 1
FinMientras
FinProceso`);
  assert.deepEqual(r.lineas, ['1', '2', '3']);
});

prueba('ciclo Repetir-Hasta Que', () => {
  const r = ejecutarCodigo(`Proceso Conteo
Definir i Como Entero
i <- 1
Repetir
Escribir i
i <- i + 1
Hasta Que i > 3
FinProceso`);
  assert.deepEqual(r.lineas, ['1', '2', '3']);
});

prueba('condicional Si/SiNo', () => {
  const r = ejecutarCodigo(`Proceso Par
Definir n Como Entero
Leer n
Si n MOD 2 = 0 Entonces
Escribir "Par"
SiNo
Escribir "Impar"
FinSi
FinProceso`, ['8']);
  assert.deepEqual(r.lineas, ['Par']);
});

prueba('lectura de Cadena', () => {
  const r = ejecutarCodigo(`Proceso Saludo
Definir nombre Como Cadena
Leer nombre
Escribir nombre
FinProceso`, ['Carlos']);
  assert.deepEqual(r.lineas, ['Carlos']);
});

prueba('constante PI y funciones Max/Min', () => {
  const r = ejecutarCodigo(`Proceso Constantes
Definir radio, area, diferencia Como Real
radio <- 2
area <- PI * radio * radio
diferencia <- Max(10, Max(20, 30)) - Min(10, Min(20, 30))
Escribir area
Escribir diferencia
FinProceso`);
  assert.deepEqual(r.lineas, ['12.566370614359172', '20']);
});

prueba('división entera con DIV', () => {
  const r = ejecutarCodigo(`Proceso Digitos
Definir numero, centenas, decenas, unidades Como Entero
numero <- 345
centenas <- numero DIV 100
decenas <- (numero MOD 100) DIV 10
unidades <- numero MOD 10
Escribir centenas
Escribir decenas
Escribir unidades
FinProceso`);
  assert.deepEqual(r.lineas, ['3', '4', '5']);
});

prueba('parser rechaza bloque sin cierre', () => {
  assert.throws(() => analizarCodigo(`Proceso Error
Definir i Como Entero
Mientras i < 3 Hacer
Escribir i
FinProceso`));
});

console.log(`\n${total} pruebas de parser/intérprete superadas.`);
