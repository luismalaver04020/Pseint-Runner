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

prueba('parser rechaza bloque sin cierre', () => {
  assert.throws(() => analizarCodigo(`Proceso Error
Definir i Como Entero
Mientras i < 3 Hacer
Escribir i
FinProceso`));
});

console.log(`\n${total} pruebas de parser/intérprete superadas.`);
