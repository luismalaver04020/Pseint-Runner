
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan SUPABASE_URL o SUPABASE_ANON_KEY en backend/.env'
  );
}

const opciones = {
  db: { schema: 'algoritmos' },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

// Cliente público: conserva el funcionamiento actual.
export const publico = createClient(url, anonKey, opciones);

// Cliente privado: exclusivo del backend.
// Nunca debe utilizarse desde el frontend.
export const privado = serviceRoleKey
  ? createClient(url, serviceRoleKey, opciones)
  : null;

// Cliente que utiliza el token del estudiante.
export function clienteDe(token) {
  return createClient(url, anonKey, {
    ...opciones,
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
