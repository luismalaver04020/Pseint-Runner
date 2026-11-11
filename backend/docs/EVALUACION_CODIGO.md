# Evaluación automática de preguntas de código

```
código del alumno ─► parser.js ─► estructura del programa ─┐
                 └─► interprete.js ─► salida de cada caso ─┴─► reglas.pl (Prolog) ─► veredicto
```

Node analiza el pseudocódigo y ejecuta cada caso. Prolog es el juez de producción: compara las salidas y
aplica únicamente las estructuras que el enunciado pide explícitamente. No compara el texto del programa
con una única respuesta modelo; acepta soluciones distintas si producen las salidas esperadas.
El juez JavaScript se conserva para pruebas diferenciales y auditorías, no decide la nota en producción.

## Flujo implementado

1. El juego envía `pregunta_id`, `session_id` y el código escrito.
2. El backend valida el token, que la partida pertenezca al usuario y siga `en_curso`, y que la pregunta esté asignada a esa partida.
3. El backend obtiene de forma privada `evaluation_config`, con casos y restricciones. No lee una solución modelo.
4. El parser analiza la sintaxis; el intérprete ejecuta el algoritmo con las entradas de prueba.
5. Prolog compara resultados y aplica las reglas configuradas.
6. El juego recibe el veredicto y conserva su flujo de vidas, puntos y progreso.

Todas las preguntas publicadas deben tener casos explícitos en `evaluation_config.casos`. La migración 013 convierte las 106 preguntas legacy que dependían de referencias, valida que no quede ninguna pregunta de código sin casos y pone `expected_answer` en `NULL`. Los resultados esperados de las pruebas permanecen privados en el backend y no se envían al navegador.

## Libertad de resolución y orden de entrada

El evaluador no exige los mismos nombres de variables ni el mismo orden de declaración, asignación o cálculo que la referencia. Acepta una expresión directa, variables auxiliares y estructuras distintas si el resultado cumple todos los casos y el enunciado no impone una estructura.

Las instrucciones `Leer` reciben valores de forma secuencial. Por eso, el orden de entrada es parte del contrato del ejercicio y debe quedar explícito en el enunciado y coincidir con todos los casos. Reordenar las operaciones internas es libre; cambiar el orden de lectura sin cambiar el orden público de entrada cambia qué valor recibe cada variable. Para permitir lecturas en otro orden habría que adoptar un protocolo interactivo de entradas nombradas, que no es el comportamiento estándar de `Leer`.

Las restricciones estructurales se aplican solo si el enunciado las exige. Ejemplo: si el ejercicio dice «usa Mientras», se exige `MIENTRAS`; si solo pide calcular un promedio, no se exige una estructura de control.

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
| `comparacion.modo` | `exacto` (por defecto): mismas líneas y orden · `subsecuencia`: las esperadas en orden, con líneas extra · `contiene`: las esperadas en cualquier orden · `numeros`: solo importan los números, ignora el texto que los rodea · `semantico`: si la respuesta contiene números compara sus valores en orden e ignora etiquetas y líneas decorativas; para respuestas de texto conserva la comparación línea a línea. |
| `comparacion.ignorar_mayusculas` | `true` por defecto. |
| `comparacion.tolerancia` | Diferencia permitida entre números (`7` = `7.0`). |

Tipos válidos: `DECLARACION DIMENSION LECTURA ESCRITURA ASIGNACION CONDICIONAL SINO FIN_CONDICIONAL PARA FIN_PARA
MIENTRAS FIN_MIENTRAS REPETIR HASTA_QUE EXPRESION COMENTARIO`. Un tipo mal escrito responde `422` con el motivo
(no hace fallar a todos los alumnos en silencio).

Una pregunta es **correcta** solo si cumple todas las reglas de estructura **y** aprueba todos los casos.

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

Respuesta: `{ correcto, mensaje, casos_ok, casos_total, motivos, casos }`. Nunca devuelve los casos ocultos ni una solución modelo.

## Probar sin servidor ni base de datos

```
cd backend
npm run test:evaluador
```

## Seguridad

- El pseudocódigo del alumno se interpreta dentro de límites de tamaño e instrucciones; no se ejecuta como JavaScript del servidor.
- Los casos de prueba se leen en el backend con `service_role`; el navegador no puede pedirlos.
- El intérprete corta cada caso a 100 000 instrucciones, y el código, los casos y las líneas de salida tienen tope de tamaño.


## Auditoría del banco

`npm run audit:questions` revisa que todas las preguntas tengan configuraciones válidas y que Prolog y el juez JavaScript coincidan al aceptar los resultados esperados y rechazar una salida incorrecta. Esta auditoría valida la configuración y los jueces; no demuestra la corrección pedagógica del enunciado ni cubre todos los programas posibles.

Antes de aplicar la migración 013, `npm run audit:migration:references` ejecuta las respuestas completas que todavía existen en Supabase con cada caso publicado y con los casos propuestos para las 106 preguntas legacy. Las 194 filas cuyo `expected_answer` no es un programa completo se contabilizan por separado: ya tienen casos publicados, así que no se pueden contrastar ejecutando esa referencia parcial.
