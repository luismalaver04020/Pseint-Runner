
import { analizarCodigo } from './parser.js';

export function ejecutarCodigo(codigo, entradas = []) {
  const analisis = analizarCodigo(codigo);

const contexto = {
  variables: {},
  tiposVariables: {},
  entradas: [...entradas],
  indiceEntrada: 0,
  salida: [],
  lineas: [],
  instruccionesEjecutadas: 0,
  ciclosPara: new Map()
};

  let posicion = 0;
  const limite = 100000;

  while (posicion < analisis.instrucciones.length) {
    if (contexto.instruccionesEjecutadas >= limite) {
      throw new Error('Se superó el límite de instrucciones.');
    }

    const instruccion = analisis.instrucciones[posicion];
    contexto.instruccionesEjecutadas++;

    switch (instruccion.tipo) {
         case 'CONDICIONAL': {
        const coincidencia = instruccion.codigo.match(
          /^Si\s+(.+)\s+Entonces$/i
        );

        if (!coincidencia) {
          throw new Error(
            `Condicional Si inválido: ${instruccion.codigo}`
          );
        }

        const resultado = evaluarExpresion(
          coincidencia[1],
          contexto.variables
        );

        if (typeof resultado !== 'boolean') {
          throw new Error(
            `La condición de Si debe ser lógica. Línea ${instruccion.linea}.`
          );
        }

        posicion = resultado
          ? posicion + 1
          : instruccion.saltoSiFalso;

        break;
      }
      case 'SINO':
        posicion = instruccion.saltoFin;
        break;

      case 'DECLARACION':
        declararVariables(instruccion.codigo, contexto);
        posicion++;
        break;

      case 'LECTURA':
        leerVariables(instruccion.codigo, contexto);
        posicion++;
        break;

      case 'ESCRITURA':
        escribirSalida(instruccion.codigo, contexto);
        posicion++;
        break;

      case 'ASIGNACION':
        asignarVariable(instruccion.codigo, contexto);
        posicion++;
        break;

      case 'PARA': {
        const ciclo = prepararCicloPara(
          instruccion.codigo,
          contexto
        );

        ciclo.inicioPosicion = posicion;
        ciclo.finPosicion = instruccion.finBloque;

        contexto.ciclosPara.set(posicion, ciclo);

        contexto.variables[ciclo.variable] = ciclo.inicio;

        if (!continuarCicloPara(ciclo, contexto.variables)) {
          contexto.ciclosPara.delete(posicion);
          posicion = ciclo.finPosicion + 1;
        } else {
          posicion++;
        }

        break;
      }

      case 'FIN_PARA': {
        const inicio = instruccion.inicioBloque;
        const ciclo = contexto.ciclosPara.get(inicio);

        if (!ciclo) {
          throw new Error(
            `No se encontró el ciclo Para iniciado en la línea ${instruccion.linea}.`
          );
        }

        contexto.variables[ciclo.variable] += ciclo.paso;

        if (continuarCicloPara(ciclo, contexto.variables)) {
          posicion = ciclo.inicioPosicion + 1;
        } else {
          contexto.ciclosPara.delete(inicio);
          posicion++;
        }

        break;
      }

           case 'MIENTRAS': {
        const coincidencia = instruccion.codigo.match(
          /^Mientras\s+(.+)\s+Hacer$/i
        );

        if (!coincidencia) {
          throw new Error(
            `Ciclo Mientras inválido: ${instruccion.codigo}`
          );
        }

        const resultado = evaluarExpresion(
          coincidencia[1],
          contexto.variables
        );

        if (typeof resultado !== 'boolean') {
          throw new Error(
            `La condición de Mientras debe ser lógica. Línea ${instruccion.linea}.`
          );
        }

        posicion = resultado
          ? posicion + 1
          : instruccion.finBloque + 1;

        break;
      }
          case 'FIN_MIENTRAS':
        posicion = instruccion.inicioBloque;
        break;

      case 'REPETIR':
        posicion++;
        break;

      case 'HASTA_QUE': {
        const coincidencia = instruccion.codigo.match(
          /^Hasta\s+Que\s+(.+)$/i
        );

        if (!coincidencia) {
          throw new Error(
            `Condición Hasta Que inválida: ${instruccion.codigo}`
          );
        }

        const resultado = evaluarExpresion(
          coincidencia[1],
          contexto.variables
        );

        if (typeof resultado !== 'boolean') {
          throw new Error(
            `La condición de Hasta Que debe ser lógica. Línea ${instruccion.linea}.`
          );
        }

        posicion = resultado
          ? posicion + 1
          : instruccion.inicioBloque + 1;

        break;
      }

      case 'INICIO':
      case 'FIN':
      case 'COMENTARIO':
      case 'FIN_CONDICIONAL':
        posicion++;
        break;

      default:
        throw new Error(
          `Instrucción no soportada en la línea ${instruccion.linea}: ${instruccion.codigo}`
        );
    }
  }

  return {
    correcto: true,
    variables: contexto.variables,
    salida: contexto.salida,
    lineas: contexto.lineas,
    instruccionesEjecutadas: contexto.instruccionesEjecutadas
  };
}
// ─────────────────────────────────────────
// DECLARACIÓN DE VARIABLES
// ─────────────────────────────────────────

function declararVariables(linea, contexto) {
  const coincidencia = linea.match(
    /^Definir\s+(.+?)\s+Como\s+(Entero|Real|Cadena|Caracter|Logico)$/i
  );

  if (!coincidencia) {
    throw new Error(`Declaración inválida: ${linea}`);
  }

  const nombres = coincidencia[1].split(',');
  const tipo = coincidencia[2].toLowerCase();

  const valoresIniciales = {
    entero: 0,
    real: 0,
    cadena: '',
    caracter: '',
    logico: false
  };

  for (const nombre of nombres) {
    const variable = nombre.trim().toLowerCase();

    if (!/^[a-záéíóúñ_]\w*$/i.test(variable)) {
      throw new Error(`Nombre de variable inválido: ${nombre}`);
    }

    if (Object.hasOwn(contexto.variables, variable)) {
      throw new Error(`Variable ya declarada: ${variable}`);
    }

    contexto.variables[variable] = valoresIniciales[tipo];
    contexto.tiposVariables[variable] = tipo;
  }
}
// ─────────────────────────────────────────
// LECTURA DE DATOS
// ─────────────────────────────────────────


function leerVariables(linea, contexto) {
  const coincidencia = linea.match(/^Leer\s+(.+)$/i);

  if (!coincidencia) {
    throw new Error(`Instrucción Leer inválida: ${linea}`);
  }

  const nombres = coincidencia[1].split(',');

  for (const nombre of nombres) {
    const variable = nombre.trim().toLowerCase();

    if (!Object.hasOwn(contexto.variables, variable)) {
      throw new Error(`Variable no declarada: ${variable}`);
    }

    if (contexto.indiceEntrada >= contexto.entradas.length) {
      throw new Error(`Falta un valor de entrada para: ${variable}`);
    }

    const entrada = contexto.entradas[contexto.indiceEntrada++];
    const tipo = contexto.tiposVariables[variable];

    let valor;

    switch (tipo) {
      case 'entero':
        valor = Number(entrada);

        if (!Number.isInteger(valor)) {
          throw new Error(`Se esperaba un número entero para: ${variable}`);
        }
        break;

      case 'real':
        valor = Number(entrada);

        if (!Number.isFinite(valor)) {
          throw new Error(`Se esperaba un número real para: ${variable}`);
        }
        break;

      case 'cadena':
        valor = String(entrada);
        break;

      case 'caracter':
        valor = String(entrada);

        if (valor.length !== 1) {
          throw new Error(`La variable ${variable} debe recibir un solo carácter.`);
        }
        break;

      case 'logico': {
        const entradaLogica = String(entrada).trim().toLowerCase();

        if (['verdadero', 'true'].includes(entradaLogica)) {
          valor = true;
        } else if (['falso', 'false'].includes(entradaLogica)) {
          valor = false;
        } else {
          throw new Error(`Se esperaba Verdadero o Falso para: ${variable}`);
        }
        break;
      }

      default:
        throw new Error(`Tipo de variable no soportado: ${tipo}`);
    }

    contexto.variables[variable] = valor;
  }
}

// ─────────────────────────────────────────
// ESCRITURA DE RESULTADOS
// ─────────────────────────────────────────

function escribirSalida(linea, contexto) {
  const coincidencia = linea.match(/^Escribir\s+(.+)$/i);

  if (!coincidencia) {
    throw new Error(`Instrucción Escribir inválida: ${linea}`);
  }

  const expresiones = dividirArgumentos(coincidencia[1]);
  const partesLinea = [];

  for (const expresion of expresiones) {
    const valor = evaluarExpresion(expresion, contexto.variables);
    contexto.salida.push(valor);
    partesLinea.push(textoDeSalida(valor));
  }

  // Un Escribir = una línea de pantalla (PSeInt concatena sus argumentos).
  // Es lo que compara el juez Prolog; `salida` se conserva tal cual para el resto del código.
  contexto.lineas.push(partesLinea.join(''));
}

function textoDeSalida(valor) {
  if (typeof valor === 'boolean') return valor ? 'VERDADERO' : 'FALSO';
  return String(valor);
}

// ─────────────────────────────────────────
// SEPARACIÓN DE ARGUMENTOS
// ─────────────────────────────────────────

function dividirArgumentos(texto) {
  const partes = [];
  let actual = '';
  let profundidad = 0;
  let comilla = null;

  for (const caracter of texto) {
    if (comilla) {
      actual += caracter;

      if (caracter === comilla) {
        comilla = null;
      }

      continue;
    }

    if (caracter === '"' || caracter === "'") {
      comilla = caracter;
      actual += caracter;
      continue;
    }

    if (caracter === '(') profundidad++;
    if (caracter === ')') profundidad--;

    if (caracter === ',' && profundidad === 0) {
      partes.push(actual.trim());
      actual = '';
    } else {
      actual += caracter;
    }
  }

  if (comilla || profundidad !== 0) {
    throw new Error(
      'Expresión con comillas o paréntesis sin cerrar.'
    );
  }

  if (actual.trim()) {
    partes.push(actual.trim());
  }

  return partes;
}

// ─────────────────────────────────────────
// ASIGNACIÓN DE VARIABLES
// ─────────────────────────────────────────

function asignarVariable(linea, contexto) {
  const coincidencia = linea.match(
    /^([a-záéíóúñ_]\w*)\s*<-\s*(.+)$/i
  );

  if (!coincidencia) {
    throw new Error(`Asignación inválida: ${linea}`);
  }

  const variable = coincidencia[1].toLowerCase();

  if (!Object.hasOwn(contexto.variables, variable)) {
    throw new Error(`Variable no declarada: ${variable}`);
  }

  const valor = evaluarExpresion(
    coincidencia[2],
    contexto.variables
  );

  const tipo = contexto.tiposVariables[variable];

  switch (tipo) {
    case 'entero':
      if (typeof valor !== 'number' || !Number.isInteger(valor)) {
        throw new Error(`La variable ${variable} necesita un número entero.`);
      }
      break;

    case 'real':
      if (typeof valor !== 'number' || !Number.isFinite(valor)) {
        throw new Error(`La variable ${variable} necesita un número real.`);
      }
      break;

    case 'cadena':
      if (typeof valor !== 'string') {
        throw new Error(`La variable ${variable} necesita una cadena de texto.`);
      }
      break;

    case 'caracter':
      if (typeof valor !== 'string' || valor.length !== 1) {
        throw new Error(`La variable ${variable} necesita un solo carácter.`);
      }
      break;

    case 'logico':
      if (typeof valor !== 'boolean') {
        throw new Error(`La variable ${variable} necesita un valor lógico.`);
      }
      break;

    default:
      throw new Error(`Tipo de variable no soportado: ${tipo}`);
  }

  contexto.variables[variable] = valor;
}
// ─────────────────────────────────────────
// EVALUADOR DE EXPRESIONES
// ─────────────────────────────────────────

function evaluarExpresion(expresion, variables) {
  const tokens = tokenizar(expresion);
  let posicion = 0;

  function actual() {
    return tokens[posicion];
  }

  function consumir(tipo) {
    if (actual()?.tipo !== tipo) {
      throw new Error(`Se esperaba ${tipo}.`);
    }

    return tokens[posicion++];
  }

  function exigirNumero(valor) {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      throw new Error('Se esperaba un valor numérico.');
    }

    return valor;
  }

  function expresionLogicaO() {
    let valor = expresionLogicaY();

    while (actual()?.valor === 'O') {
      posicion++;
      const derecho = expresionLogicaY();
      valor = Boolean(valor) || Boolean(derecho);
    }

    return valor;
  }

  function expresionLogicaY() {
    let valor = expresionNegacion();

    while (actual()?.valor === 'Y') {
      posicion++;
      const derecho = expresionNegacion();
      valor = Boolean(valor) && Boolean(derecho);
    }

    return valor;
  }

  function expresionNegacion() {
    if (actual()?.valor === 'NO') {
      posicion++;
      return !Boolean(expresionNegacion());
    }

    return expresionComparacion();
  }

function expresionComparacion() {
  const izquierdo = expresionSuma();

  const operadores = [
    '>', '<', '>=', '<=', '=', '<>', '!=', '=='
  ];

  if (
    actual()?.tipo === 'operador' &&
    operadores.includes(actual().valor)
  ) {
    const operador = tokens[posicion++].valor;
    const derecho = expresionSuma();

    const tipoIzquierdo = typeof izquierdo;
    const tipoDerecho = typeof derecho;

    if (tipoIzquierdo !== tipoDerecho) {
      throw new Error(
        'No se pueden comparar valores de tipos diferentes.'
      );
    }

    if (
      tipoIzquierdo === 'boolean' &&
      !['=', '==', '<>', '!='].includes(operador)
    ) {
      throw new Error(
        'Los valores lógicos solo permiten comparaciones de igualdad.'
      );
    }

    switch (operador) {
      case '>': return izquierdo > derecho;
      case '<': return izquierdo < derecho;
      case '>=': return izquierdo >= derecho;
      case '<=': return izquierdo <= derecho;
      case '=':
      case '==': return izquierdo === derecho;
      case '<>':
      case '!=': return izquierdo !== derecho;
    }
  }

  return izquierdo;
}

 function expresionSuma() {
  let valor = expresionProducto();

  while (
    actual()?.tipo === 'operador' &&
    ['+', '-'].includes(actual().valor)
  ) {
    const operador = tokens[posicion++].valor;
    const derecho = expresionProducto();

    if (operador === '+') {
      if (
        typeof valor === 'string' &&
        typeof derecho === 'string'
      ) {
        valor = valor + derecho;
      } else {
        exigirNumero(valor);
        exigirNumero(derecho);
        valor = valor + derecho;
      }
    } else {
      exigirNumero(valor);
      exigirNumero(derecho);
      valor = valor - derecho;
    }
  }

  return valor;
}

  function expresionProducto() {
    let valor = expresionPotencia();

    while (
      actual()?.tipo === 'operador' &&
      ['*', '/', 'MOD'].includes(actual().valor)
    ) {
      const operador = tokens[posicion++].valor;
      const derecho = expresionPotencia();

      exigirNumero(valor);
      exigirNumero(derecho);

      if (
        (operador === '/' || operador === 'MOD') &&
        derecho === 0
      ) {
        throw new Error('No se puede dividir entre cero.');
      }

      if (operador === '*') valor *= derecho;
      if (operador === '/') valor /= derecho;
      if (operador === 'MOD') valor %= derecho;
    }

    return valor;
  }

  function expresionPotencia() {
    let valor = expresionUnaria();

    if (actual()?.valor === '^') {
      posicion++;

      valor = Math.pow(
        exigirNumero(valor),
        exigirNumero(expresionPotencia())
      );
    }

    return valor;
  }

  function expresionUnaria() {
    if (actual()?.valor === '-') {
      posicion++;
      return -exigirNumero(expresionUnaria());
    }

    if (actual()?.valor === '+') {
      posicion++;
      return exigirNumero(expresionUnaria());
    }

    return expresionPrimaria();
  }

  function expresionPrimaria() {
    const token = actual();

    if (!token) {
      throw new Error('Expresión incompleta.');
    }

  if (
  token.tipo === 'numero' ||
  token.tipo === 'cadena' ||
  token.tipo === 'logico'
) {
  posicion++;
  return token.valor;
}
  if (token.tipo === 'variable') {
  posicion++;

  const nombre = token.valor;

  // Comprobar si es una función matemática.
  if (actual()?.tipo === 'apertura') {
    posicion++;

    const argumento = expresionLogicaO();

    consumir('cierre');

    return aplicarFuncionMatematica(nombre, argumento);
  }

  // Si no es una función, debe ser una variable declarada.
  if (!Object.hasOwn(variables, nombre)) {
    throw new Error(`Variable no declarada: ${nombre}`);
  }

  return variables[nombre];
}

    if (token.tipo === 'apertura') {
      posicion++;
      const valor = expresionLogicaO();
      consumir('cierre');
      return valor;
    }

    throw new Error(`Elemento inesperado: ${token.valor}`);
  }

  const resultado = expresionLogicaO();

  if (posicion !== tokens.length) {
    throw new Error(`Expresión no válida: ${expresion}`);
  }

  return resultado;
}
// ─────────────────────────────────────────
// FUNCIONES MATEMÁTICAS DE PSeInt
// ─────────────────────────────────────────

function aplicarFuncionMatematica(nombre, valor) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new Error(
      `La función ${nombre} necesita un argumento numérico válido.`
    );
  }

  let resultado;

  switch (nombre.toLowerCase()) {
    case 'trunc':
      resultado = Math.trunc(valor);
      break;

    case 'redon':
      resultado = Math.round(valor);
      break;

    case 'rc':
    case 'raiz':
      if (valor < 0) {
        throw new Error('No se puede calcular una raíz real de un número negativo.');
      }
      resultado = Math.sqrt(valor);
      break;

    case 'abs':
      resultado = Math.abs(valor);
      break;

    case 'sen':
      resultado = Math.sin(valor);
      break;

    case 'cos':
      resultado = Math.cos(valor);
      break;

    case 'tan':
      resultado = Math.tan(valor);
      break;

    case 'exp':
      resultado = Math.exp(valor);
      break;

    case 'ln':
      if (valor <= 0) {
        throw new Error('El logaritmo natural necesita un número positivo.');
      }
      resultado = Math.log(valor);
      break;

    case 'log':
      if (valor <= 0) {
        throw new Error('El logaritmo necesita un número positivo.');
      }
      resultado = Math.log10(valor);
      break;

    case 'azar':
      if (!Number.isInteger(valor) || valor <= 0) {
        throw new Error('azar necesita un número entero positivo.');
      }
      resultado = Math.floor(Math.random() * valor);
      break;

    default:
      throw new Error(`Función matemática no soportada: ${nombre}`);
  }

  if (!Number.isFinite(resultado)) {
    throw new Error(`El resultado de ${nombre} no es un número válido.`);
  }

  return resultado;
}
// ─────────────────────────────────────────
// TOKENIZACIÓN
// ─────────────────────────────────────────

function tokenizar(expresion) {
  const tokens = [];
  let posicion = 0;

  while (posicion < expresion.length) {
    const resto = expresion.slice(posicion);

    const espacio = resto.match(/^\s+/);

    if (espacio) {
      posicion += espacio[0].length;
      continue;
    }

    const caracter = expresion[posicion];

    if (caracter === '"' || caracter === "'") {
      let fin = posicion + 1;

      while (
        fin < expresion.length &&
        expresion[fin] !== caracter
      ) {
        fin++;
      }

      if (fin >= expresion.length) {
        throw new Error(
          'Cadena de texto sin comilla de cierre.'
        );
      }

      tokens.push({
        tipo: 'cadena',
        valor: expresion.slice(posicion + 1, fin)
      });

      posicion = fin + 1;
      continue;
    }

    const numero = resto.match(/^\d+(?:\.\d+)?/);

    if (numero) {
      tokens.push({
        tipo: 'numero',
        valor: Number(numero[0])
      });

      posicion += numero[0].length;
      continue;
    }

    const identificador = resto.match(
      /^[a-záéíóúñ_]\w*/i
    );

    if (identificador) {
      const nombre = identificador[0].toUpperCase();

     if (['VERDADERO', 'FALSO'].includes(nombre)) {
  tokens.push({
    tipo: 'logico',
    valor: nombre === 'VERDADERO'
  });
} else if (['MOD', 'Y', 'O', 'NO'].includes(nombre)) {
  tokens.push({
    tipo: 'operador',
    valor: nombre
  });
} else {
  tokens.push({
    tipo: 'variable',
    valor: nombre.toLowerCase()
  });
}
      posicion += identificador[0].length;
      continue;
    }

    const operador = [
      '>=', '<=', '<>', '!=', '=='
    ].find(op => resto.startsWith(op));

    if (operador) {
      tokens.push({
        tipo: 'operador',
        valor: operador
      });

      posicion += operador.length;
      continue;
    }

    if ('+-*/^><='.includes(caracter)) {
      tokens.push({
        tipo: 'operador',
        valor: caracter
      });

      posicion++;
      continue;
    }

    if (caracter === '(') {
      tokens.push({
        tipo: 'apertura',
        valor: caracter
      });

      posicion++;
      continue;
    }

    if (caracter === ')') {
      tokens.push({
        tipo: 'cierre',
        valor: caracter
      });

      posicion++;
      continue;
    }

    throw new Error(`Carácter no permitido: ${caracter}`);
  }

  return tokens;
}

// ─────────────────────────────────────────
// PREPARACIÓN DEL CICLO PARA
// ─────────────────────────────────────────

function prepararCicloPara(linea, contexto) {
  const coincidencia = linea.match(
    /^Para\s+([a-záéíóúñ_]\w*)\s*<-\s*(.+?)\s+Hasta\s+(.+?)(?:\s+Con\s+Paso\s+(.+?))?\s+Hacer$/i
  );

  if (!coincidencia) {
    throw new Error(`Ciclo Para inválido: ${linea}`);
  }

  const variable = coincidencia[1].toLowerCase();

  if (!Object.hasOwn(contexto.variables, variable)) {
    throw new Error(`Variable no declarada: ${variable}`);
  }

  const tipoVariable = contexto.tiposVariables[variable];

  const inicio = evaluarExpresion(
    coincidencia[2],
    contexto.variables
  );

  const limite = evaluarExpresion(
    coincidencia[3],
    contexto.variables
  );

  const paso = coincidencia[4]
    ? evaluarExpresion(coincidencia[4], contexto.variables)
    : 1;

   for (const valor of [inicio, limite, paso]) {
    if (
      typeof valor !== 'number' ||
      !Number.isFinite(valor)
    ) {
      throw new Error(
        'Los valores del ciclo Para deben ser numéricos.'
      );
    }
  }

  if (
    tipoVariable === 'entero' &&
    ![inicio, limite, paso].every(Number.isInteger)
  ) {
    throw new Error(
      `Los valores del ciclo Para de ${variable} deben ser enteros.`
    );
  }
  if (paso === 0) {
    throw new Error(
      'El paso del ciclo Para no puede ser cero.'
    );
  }

  return {
    variable,
    inicio,
    limite,
    paso
  };
}

// ─────────────────────────────────────────
// COMPROBAR CONTINUACIÓN DEL CICLO PARA
// ─────────────────────────────────────────

function continuarCicloPara(ciclo, variables) {
  const valor = variables[ciclo.variable];

  if (ciclo.paso > 0) {
    return valor <= ciclo.limite;
  }

  return valor >= ciclo.limite;
}
