# PSeInt Runner · puesta en marcha

La base de datos ya tiene las funciones `api_*` que usa el proyecto `main`. Este monorepo las llama
a través del backend, así que **no hace falta ejecutar ningún SQL del monorepo** (el antiguo
`02_migracion_funcional.sql` fue retirado porque no coincide con esas funciones y borraba cuentas).

## 1. Ajustes en el panel de Supabase
- **Settings → API → Exposed schemas**: debe estar `algoritmos`.
- **Authentication → Providers → Email**: para probar rápido, desactiva *Confirm email*.
  (Si lo dejas activo, cada alumno debe confirmar su correo antes de entrar.)

## 2. Backend (Terminal 1)
```
cd backend
cp .env.example .env        # completa URL, anon key y SERVICE_ROLE_KEY (solo backend)
npm install
npm run dev
```
Comprueba la conexión abriendo http://localhost:3000/api/health/db (debe responder `"ok": true`).

## 3. Frontend (Terminal 2)
```
cd frontend
cp .env.example .env        # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y VITE_API_URL
npm install
npm run dev
```

## 4. Producción (p. ej. Vercel)
- Frontend: crea las variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_API_URL`
  (la URL pública del backend, sin barra final).
- Backend: crea `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `FRONTEND_ORIGIN`
  con el dominio del frontend (varios separados por comas). La clave `service_role` es necesaria solo en el servidor backend.
- Nunca pongas `SUPABASE_SERVICE_ROLE_KEY` ni una clave `service_role` en el frontend, Vercel del frontend o variables `VITE_*`.

## 5. Primer administrador
1. Regístrate en el juego con tu correo (como alumno).
2. Dale el rol de administrador a tu cuenta desde la base de datos (SQL Editor o la tabla de usuarios).
   El proyecto `main` no incluye esa función, así que si necesitas un script para esto, pídelo y lo preparamos.
3. Cierra sesión y vuelve a entrar: verás el panel de administrador.

## Flujo
- **Docente**: se registra con "Soy docente" → el admin lo aprueba → crea sección → comparte el link `?unirse=CODIGO`.
- **Alumno**: abre el link, se registra y juega. El docente lo ve en su panel y puede removerlo (se borra su juego y su cuenta).
- **Docente/admin**: "Probar el juego" con todas las zonas abiertas; esas partidas no cuentan en ranking ni estadísticas.
- **Demo**: sin cuenta, no guarda nada.

## Cambiar la configuración del juego
Las zonas, dificultades, preguntas y retos están en `frontend/src/game/zonas.js`, `frontend/src/data/preguntas.js`
y `frontend/src/game/preguntasLogicaV2.js`, igual que en el proyecto `main`.
