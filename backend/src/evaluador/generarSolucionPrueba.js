const sinAcentos = (texto) => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const numeroEnTexto = (texto) => ({ uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 })[texto] ?? texto;
function programa(nombre, declaraciones, instrucciones) {
  return `Algoritmo ${nombre}\nDefinir ${declaraciones}\n${instrucciones.join('\n')}\nFinAlgoritmo`;
}

function generarU2(pregunta, prompt) {
  const condiciones = [...prompt.matchAll(/\b([a-z_][\w]*)\s*(>=|<=|>|<|=)\s*(-?\d+(?:[.,]\d+)?)/gi)]
    .map(([, variable, operador, limite]) => ({ variable, operador, limite: limite.replace(',', '.') }));
  const etiquetas = [...pregunta.prompt.matchAll(/[«“"]([^»”"]+)[»”"]/g)].map(([, texto]) => texto.trim());

  if (/si ambos criterios|si solo uno|ambos criterios/.test(prompt) && condiciones.length >= 2 && etiquetas.length >= 3) {
    const [a, b] = condiciones;
    const instrucciones = [
      `Leer ${a.variable}`,
      `Leer ${b.variable}`,
      `Si ${a.variable} ${a.operador} ${a.limite} Y ${b.variable} ${b.operador} ${b.limite} Entonces`,
      `    Escribir "${etiquetas.at(-3)}"`,
      'Sino',
      `    Si ${a.variable} ${a.operador} ${a.limite} O ${b.variable} ${b.operador} ${b.limite} Entonces`,
      `        Escribir "${etiquetas.at(-2)}"`,
      '    Sino',
      `        Escribir "${etiquetas.at(-1)}"`,
      '    FinSi',
      'FinSi',
    ];
    return { codigo: programa('EvaluarCriterios', `${a.variable}, ${b.variable} Como Real`, instrucciones), regla: 'dos criterios con tres resultados', confianza: 'alta' };
  }

  if (/clasifica el valor|clasifica el puntaje|tres rangos|menor que \d+.*desde \d+/.test(prompt) && condiciones.length >= 2 && etiquetas.length >= 3) {
    const variable = condiciones[0].variable;
    const [limiteUno, limiteDos] = condiciones.map((condicion) => condicion.limite);
    const instrucciones = [
      `Leer ${variable}`,
      `Si ${variable} < ${limiteUno} Entonces`,
      `    Escribir "${etiquetas.at(-3)}"`,
      `Sino`,
      `    Si ${variable} < ${limiteDos} Entonces`,
      `        Escribir "${etiquetas.at(-2)}"`,
      `    Sino`,
      `        Escribir "${etiquetas.at(-1)}"`,
      '    FinSi',
      'FinSi',
    ];
    return { codigo: programa('ClasificarRango', `${variable} Como Real`, instrucciones), regla: 'clasificación en tres rangos', confianza: 'alta' };
  }

  if (condiciones.length === 1 && etiquetas.length >= 2 && /si se cumple|en caso contrario/.test(prompt)) {
    const condicion = condiciones[0];
    let operador = condicion.operador;
    if (/maximo|limite|menor|critico|no supera|hasta/.test(prompt) && ['>=', '>'].includes(operador)) operador = '<=';
    if (/minimo|meta|al menos|desde/.test(prompt) && ['<=', '<'].includes(operador)) operador = '>=';
    const instrucciones = [
      `Leer ${condicion.variable}`,
      `Si ${condicion.variable} ${operador} ${condicion.limite} Entonces`,
      `    Escribir "${etiquetas.at(-2)}"`,
      'Sino',
      `    Escribir "${etiquetas.at(-1)}"`,
      'FinSi',
    ];
    return { codigo: programa('EvaluarCriterio', `${condicion.variable} Como Real`, instrucciones), regla: 'umbral binario', confianza: 'media' };
  }

  const parImpar = prompt.match(/divisible entre\s*(\d+).*?["“]([^"”]+)["”].*?["“]([^"”]+)["”]/);
  if (parImpar) {
    const divisor = parImpar[1];
    const palabra = parImpar[2].toLowerCase() === 'par' ? parImpar[2] : parImpar[3];
    const otra = parImpar[2].toLowerCase() === 'par' ? parImpar[3] : parImpar[2];
    const instrucciones = ['Leer valor', `Si valor MOD ${divisor} = 0 Entonces`, `    Escribir "${palabra}"`, 'Sino', `    Escribir "${otra}"`, 'FinSi'];
    return { codigo: programa('Paridad', 'valor Como Entero', instrucciones), regla: 'paridad', confianza: 'alta' };
  }

  return null;
}

function generarU3(pregunta, prompt) {
  const config = pregunta.evaluation_config ?? {};
  const requeridas = config.estructura?.requiere ?? [];
  const tipoCiclo = ['PARA', 'MIENTRAS', 'REPETIR'].find((tipo) => requeridas.includes(tipo));
  if (!tipoCiclo) return null;

  if (tipoCiclo === 'MIENTRAS' && /lee el valor inicial, el incremento y el limite/.test(prompt) && /progresion comenzando en el valor inicial/.test(prompt)) {
    const instrucciones = [
      'Leer inicio',
      'Leer incremento',
      'Leer limite',
      'valor <- inicio',
      'Mientras valor <= limite Hacer',
      '    Escribir valor',
      '    valor <- valor + incremento',
      'FinMientras',
    ];
    return { codigo: programa('ImprimirProgresion', 'inicio, incremento, limite, valor Como Entero', instrucciones), regla: 'progresión con inicio, incremento y límite', confianza: 'alta' };
  }

  if (tipoCiclo === 'PARA' && /lee la base y el limite/.test(prompt) && /muestra la tabla desde base/.test(prompt)) {
    const instrucciones = [
      'Leer base',
      'Leer limite',
      'Para i <- 1 Hasta limite Hacer',
      '    Escribir base * i',
      'FinPara',
    ];
    return { codigo: programa('TablaHastaLimite', 'base, limite, i Como Entero', instrucciones), regla: 'tabla de multiplicación hasta el límite', confianza: 'alta' };
  }

  const esCentinela = /hasta (?:que se ingrese|ingresar) (?:cero|0)|termina con cero|terminad[oa] al ingresar cero|recibir cero|centinela/.test(prompt);
  const tieneN = /lee n y luego n|lee (?:un entero )?n y luego n|lee n numeros|lee n cantidades|lista de datos|lee n puntajes|lee n mediciones|lee n montos|lee n pedidos/.test(prompt);
  const empiezaSecuencia = /desde 1 hasta n|entre 1 y n|desde inicio hasta limite|desde inicio hasta n/.test(prompt);
  const variable = prompt.match(/\b([a-z_]\w*)\s+mod\s+\d+\s*=\s*0/)?.[1]
    ?? prompt.match(/\b([a-z_]\w*)\s*(?:>=|<=|<>|=|>|<)/)?.[1]
    ?? (/puntajes|notas/.test(prompt) ? 'puntaje'
      : /montos|monto/.test(prompt) ? 'monto'
        : /lecturas|mediciones|valores|enteros|cantidades|productos|registros|piezas|temperaturas|reservas|cargos|pedidos|numeros/.test(prompt) ? 'valor'
          : 'valor');

  let condicion = null;
  const modulo = prompt.match(/\b([a-z_]\w*)\s+mod\s+(\d+)\s*=\s*0/);
  if (modulo) condicion = `${modulo[1]} MOD ${modulo[2]} = 0`;
  if (!condicion && /cantidad par|cantidades pares|valores pares/.test(prompt)) condicion = `${variable} MOD 2 = 0`;
  if (!condicion && /cantidad impar|cantidades impares|valores impares/.test(prompt)) condicion = `${variable} MOD 2 <> 0`;
  if (!condicion && /no divisibles? por\s*(\d+)\s+ni por\s*(\d+)/.test(prompt)) {
    const [, a, b] = prompt.match(/no divisibles? por\s*(\d+)\s+ni por\s*(\d+)/);
    condicion = `${variable} MOD ${a} <> 0 Y ${variable} MOD ${b} <> 0`;
  }
  const rango = prompt.match(/\b([a-z_]\w*)\s*(>=|>)\s*(-?\d+)\s+y\s+\1\s*(<=|<)\s*(-?\d+)/);
  if (rango) condicion = `${rango[1]} ${rango[2]} ${rango[3]} Y ${rango[1]} ${rango[4]} ${rango[5]}`;
  const rangoNatural = prompt.match(/\bentre\s*(-?\d+)\s+y\s*(-?\d+)/);
  if (!condicion && rangoNatural) condicion = `${variable} >= ${rangoNatural[1]} Y ${variable} <= ${rangoNatural[2]}`;
  const parSobreUmbral = prompt.match(/pares\s+mayores?\s+(?:a|que)\s*(\d+)/);
  if (parSobreUmbral) condicion = `${variable} MOD 2 = 0 Y ${variable} > ${parSobreUmbral[1]}`;
  const limite = prompt.match(/(?:mayores|mayor) que\s*(-?\d+)|(?:menores|menor)(?: o iguales?)? que\s*(-?\d+)|(?:iguales?|igual) a\s*(-?\d+)|(?:iguales? o superiores?|igual o superior) a\s*(-?\d+)|(?:alcanzan|alcanzar)\s*(-?\d+)|divisibles? entre\s*(\d+|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)|multiplos? de\s*(\d+|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/);
  if (limite && !condicion) {
    const valor = numeroEnTexto(limite.slice(1).find(Boolean));
    if (/mayores|mayor/.test(prompt)) condicion = `${variable} > ${valor}`;
    else if (/menores|menor/.test(prompt)) condicion = `${variable} ${/menores o iguales|menor o igual/.test(prompt) ? '<=' : '<'} ${valor}`;
    else if (/alcanzan|alcanzar|iguales? o superiores?/.test(prompt)) condicion = `${variable} >= ${valor}`;
    else if (/igual/.test(prompt)) condicion = `${variable} = ${valor}`;
    else if (/divisibles? entre|multiplos? de/.test(prompt)) condicion = `${variable} MOD ${valor} = 0`;
  }
  if (!condicion && /negativ[oa]s?/.test(prompt)) condicion = `${variable} < 0`;
  if (!condicion && /positiv[oa]s?/.test(prompt)) condicion = `${variable} > 0`;
  if (!condicion && /mayores? que cero/.test(prompt)) condicion = `${variable} > 0`;
  if (!condicion && /menores? que cero/.test(prompt)) condicion = `${variable} < 0`;
  if (!condicion && /pares mayores? a\s*(\d+)/.test(prompt)) condicion = `${variable} MOD 2 = 0 Y ${variable} > ${prompt.match(/pares mayores? a\s*(\d+)/)[1]}`;
  if (!condicion && /pares mayores? que\s*(\d+)/.test(prompt)) condicion = `${variable} MOD 2 = 0 Y ${variable} > ${prompt.match(/pares mayores? que\s*(\d+)/)[1]}`;
  if (!condicion && /menores? o iguales? que cero/.test(prompt)) condicion = `${variable} <= 0`;
  if (!condicion && /mayores? o iguales? que cero/.test(prompt)) condicion = `${variable} >= 0`;
  if (!condicion && /no negativos?|no negativas?|no negativo/.test(prompt)) condicion = `${variable} >= 0`;
  // Combina condiciones explícitas en consignas de conteo (p. ej. positivos y pares).
  if (/positiv[oa]s?.*\bpares?\b|\bpares?\b.*positiv[oa]s?/.test(prompt)) {
    condicion = `${variable} > 0 Y ${variable} MOD 2 = 0`;
  } else if (/negativ[oa]s?.*impares?|impares?.*negativ[oa]s?/.test(prompt)) {
    condicion = `${variable} < 0 Y ${variable} MOD 2 <> 0`;
  } else if (/positiv[oa]s?.*impares?|impares?.*positiv[oa]s?/.test(prompt)) {
    condicion = `${variable} > 0 Y ${variable} MOD 2 <> 0`;
  } else if (/negativ[oa]s?.*\bpares?\b|\bpares?\b.*negativ[oa]s?/.test(prompt)) {
    condicion = `${variable} < 0 Y ${variable} MOD 2 = 0`;
  } else if (/divisibles? por\s*(\d+)\s+o\s+por\s*(\d+)/.test(prompt)) {
    const [, a, b] = prompt.match(/divisibles? por\s*(\d+)\s+o\s+por\s*(\d+)/);
    condicion = `${variable} MOD ${a} = 0 O ${variable} MOD ${b} = 0`;
  } else if (/positiv[oa]s?.*menores? que\s*(\d+)/.test(prompt)) {
    condicion = `${variable} > 0 Y ${variable} < ${prompt.match(/positiv[oa]s?.*menores? que\s*(\d+)/)[1]}`;
  } else if (/positiv[oa]s?.*(?:mayores que cero|mayores a cero)/.test(prompt)) {
    condicion = `${variable} > 0`;
  } else if (/no superan? el tope|no exceden? el limite/.test(prompt)) {
    const tope = prompt.match(/(?:tope|limite)\s*(?:de|:)?\s*(-?\d+)/)?.[1];
    if (tope) condicion = `${variable} <= ${tope}`;
  }
  if (!condicion && /pares?/.test(prompt)) condicion = `${variable} MOD 2 = 0`;
  if (!condicion && /impares?/.test(prompt)) condicion = `${variable} MOD 2 <> 0`;
  if (!condicion && /valores entre\s*(-?\d+)\s*y\s*(-?\d+)/.test(prompt)) {
    const [, a, b] = prompt.match(/valores entre\s*(-?\d+)\s*y\s*(-?\d+)/);
    condicion = `${variable} >= ${a} Y ${variable} <= ${b}`;
  }

  const esConteo = /cuenta|conteo|cuantos|cuantas|contar|productos con cantidad par/.test(prompt);
  const esSuma = /suma|sumar|acumulacion|acumula/.test(prompt);
  const expresionSuma = prompt.match(/\bsuma\s+([a-z_]\w*(?:\s*(?:\*|\/|\+|-)\s*(?:\(?-?\d+(?:[.,]\d+)?\)?|[a-z_]\w*))*)\s+solo cuando/);
  const terminoSuma = expresionSuma?.[1]?.trim() ?? variable;
  const acumula = esSuma ? 'suma' : 'contador';
  const inicia = [`${acumula} <- 0`];
  const cuerpo = condicion
    ? [`Si ${condicion} Entonces`, esSuma ? `    suma <- suma + (${terminoSuma})` : '    contador <- contador + 1', 'FinSi']
    : [esSuma ? `suma <- suma + ${variable}` : 'contador <- contador + 1'];
  const salida = `Escribir ${acumula}`;

  // Resuelve máximos únicamente cuando hay lista de N y casos de prueba que
  // permitan verificarlo; no se reutiliza el acumulador de conteo/suma.
  if (tieneN && /mayor|maximo/.test(prompt) && tipoCiclo && !esSuma && !esConteo) {
    const instrucciones = ['Leer N', 'i <- 1'];
    if (tipoCiclo === 'PARA') {
      instrucciones.push('Para i <- 1 Hasta N Hacer');
    } else if (tipoCiclo === 'REPETIR') {
      instrucciones.push('Repetir');
    } else {
      instrucciones.push('Mientras i <= N Hacer');
    }
    instrucciones.push(`    Leer ${variable}`, '    Si i = 1 Entonces', `        mayor <- ${variable}`, '    Sino', `        Si ${variable} > mayor Entonces`, `            mayor <- ${variable}`, '        FinSi', '    FinSi');
    if (tipoCiclo === 'REPETIR') instrucciones.push('    i <- i + 1', 'Hasta Que i > N');
    else if (tipoCiclo === 'MIENTRAS') instrucciones.push('    i <- i + 1', 'FinMientras');
    else instrucciones.push('FinPara');
    instrucciones.push('Escribir mayor');
    return { codigo: programa('EncontrarMayor', `N, i, ${variable}, mayor Como Entero`, instrucciones), regla: 'máximo de N valores', confianza: 'media' };
  }

  if (esCentinela) {
    const lectura = [`Leer ${variable}`];
    if (tipoCiclo === 'REPETIR') {
      const cuerpoRepetir = [`Leer ${variable}`, ...(condicion ? [`Si ${variable} <> 0 Y (${condicion}) Entonces`, esSuma ? `    suma <- suma + (${terminoSuma})` : '    contador <- contador + 1', 'FinSi'] : [`Si ${variable} <> 0 Entonces`, esSuma ? `    suma <- suma + (${terminoSuma})` : '    contador <- contador + 1', 'FinSi']), `Hasta Que ${variable} = 0`];
      const codigo = programa('ProcesarCentinela', `${variable}, ${acumula} Como Entero`, [...inicia, 'Repetir', ...cuerpoRepetir, salida]);
      return { codigo, regla: 'secuencia con centinela', confianza: esConteo || esSuma ? 'media' : 'baja' };
    }
    const cuerpoCondicional = condicion
      ? [`Si ${condicion} Entonces`, esSuma ? `    suma <- suma + (${terminoSuma})` : '    contador <- contador + 1', 'FinSi']
      : [esSuma ? `suma <- suma + ${variable}` : 'contador <- contador + 1'];
    const codigo = programa('ProcesarCentinela', `${variable}, ${acumula} Como Entero`, [...inicia, ...lectura, `Mientras ${variable} <> 0 Hacer`, ...cuerpoCondicional, `    Leer ${variable}`, 'FinMientras', salida]);
    return { codigo, regla: 'secuencia con centinela', confianza: esConteo || esSuma ? 'media' : 'baja' };
  }

  if (tieneN) {
    const algoritmo = [...inicia, 'Leer N', 'i <- 1'];
    if (tipoCiclo === 'PARA') {
      algoritmo.push('Para i <- 1 Hasta N Hacer', `    Leer ${variable}`, ...cuerpo.map((linea) => `    ${linea}`), 'FinPara');
    } else {
      algoritmo.push('Mientras i <= N Hacer', `    Leer ${variable}`, ...cuerpo.map((linea) => `    ${linea}`), '    i <- i + 1', 'FinMientras');
    }
    algoritmo.push(salida);
    return { codigo: programa('ProcesarLista', `N, i, ${variable}, ${acumula} Como Entero`, algoritmo), regla: 'lista de N valores', confianza: condicion && (esConteo || esSuma) ? 'alta' : 'baja' };
  }

  if (empiezaSecuencia && tipoCiclo === 'PARA') {
    const cuenta = /cuenta|conteo|contar/.test(prompt);
    const acumulador = cuenta ? 'contador' : 'suma';
    let condicionRango = null;
    if (/\bimpares?\b/.test(prompt)) condicionRango = 'i MOD 2 <> 0';
    else if (/\bpares?\b/.test(prompt)) condicionRango = 'i MOD 2 = 0';
    else if (/no divisibles? entre\s*(\d+)/.test(prompt)) condicionRango = `i MOD ${prompt.match(/no divisibles? entre\s*(\d+)/)[1]} <> 0`;
    else if (/multiplos? de\s*(\d+)/.test(prompt)) condicionRango = `i MOD ${prompt.match(/multiplos? de\s*(\d+)/)[1]} = 0`;
    const factorial = /factorial/.test(prompt);
    const terminoRango = /i\s*\+\s*1/.test(prompt) ? 'i + 1'
      : /cinco veces cada entero/.test(prompt) ? '5 * i'
        : /doble de cada entero/.test(prompt) ? '2 * i'
          : /cuadrados?/.test(prompt) ? 'i * i'
            : /cubos?/.test(prompt) ? 'i * i * i' : 'i';
    const instrucciones = [
      'Leer N', `${acumulador} <- ${factorial ? '1' : '0'}`,
      'Para i <- 1 Hasta N Hacer',
      ...(factorial
        ? [`    ${acumulador} <- ${acumulador} * i`]
        : condicionRango
          ? [`    Si ${condicionRango} Entonces`, `        ${acumulador} <- ${acumulador} + ${cuenta ? '1' : terminoRango}`, '    FinSi']
          : [`    ${acumulador} <- ${acumulador} + ${terminoRango}`]),
      'FinPara', `Escribir ${acumulador}`,
    ];
    const codigo = programa('ProcesarRango', `N, i, ${acumulador} Como Entero`, instrucciones);
    return { codigo, regla: 'secuencia desde uno hasta N', confianza: condicionRango || factorial || /suma los enteros|suma los valores|suma desde/.test(prompt) ? 'alta' : 'media' };
  }

  return null;
}

function generarU1(pregunta, prompt) {
  const numberMode = pregunta.evaluation_config?.comparacion?.modo ?? 'numeros';
  const numeric = (variables, formulas, name = 'CalcularResultado') => {
    const results = formulas.map((_, index) => `resultado${index + 1}`);
    const declarations = `${[...variables, ...results].join(', ')} Como Real`;
    const reads = variables.map((variable) => `Leer ${variable}`);
    const writes = formulas.flatMap((formula, index) => [`${results[index]} <- ${formula}`, `Escribir ${results[index]}`]);
    return { codigo: programa(name, declarations, [...reads, ...writes]), regla: 'fórmula aritmética reconocida', confianza: 'alta' };
  };

  if (/vuelto/.test(prompt)) {
    const ordenCompraPrimero = /primero.*compra.*luego.*pagado/.test(prompt);
    return numeric(ordenCompraPrimero ? ['compra', 'pagado'] : ['pagado', 'compra'], ['pagado - compra'], 'CalcularVuelto');
  }
  if (/suma de dos numeros|suma de dos valores/.test(prompt)) return numeric(['a', 'b'], ['a + b'], 'SumarDosNumeros');
  if (/diametro.*radio.*longitud.*area/.test(prompt)) return numeric(['diametro'], ['diametro / 2', 'PI * diametro', 'PI * (diametro / 2) * (diametro / 2)'], 'DatosCircunferencia');
  if (/area y perimetro de un circulo/.test(prompt)) return numeric(['radio'], [/pi\s*=\s*3[.,]1416/.test(prompt) ? '3.1416 * radio * radio' : 'PI * radio * radio', /pi\s*=\s*3[.,]1416/.test(prompt) ? '2 * 3.1416 * radio' : '2 * PI * radio'], 'AreaPerimetroCirculo');
  if (/area de un circulo/.test(prompt)) return numeric(['radio'], ['PI * radio * radio'], 'AreaCirculo');
  if (/perimetro de un circulo|circunferencia/.test(prompt)) return numeric(['radio'], [/pi\s*=\s*3[.,]1416/.test(prompt) ? '2 * 3.1416 * radio' : '2 * PI * radio'], 'PerimetroCirculo');
  if (/area de un rectangulo/.test(prompt)) return numeric(['base', 'altura'], ['base * altura'], 'AreaRectangulo');
  if (/area de un cuadrado/.test(prompt)) return numeric(['lado'], ['lado * lado'], 'AreaCuadrado');
  if (/volumen de un cubo/.test(prompt)) return numeric(['lado'], ['lado * lado * lado'], 'VolumenCubo');
  if (/vuelto|dinero entregado/.test(prompt)) return numeric(['pagado', 'compra'], ['pagado - compra'], 'CalcularVuelto');
  if (/dias.*horas.*minutos.*segundos/.test(prompt)) return numeric(['dias', 'horas', 'minutos', 'segundos'], ['dias * 86400 + horas * 3600 + minutos * 60 + segundos'], 'TiempoEnSegundos');
  if (/cantidad de segundos|total de segundos/.test(prompt) && /horas.*minutos.*segundos restantes/.test(prompt)) return numeric(['totalSegundos'], ['totalSegundos DIV 3600', '(totalSegundos MOD 3600) DIV 60', 'totalSegundos MOD 60'], 'ConvertirSegundos');
  if (/horas.*minutos.*segundos|tiempo total en segundos/.test(prompt)) return numeric(['horas', 'minutos', 'segundos'], ['horas * 3600 + minutos * 60 + segundos'], 'TiempoEnSegundos');
  if (/horas completas.*minutos restantes.*segundos restantes/.test(prompt)) {
    return numeric(['totalSegundos'], ['totalSegundos DIV 3600', '(totalSegundos MOD 3600) DIV 60', 'totalSegundos MOD 60'], 'ConvertirSegundos');
  }
  if (/cociente entero.*residuo/.test(prompt)) return numeric(['dividendo', 'divisor'], ['dividendo DIV divisor', 'dividendo MOD divisor'], 'CocienteYResiduo');
  if (/residuo de dividir/.test(prompt)) return numeric(['dividendo', 'divisor'], ['dividendo MOD divisor'], 'CalcularResiduo');
  if (/fahrenheit.*celsius/.test(prompt)) return numeric(['fahrenheit'], ['(fahrenheit - 32) * 5 / 9'], 'FahrenheitACelsius');
  if (/kilometros.*metros.*centimetros.*milimetros/.test(prompt)) return numeric(['kilometros'], ['kilometros * 1000', 'kilometros * 100000', 'kilometros * 1000000'], 'ConvertirKilometros');
  if (/metros.*centimetros/.test(prompt)) return numeric(['metros'], ['metros * 100'], 'MetrosACentimetros');
  if (/semanas.*dias/.test(prompt)) return numeric(['semanas'], ['semanas * 7'], 'SemanasADias');
  if (/velocidad promedio/.test(prompt)) return numeric(['distancia', 'tiempo'], ['distancia / tiempo'], 'VelocidadPromedio');
  if (/promedio de dos|promedio de.*notas/.test(prompt)) {
    const cantidad = Number(prompt.match(/(dos|tres|cuatro)\s+(?:notas|calificaciones|muestras)/)?.[1] === 'dos' ? 2 : 3);
    const variables = Array.from({ length: cantidad }, (_, i) => `valor${i + 1}`);
    return numeric(variables, [`(${variables.join(' + ')}) / ${cantidad}`], 'CalcularPromedio');
  }
  if (/dolar|dolares/.test(prompt) && /tipo de cambio/.test(prompt)) return numeric(['soles', 'tipoCambio'], ['soles / tipoCambio'], 'ConvertirMoneda');
  if (/sueldo semanal.*descuento del\s*(\d+(?:[.,]\d+)?)\s*%/.test(prompt)) {
    const porcentaje = prompt.match(/descuento del\s*(\d+(?:[.,]\d+)?)\s*%/)[1].replace(',', '.');
    return numeric(['horas', 'pagoHora'], ['horas * pagoHora', `(horas * pagoHora) * ${porcentaje} / 100`, `(horas * pagoHora) * (100 - ${porcentaje}) / 100`], 'SueldoYDescuento');
  }
  if (/descuento del\s*(\d+(?:[.,]\d+)?)\s*%/.test(prompt)) {
    const [, porcentaje] = prompt.match(/descuento del\s*(\d+(?:[.,]\d+)?)\s*%/);
    const fraccion = porcentaje.replace(',', '.');
    const formula = /despues del descuento|despues de aplicar|precio final|cuanto se paga|monto final/.test(prompt)
      ? `precio * (100 - ${fraccion}) / 100`
      : `precio * ${fraccion} / 100`;
    return numeric(['precio'], [formula], 'CalcularDescuento');
  }
  if (/precio.*cantidad|cantidad.*precio|importe total de la venta/.test(prompt)) return numeric(['precio', 'cantidad'], ['precio * cantidad'], 'ImporteVenta');
  if (/sueldo anual|salario anual/.test(prompt)) return numeric(['sueldoMensual'], ['sueldoMensual * 12'], 'SueldoAnual');
  if (/pago semanal/.test(prompt)) return numeric(['horas', 'pagoHora'], ['horas * pagoHora'], 'PagoSemanal');
  if (/costo total.*sumando/.test(prompt)) return numeric(['materiaPrima', 'manoObra', 'costosIndirectos'], ['materiaPrima + manoObra + costosIndirectos'], 'CostoTotal');
  if (/divide|dividir/.test(prompt) && /dos numeros|primero entre el segundo/.test(prompt)) return numeric(['dividendo', 'divisor'], ['dividendo / divisor'], 'DividirNumeros');

  if (numberMode === 'numeros' && /lee dos numeros.*suma/.test(prompt)) return numeric(['a', 'b'], ['a + b'], 'SumarDosNumeros');
  return null;
}

export function generarSolucionPrueba(pregunta) {
  const prompt = sinAcentos(pregunta.prompt);
  const unidad = String(pregunta.label ?? '').match(/^U(\d+)/i)?.[1];
  if (unidad === '2') return generarU2(pregunta, prompt);
  if (unidad === '3') return generarU3(pregunta, prompt);
  if (unidad === '1') return generarU1(pregunta, prompt);
  return null;
}
