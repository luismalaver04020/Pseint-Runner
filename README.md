# PSeInt Runner

Juego educativo para aprender pseudocódigo PSeInt.

```
pseint-runner/
├── frontend/   App React + Vite (se ejecuta en el navegador): landing, login, juego y paneles
├── backend/    API Express que llama a las funciones api_* de Supabase (ver backend/README.md)
├── SETUP.md    Guía de puesta en marcha
└── README.md
```

## Cómo se conecta todo

```
Navegador ──(registro / inicio de sesión)──► Supabase Auth
    │
    └─(token de sesión)─► Backend Express ──(token del usuario)─► funciones api_* (esquema "algoritmos")
```

- El navegador usa Supabase solo para la **sesión**.
- Todo lo demás (perfil, avatar, progreso, partidas, ranking, paneles) pasa por `POST /api/rpc/:funcion`
  del backend, que llama a la función `api_*` **con el token del usuario**, así que la base de datos
  sigue validando rol, sección y permisos.
- Las zonas, dificultades y preguntas viven en el código del frontend, igual que en el proyecto `main`.

## Ejecutar el proyecto

Necesitas dos terminales.

```
# Terminal 1: API
cd backend
cp .env.example .env     # URL y clave pública (anon) de Supabase
npm install
npm run dev

# Terminal 2: frontend
cd frontend
cp .env.example .env     # URL, clave pública de Supabase y VITE_API_URL
npm install
npm run dev
```

Detalles y configuración de Supabase en [SETUP.md](SETUP.md).

## Landing

Al abrir el juego sin sesión se muestra la landing (`frontend/src/screens/Landing.jsx`, estilos en
`frontend/src/styles/landing.css`). El botón **Jugar** lleva al inicio de sesión, donde también está
**Ver demo**. Un link de invitación `?unirse=CODIGO` salta la landing y abre directo el registro.
Las capturas de la landing están en `frontend/src/assets/landing/` (puedes reemplazarlas por otras con el mismo nombre).


## Evaluación de código PSeInt con Prolog

Las preguntas de código se envían a `backend/`; el navegador no valida palabras clave. Node analiza y ejecuta el pseudocódigo; Prolog compara sus resultados con casos de prueba y aplica las restricciones explícitas del enunciado. Las respuestas equivalentes se aceptan aunque usen otras variables, mensajes o estructuras, salvo que la pregunta exija una estructura específica.

- Todas las preguntas de código se evalúan con casos explícitos; las soluciones modelo no participan en la calificación.
- Prolog decide el veredicto con los resultados y las restricciones explícitas del enunciado.
- La ruta requiere token, `session_id` de una partida activa y una asignación real en `question_assignments`.
- La configuración y los resultados esperados nunca se envían al navegador.

Consulta `backend/docs/EVALUACION_CODIGO.md` para límites, formato y pruebas.

### Pruebas

- `cd backend && npm run test:interprete`: pruebas locales del parser/intérprete (no requiere Supabase ni Prolog).
- `cd backend && npm run test:evaluador`: pruebas completas del evaluador y SWI-Prolog (requiere instalar dependencias con `npm install`).
