# Evaluación automática de preguntas de código

```
código del alumno ─► parser.js ─► estructura del programa ─┐
                 └─► interprete.js ─► salida de cada caso ─┴─► juez.js ─► veredicto
```

Node analiza y ejecuta el código del alumno con cada caso de prueba. `juez.js` compara las salidas y
aplica las estructuras que la pregunta pide explícitamente. No compara el texto del programa con una
única respuesta modelo: acepta soluciones distintas si producen las salidas esperadas.

SWI-Prolog se conserva como implementación de referencia para las pruebas de paridad durante la
migración; no participa en la calificación de las respuestas en producción.

## Flujo implementado

1. El juego envía `pregunta_id`, `session_id` y el código escrito.
2. El backend valida el token, que la partida pertenezca al usuario y siga `en_curso`, y que la pregunta esté asignada a esa partida.
3. El backend obtiene de forma privada la configuración y, cuando corresponde, `expected_answer`.
4. El parser analiza la sintaxis; el intérprete ejecuta el algoritmo con las entradas de prueba.
5. JavaScript compara resultados y aplica las reglas configuradas.
6. El juego recibe el veredicto y conserva su flujo de vidas, puntos y progreso.

Para preguntas nuevas se recomienda configurar `evaluation_config` con casos visibles y ocultos. Para las preguntas antiguas que solo tienen `{ keywords, min_ratio }`, el backend ejecuta `expected_answer` como referencia con entradas positivas por defecto y usa negativos/cero cuando el enunciado pide esos casos. Si una entrada generada queda fuera del dominio de la referencia (por ejemplo, divisor cero), se descarta sin invalidar la pregunta. Ese modo permite cambiar `Para` por `Mientras` (o viceversa) cuando el comportamiento coincide; las palabras clave antiguas no bloquean soluciones alternativas.

## Formato de `evaluation_config`

```json
{
  "casos": [
    { "entradas": ["3", "4"], "salida": ["7"] },
    { "entradas": ["0", "0"], "salida": ["0"], "visible": false }
  ],
  "estructura": {
    "requiere": ["LECTURA", "CONDICIONAL"],
    "prohibe": ["PARA"],
    "minimos": { "ESCRITURA": 1 },
    "requiere_texto": ["MOD"],
    "prohibe_texto": []
  },
  "comparacion": { "modo": "exacto", "ignorar_mayusculas": true, "tolerancia": 0.000001 }
}
```

| Campo | Qué hace |
|---|---|
| `casos[].entradas` | Valores que recibirán los `Leer`, en orden. |
| `casos[].salida` | Líneas que debe mostrar el programa (un `Escribir` = una línea; sus argumentos se concatenan). |
| `casos[].visible` | `false` = caso oculto: si falla, el alumno solo ve que falló (no ve entradas ni salida esperada). |
| `estructura.requiere` / `prohibe` | Tipos de instrucción que debe / no debe usar. |
| `estructura.minimos` | Cantidad mínima de un tipo (p. ej. `{"ESCRITURA": 2}`). |
| `estructura.requiere_texto` / `prohibe_texto` | Palabras u operadores (`MOD`, `+`, `*`). Se buscan como palabra completa, sin contar comentarios. |
| `comparacion.modo` | `exacto` (por defecto): mismas líneas y orden; si la salida esperada es solo un número, acepta una etiqueta decorativa junto al mismo valor · `subsecuencia`: las esperadas en orden, con líneas extra · `contiene`: las esperadas en cualquier orden · `numeros`: solo importan los números, ignora el texto que los rodea · `semantico`: si la respuesta contiene números compara sus valores en orden e ignora etiquetas y líneas decorativas; para respuestas de texto conserva la comparación línea a línea. |
| `comparacion.ignorar_tildes` | `true` por defecto: trata vocales con y sin tilde como equivalentes, pero mantiene `n` y `ñ` distintas. Se aplica a salidas y a palabras estructurales requeridas/prohibidas. |
| `comparacion.ignorar_mayusculas` | `true` por defecto. |
| `comparacion.tolerancia` | Diferencia permitida entre números (`7` = `7.0`). |

Tipos válidos: `DECLARACION DIMENSION LECTURA ESCRITURA ASIGNACION CONDICIONAL SINO FIN_CONDICIONAL PARA FIN_PARA
MIENTRAS FIN_MIENTRAS REPETIR HASTA_QUE EXPRESION COMENTARIO`. Un tipo mal escrito responde `422` con el motivo
(no hace fallar a todos los alumnos en silencio).

Una pregunta es **correcta** solo si cumple todas las reglas de estructura **y** aprueba todos los casos.

El intérprete admite `=`, `==`, `<>` y `!=` para comparar igualdad/desigualdad, `MOD` y `%` para el residuo, y `^` para potencia. También admite `Algoritmo`/`Proceso`, identificadores Unicode y comentarios `//` al final de la línea. Se ejecuta el código real del estudiante; no se comparan nombres de variables ni se exige que use la misma estructura de ciclos, salvo que `estructura.requiere` o `estructura.prohibe` la especifique.

Ejemplo de SQL:

```sql
UPDATE algoritmos.questions
SET evaluation_config = '{"casos":[{"entradas":["4"],"salida":["Par"]},{"entradas":["7"],"salida":["Impar"]}],
                          "estructura":{"requiere":["CONDICIONAL","SINO"],"requiere_texto":["MOD"]},
                          "comparacion":{"modo":"exacto"}}'::jsonb
WHERE question_id = 123;
```

`src/evaluador/configs-ejemplo.json` trae la configuración de las 6 preguntas de código que hoy están en `frontend/src/data/preguntas.js`.

## Rutas

| Ruta | Qué hace |
|---|---|
| `POST /api/evaluar/codigo` `{ pregunta_id, session_id, codigo }` | Valida sesión, propiedad de partida activa y asignación de pregunta; después lee la configuración privada y juzga el código. |
| `POST /api/evaluar/probar` `{ config, codigo }` | Solo desarrollo; deshabilitada en producción y exige sesión. |

Respuesta: `{ correcto, mensaje, casos_ok, casos_total, motivos, casos }`. Nunca devuelve `expected_answer`.

## Probar sin servidor ni base de datos

```
cd backend
npm run test:evaluador
```

## Auditar las preguntas publicadas automáticamente

`npm run test:preguntas` ejecuta una auditoría de solo lectura contra las preguntas publicadas de código en Supabase. Comprueba que la respuesta de referencia pase sus propios casos, acepta una variante equivalente `Proceso`/`FinProceso`, verifica que una respuesta deliberadamente incorrecta sea rechazada y revisa configuraciones con casos débiles, sin casos ocultos o sin referencia ejecutable.

Configura `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `backend/.env` antes de ejecutarlo. Para revisar una sola pregunta o guardar el informe JSON:

```
npm run test:preguntas -- --question=1940
npm run test:preguntas -- --label=U3-HC-231 --report=reportes/pregunta-1940.json
```

También admite `--comparar-prolog` para comparar el resultado del juez JavaScript con el juez Prolog. El informe separa fallas confirmadas de pendientes y alertas heurísticas; las alertas requieren revisión humana porque los casos por sí solos no prueban que una consigna y sus resultados esperados tengan la misma intención.

Para generar y ejecutar una respuesta candidata por pregunta desde una exportación del banco (CSV con una columna JSON `banco`), usa:

```
node test-preguntas-generadas.mjs --csv="banco-1.csv" --csv="banco-2.csv" --report="reportes/respuestas-generadas.json" --csv-report="reportes/resumen-preguntas.csv" --sql="reportes/correcciones-seguras.sql"
```

El reporte clasifica cada pregunta como `PASA`, `NO_PASA`, `ERROR_EJECUCION` o `SIN_SOLUCION_GENERADA` e incluye el pseudocódigo candidato y el detalle de cada caso. El CSV ofrece el resumen de estado, causa y consigna por pregunta. El archivo SQL solo propone completar `expected_answer` cuando una solución generada con confianza alta pasó todos los casos existentes. Las preguntas sin reglas de generación confiables quedan pendientes; no se corrigen a partir de una conjetura.

## Seguridad

- El pseudocódigo del alumno se interpreta dentro de límites de tamaño e instrucciones; no se ejecuta como JavaScript del servidor.
- Los casos de prueba se leen en el backend con `service_role`; el navegador no puede pedirlos.
- El intérprete corta cada caso a 100 000 instrucciones, y el código, los casos y las líneas de salida tienen tope de tamaño.


## Alcance de la comparación legacy

La comparación diferencial con `expected_answer` ejecuta 12 combinaciones representativas, no constituye una demostración matemática de equivalencia para todas las entradas posibles. Para preguntas importantes, añade casos propios y ocultos en `evaluation_config.casos`; estos tienen prioridad sobre el formato antiguo. La equivalencia depende también de las construcciones de PSeInt que el intérprete soporte.
