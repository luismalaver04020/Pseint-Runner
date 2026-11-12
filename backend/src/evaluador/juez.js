const NUMERO_ESTRICTO = /^[+-]?\d+(?:\.\d+)?$/;
const TOLERANCIA_DEFAULT = 0.000001;

function limpiar(texto) {
  return String(texto).trim().replace(/[\t ]+/g, ' ');
}

function normalizarTexto(reglas, texto) {
  let normalizado = texto;
  if (reglas.ignorar_mayusculas !== 'no') normalizado = normalizado.toLocaleLowerCase('es');
  if (reglas.ignorar_tildes !== 'no') {
    normalizado = normalizado
      .replace(/ñ/g, '\uE000')
      .replace(/Ñ/g, '\uE001')
      .replace(/n\u0303/g, '\uE000')
      .replace(/N\u0303/g, '\uE001')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\uE000/g, 'ñ')
      .replace(/\uE001/g, 'Ñ');
  }
  return normalizado;
}

function numeroEstrictamente(texto) {
  const limpio = limpiar(texto);
  return NUMERO_ESTRICTO.test(limpio) ? Number(limpio) : null;
}

function numerosEnLinea(texto) {
  return String(texto).match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
}

function numerosEnLineas(lineas) {
  return lineas.flatMap(numerosEnLinea);
}

function equivalentes(reglas, esperado, obtenido) {
  const a = limpiar(esperado);
  const b = limpiar(obtenido);
  const textoA = normalizarTexto(reglas, a);
  const textoB = normalizarTexto(reglas, b);

  if (textoA === textoB) return true;

  const numeroA = numeroEstrictamente(textoA);
  const numeroB = numeroEstrictamente(textoB);
  return numeroA !== null && numeroB !== null &&
    Math.abs(numeroA - numeroB) <= (reglas.tolerancia ?? TOLERANCIA_DEFAULT);
}

function equivalentesExactos(reglas, esperado, obtenido) {
  if (equivalentes(reglas, esperado, obtenido)) return true;
  // En respuestas numéricas sin formato exigido, permite etiquetas decorativas
  // como "Resultado: 7" sin relajar las salidas textuales (p. ej. "Aprobado").
  const numeroEsperado = numeroEstrictamente(normalizarTexto(reglas, limpiar(esperado)));
  const numerosObtenidos = numerosEnLinea(obtenido);
  return numeroEsperado !== null && numerosObtenidos.length === 1 &&
    casiIgual(reglas, numeroEsperado, numerosObtenidos[0]);
}

function casiIgual(reglas, a, b) {
  return Math.abs(a - b) <= (reglas.tolerancia ?? TOLERANCIA_DEFAULT);
}

function subsecuencia(esperados, obtenidos, comparar) {
  let indice = 0;
  for (const obtenido of obtenidos) {
    if (comparar(esperados[indice], obtenido)) indice++;
    if (indice === esperados.length) return true;
  }
  return indice === esperados.length;
}

function coincide(reglas, esperado, obtenido) {
  switch (reglas.modo ?? 'exacto') {
    case 'exacto':
      return esperado.length === obtenido.length &&
        esperado.every((linea, indice) => equivalentesExactos(reglas, linea, obtenido[indice]));
    case 'subsecuencia':
      return subsecuencia(esperado, obtenido, (a, b) => equivalentes(reglas, a, b));
    case 'contiene':
      return esperado.every((linea) => obtenido.some((otra) => equivalentes(reglas, linea, otra)));
    case 'numeros': {
      const numerosEsperados = numerosEnLineas(esperado);
      const numerosObtenidos = numerosEnLineas(obtenido);
      return numerosEsperados.length > 0 && subsecuencia(
        numerosEsperados,
        numerosObtenidos,
        (a, b) => casiIgual(reglas, a, b)
      );
    }
    case 'semantico': {
      const numerosEsperados = numerosEnLineas(esperado);
      const numerosObtenidos = numerosEnLineas(obtenido);
      if (numerosEsperados.length > 0) {
        return subsecuencia(
          numerosEsperados,
          numerosObtenidos,
          (a, b) => casiIgual(reglas, a, b)
        );
      }

      return esperado.length === obtenido.length && esperado.every((linea, indice) => {
        const numerosA = numerosEnLinea(linea);
        const numerosB = numerosEnLinea(obtenido[indice]);
        if (numerosA.length > 0 && numerosB.length > 0) {
          return numerosA.length === numerosB.length &&
            numerosA.every((numero, i) => casiIgual(reglas, numero, numerosB[i]));
        }
        return equivalentes(reglas, linea, obtenido[indice]);
      });
    }
    default:
      return false;
  }
}

function contienePalabra(lineas, palabra, reglas = {}) {
  const textoNormalizado = normalizarTexto(reglas, palabra);
  const escapada = textoNormalizado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expresion = new RegExp(`(^|[^\\p{L}\\p{N}_])${escapada}($|[^\\p{L}\\p{N}_])`, 'iu');
  return lineas.some((linea) => expresion.test(linea));
}

function revisarEstructura(programa, reglas = {}) {
  const ejecutables = programa.filter(([, tipo]) => tipo !== 'COMENTARIO');
  const tipos = ejecutables.map(([, tipo]) => tipo);
  const textos = ejecutables.map(([, , texto]) => normalizarTexto(reglas, texto));
  const motivos = [];

  for (const tipo of reglas.requiere ?? []) {
    if (!tipos.includes(tipo)) motivos.push({ codigo: 'falta_estructura', tipo });
  }
  for (const tipo of reglas.prohibe ?? []) {
    if (tipos.includes(tipo)) motivos.push({ codigo: 'estructura_prohibida', tipo });
  }
  for (const [tipo, minimo] of Object.entries(reglas.minimos ?? {})) {
    const encontrado = tipos.filter((actual) => actual === tipo).length;
    if (encontrado < minimo) {
      motivos.push({ codigo: 'pocas_estructuras', tipo, minimo, encontrado });
    }
  }
  for (const palabra of reglas.requiere_texto ?? []) {
    if (!contienePalabra(textos, palabra, reglas)) motivos.push({ codigo: 'falta_palabra', palabra });
  }
  for (const palabra of reglas.prohibe_texto ?? []) {
    if (contienePalabra(textos, palabra, reglas)) motivos.push({ codigo: 'palabra_prohibida', palabra });
  }

  return motivos;
}

function juzgarCaso(reglas, caso) {
  const correcto = caso.estado !== 'error' && coincide(reglas, caso.esperado ?? [], caso.obtenido ?? []);
  return {
    id: caso.id ?? 0,
    visible: caso.visible ?? 'si',
    paso: correcto ? 'si' : 'no',
    causa: caso.estado === 'error' ? 'error_ejecucion' : correcto ? 'ninguna' : 'salida_distinta',
    detalle: caso.mensaje ?? '',
  };
}

export function juzgarEnJavaScript(entrada) {
  const casos = entrada.casos ?? [];
  if (Object.hasOwn(entrada, 'error_sintaxis')) {
    return {
      veredicto: 'incorrecto',
      motivos: [{ codigo: 'error_sintaxis', detalle: entrada.error_sintaxis }],
      casos: [],
      casos_ok: 0,
      casos_total: casos.length,
    };
  }

  const estructura = revisarEstructura(entrada.programa ?? [], entrada.reglas ?? {});
  const resultados = casos.map((caso) => juzgarCaso(entrada.reglas ?? {}, caso));
  const motivosCasos = resultados
    .filter((resultado) => resultado.paso === 'no')
    .map((resultado) => ({
      codigo: resultado.causa,
      caso: resultado.id,
      detalle: resultado.detalle,
    }));
  const motivos = [...estructura, ...motivosCasos];
  const casosOk = resultados.filter((resultado) => resultado.paso === 'si').length;

  return {
    veredicto: motivos.length === 0 ? 'correcto' : 'incorrecto',
    motivos,
    casos: resultados,
    casos_ok: casosOk,
    casos_total: resultados.length,
  };
}
