# Correcciones de PSeInt Runner — Evaluador Prolog

## Cambios realizados

- Conectado el botón de envío de código del juego con `POST /api/evaluar/codigo`; el validador local por palabras clave dejó de usarse y se retiró su implementación duplicada.
- El frontend envía `pregunta_id`, `session_id` y `codigo`; evita dobles envíos, permite reintentar si falla la conexión y no descuenta una vida por un error de red.
- El backend autentica al usuario, verifica que la partida le pertenezca y siga activa (`en_curso`), y comprueba que la pregunta esté asignada a esa partida antes de leer su evaluación.
- `expected_answer` se lee solo en backend y no se devuelve al navegador.
- Compatibilidad con preguntas existentes que guardan `{ keywords, min_ratio }`: se ejecuta la solución de referencia con 12 combinaciones representativas de entradas; Prolog compara las salidas. No se exige que el alumno use las mismas palabras clave o estructuras.
- Se agregó el modo Prolog `semantico`: compara los valores numéricos aunque el alumno cambie el texto alrededor, y conserva la comparación de texto para resultados no numéricos.
- Se agregaron plantillas `backend/.env.example` y `frontend/.env.example`, y se corrigieron las instrucciones de puesta en marcha. La clave `service_role` es exclusivamente del backend.
- Se retiraron las funciones antiguas de validación por palabras clave que ya no se utilizan. Se conservaron los demás archivos y sistemas del juego.

## Pruebas realizadas en este entorno

- Correcto: `node --check` en los módulos JavaScript modificados del backend y frontend (excepto JSX, que requiere el compilador del frontend).
- Correcto: 7 pruebas de parser/intérprete ejecutadas con Node: suma y lectura, ciclos Para/Mientras/Repetir, condicional y lectura de Cadena, y rechazo de sintaxis incompleta.
- Correcto: prueba manual de dos algoritmos diferentes (Mientras frente a Para) que generan el mismo resultado en el intérprete (`55` frente a `Resultado: 55`).
- Pendiente de ejecutar aquí: suite completa `npm run test:evaluador` y compilación Vite, porque el ZIP no incluía `node_modules` y la descarga de dependencias se agotó por tiempo en este entorno. Ejecutarlas después de `npm install` en tu computadora.
- Pendiente de validar contra tu instancia real: credenciales de Supabase, valores reales de `status`, asignación en `question_assignments` y compatibilidad de todos los registros `expected_answer`.

## Límite importante

Las 12 entradas automáticas son pruebas diferenciales representativas, no una prueba matemática de equivalencia para cualquier entrada. Para evaluaciones de alta exigencia, configura casos de prueba propios y ocultos en `evaluation_config.casos`. La cobertura también depende de las instrucciones que soporte el intérprete PSeInt.

## Instalación

1. Conserva una copia de seguridad del proyecto original.
2. Extrae el ZIP y abre `pseint-runner`.
3. Copia `backend/.env.example` como `backend/.env` y completa URL, anon key y service role key de Supabase.
4. Copia `frontend/.env.example` como `frontend/.env` y completa URL, anon key y URL del backend. Nunca pongas service role en frontend.
5. En `backend`: `npm install`, luego `npm run test:interprete`, `npm run test:evaluador` y `npm run dev`.
6. En `frontend`: `npm install` y `npm run dev`.
