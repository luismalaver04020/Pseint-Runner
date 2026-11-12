# Backend (Express)

API delgada entre el frontend y las funciones `api_*` de Supabase. No guarda nada por su cuenta:
la base de datos (esquema `algoritmos`) hace todo el trabajo y valida los permisos.

```
backend/
├── src/
│   ├── server.js            arranque, CORS y registro de rutas
│   ├── db.js                clientes de Supabase: `publico` (anon) y `clienteDe(token)` (usuario)
│   ├── middleware/auth.js   elige el cliente: con token del usuario, o anónimo si la función es pública
│   ├── lib/errores.js       HttpError, traducción de errores de la BD y función rpc()
│   ├── lib/funciones.js     lista blanca de funciones api_* que se pueden llamar
│   ├── evaluador/           parser, intérprete PSeInt y juez JavaScript (ver docs/EVALUACION_CODIGO.md)
│   └── routes/
│       ├── rpc.js           POST /api/rpc/:funcion
│       ├── evaluacion.js    POST /api/evaluar/codigo y /probar (preguntas de código)
│       └── health.js        comprobaciones
└── supabase/
    ├── migrations/          cambios nuevos de la BD (Supabase CLI), si algún día los necesitas
    └── functions/           Edge Functions (solo si hace falta lógica fuera de la BD)
```

## Puesta en marcha

```
cp .env.example .env     # SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY (solo servidor)
npm install
npm run dev              # http://localhost:3000   (necesita Node 20.6 o superior)
```

## Rutas

| Ruta | Sesión | Qué hace |
|------|:------:|----------|
| `GET /api/health` | no | Confirma que el servidor responde. |
| `GET /api/health/db` | no | Llama a `api_ranking` para confirmar que la base de datos responde. |
| `POST /api/rpc/:funcion` | según la función | Llama a la función `api_*` con el cuerpo como argumentos. |

Las funciones permitidas están en `src/lib/funciones.js`:

- **Públicas**: `api_ranking`, `api_usuario_disponible`, `api_validar_codigo`.
- **Con sesión**: perfil y partidas (`api_iniciar`, `api_mi_perfil`, `api_guardar_avatar`, `api_guardar_progreso`,
  `api_registrar_partida`, `api_registrar_respuestas`), docente (`api_listar_secciones`, `api_crear_seccion`,
  `api_crear_link`, `api_alternar_link`, `api_listar_alumnos`, `api_errores_por_tema`, `api_detalle_alumno`,
  `api_remover_alumno`) y administrador (`api_solicitudes_docente`, `api_resolver_solicitud`, `api_listar_usuarios`,
  `api_cambiar_cuenta`, `api_asignar_docente`).

Cualquier otro nombre responde `404`. Las llamadas que exigen sesión sin token válido responden `401`.
Los errores que lanza la base de datos (`RAISE EXCEPTION`) llegan al frontend como `{ "error": "mensaje en español" }`.

Para agregar una función nueva de la base de datos, primero debe existir allí, y luego se añade una línea a `src/lib/funciones.js`.

## Preguntas de código (Prolog)

Las preguntas de tipo código se validan ejecutando el algoritmo del alumno con casos de prueba y juzgándolo con
reglas Prolog. Guía de conexión, formato de configuración y pruebas: [`docs/EVALUACION_CODIGO.md`](docs/EVALUACION_CODIGO.md).

## Auditoría del banco de preguntas

- Ejecuta [`supabase/auditoria_banco_preguntas.sql`](supabase/auditoria_banco_preguntas.sql) en el SQL Editor de Supabase para revisar todas las preguntas, las opciones correctas y su asignación a niveles. Es una consulta de solo lectura.
- Configura `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` únicamente en `backend/.env`, instala las dependencias y ejecuta `npm run test:preguntas` para revisar las preguntas publicadas de código. Es de solo lectura: no cambia Supabase.
- El tester comprueba que las referencias pasen sus casos, que una variante equivalente con `Proceso` sea aceptada y que una respuesta mutada sea rechazada. También marca configuraciones débiles, preguntas sin casos ocultos y preguntas sin referencia ejecutable.
- Para investigar una pregunta y guardar el informe JSON: `npm run test:preguntas -- --question=1940 --report=reportes/pregunta-1940.json`. También admite `--label=U3-HC-231` y `--comparar-prolog`.
- Las alertas de calidad son heurísticas y requieren revisión humana; un resultado verde no demuestra equivalencia para todas las respuestas posibles.
