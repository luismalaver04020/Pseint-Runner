
export function normalizarCodigo(codigo) {
  if (typeof codigo !== 'string') {
    throw new Error('El código debe ser un texto.');
  }

  return codigo
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(linea => linea.trim())
    .filter(linea => linea.length > 0);
}

export function analizarCodigo(codigo) {
  const lineas = normalizarCodigo(codigo);

  if (lineas.length === 0) {
    throw new Error('El algoritmo está vacío.');
  }

  const instrucciones = lineas.map((linea, i) => ({
    linea: i + 1,
    codigo: linea,
    tipo: identificarInstruccion(linea),
    saltoSiFalso: null,
    saltoFin: null,
    inicioBloque: null,
    finBloque: null
  }));

  // 1. Comprobar el inicio del programa.
  const primera = instrucciones[0];

  if (primera.tipo !== 'INICIO') {
    throw new Error(
      'El programa debe comenzar con Algoritmo o Proceso.'
    );
  }

  // 2. Comprobar el final del programa.
  const ultima = instrucciones[instrucciones.length - 1];

  if (ultima.tipo !== 'FIN') {
    throw new Error(
      'El programa debe terminar con FinAlgoritmo o FinProceso.'
    );
  }

  // 3. Comprobar que el inicio tenga un nombre.
  const inicio = primera.codigo;
  const coincidenciaInicio = inicio.match(
    /^(Algoritmo|Proceso)\s+([a-záéíóúñ_][\wáéíóúñ]*)$/i
  );

  if (!coincidenciaInicio) {
    throw new Error(
      'La instrucción inicial debe tener un nombre válido.'
    );
  }

  const tipoInicio = coincidenciaInicio[1].toLowerCase();
  const tipoFin = tipoInicio === 'algoritmo'
    ? 'finalgoritmo'
    : 'finproceso';

  // 4. Validar que exista un solo inicio y un solo final.
  for (let i = 1; i < instrucciones.length - 1; i++) {
    const instruccion = instrucciones[i];

    if (instruccion.tipo === 'INICIO') {
      throw new Error(
        `No se puede iniciar otro algoritmo en la línea ${instruccion.linea}.`
      );
    }

    if (instruccion.tipo === 'FIN') {
      throw new Error(
        `Se encontró un cierre antes del final del programa en la línea ${instruccion.linea}.`
      );
    }
  }

  const codigoFinal = ultima.codigo.toLowerCase();

  if (codigoFinal !== tipoFin) {
    throw new Error(
      `El programa iniciado con ${coincidenciaInicio[1]} debe terminar con ${tipoInicio === 'algoritmo' ? 'FinAlgoritmo' : 'FinProceso'}.`
    );
  }
  // Comprobar que exista al menos una instrucción ejecutable.
const instruccionesEjecutables = instrucciones.slice(1, -1)
  .filter(instruccion => instruccion.tipo !== 'COMENTARIO');

if (instruccionesEjecutables.length === 0) {
  throw new Error(
    'El algoritmo debe contener al menos una instrucción ejecutable.'
  );
}

  // 5. Validar condicionales y ciclos.
  const bloques = [];

  for (let i = 1; i < instrucciones.length - 1; i++) {
    const instruccion = instrucciones[i];

    if (instruccion.tipo === 'CONDICIONAL') {
      if (!/\bEntonces\s*$/i.test(instruccion.codigo)) {
        throw new Error(
          `Falta Entonces en la línea ${instruccion.linea}.`
        );
      }

      bloques.push({
        tipo: 'Si',
        indice: i,
        tieneSiNo: false,
        indiceSiNo: null
      });

    } else if (instruccion.tipo === 'SINO') {
      const bloque = bloques[bloques.length - 1];

      if (!bloque || bloque.tipo !== 'Si') {
        throw new Error(
          `SiNo sin un Si correspondiente en la línea ${instruccion.linea}.`
        );
      }

      if (bloque.tieneSiNo) {
        throw new Error(
          `El condicional tiene más de un SiNo en la línea ${instruccion.linea}.`
        );
      }

      bloque.tieneSiNo = true;
      bloque.indiceSiNo = i;

      instrucciones[bloque.indice].saltoSiFalso = i + 1;

    } else if (instruccion.tipo === 'FIN_CONDICIONAL') {
      const bloque = bloques[bloques.length - 1];

      if (!bloque || bloque.tipo !== 'Si') {
        throw new Error(
          `FinSi sin un Si correspondiente en la línea ${instruccion.linea}.`
        );
      }

      bloques.pop();

      const inicioCondicional = instrucciones[bloque.indice];

      if (bloque.tieneSiNo) {
        instrucciones[bloque.indiceSiNo].saltoFin = i + 1;
      } else {
        inicioCondicional.saltoSiFalso = i + 1;
      }

      inicioCondicional.finCondicional = i;

    } else if (
      ['PARA', 'MIENTRAS', 'REPETIR'].includes(instruccion.tipo)
    ) {
      bloques.push({
        tipo: instruccion.tipo,
        indice: i
      });

    } else if (
      ['FIN_PARA', 'FIN_MIENTRAS', 'HASTA_QUE'].includes(instruccion.tipo)
    ) {
      const bloque = bloques[bloques.length - 1];

      if (!bloque) {
        throw new Error(
          `Cierre de ciclo sin inicio correspondiente en la línea ${instruccion.linea}.`
        );
      }

      const cierres = {
        PARA: 'FIN_PARA',
        MIENTRAS: 'FIN_MIENTRAS',
        REPETIR: 'HASTA_QUE'
      };

      if (cierres[bloque.tipo] !== instruccion.tipo) {
        throw new Error(
          `El ciclo iniciado en la línea ${instrucciones[bloque.indice].linea} tiene un cierre incorrecto en la línea ${instruccion.linea}.`
        );
      }

      bloques.pop();

      instrucciones[bloque.indice].finBloque = i;
      instruccion.inicioBloque = bloque.indice;
    }
  }

  // 6. Detectar bloques que quedaron abiertos.
  if (bloques.length > 0) {
    const bloque = bloques[bloques.length - 1];

    const nombres = {
      Si: 'FinSi',
      PARA: 'FinPara',
      MIENTRAS: 'FinMientras',
      REPETIR: 'Hasta Que'
    };

    throw new Error(
      `Falta ${nombres[bloque.tipo]} para el bloque iniciado en la línea ${instrucciones[bloque.indice].linea}.`
    );
  }

  return {
    cantidadLineas: lineas.length,
    instrucciones
  };
}

function identificarInstruccion(linea) {
  const texto = linea.trim();

  if (/^\/\//.test(texto)) return 'COMENTARIO';

  if (/^(Algoritmo|Proceso)\b/i.test(texto)) return 'INICIO';
  if (/^(FinAlgoritmo|FinProceso)$/i.test(texto)) return 'FIN';

  if (/^Dimension\b/i.test(texto)) return 'DIMENSION';
  if (/^Definir\b/i.test(texto)) return 'DECLARACION';
  if (/^Leer\b/i.test(texto)) return 'LECTURA';
  if (/^Escribir\b/i.test(texto)) return 'ESCRITURA';

  if (/^SiNo$/i.test(texto)) return 'SINO';
  if (/^FinSi$/i.test(texto)) return 'FIN_CONDICIONAL';
  if (/^Si\b/i.test(texto)) return 'CONDICIONAL';

  if (/^Para\b/i.test(texto)) return 'PARA';
  if (/^FinPara$/i.test(texto)) return 'FIN_PARA';

  if (/^Mientras\b/i.test(texto)) return 'MIENTRAS';
  if (/^FinMientras$/i.test(texto)) return 'FIN_MIENTRAS';

  if (/^Repetir$/i.test(texto)) return 'REPETIR';
  if (/^Hasta Que\b/i.test(texto)) return 'HASTA_QUE';

  if (/^[a-záéíóúñ_][\wáéíóúñ]*\s*(?:\[[^\]]+\])?\s*<-/i.test(texto)) {
    return 'ASIGNACION';
  }

  return 'EXPRESION';
}
