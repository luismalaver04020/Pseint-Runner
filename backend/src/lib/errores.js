// ─── ERRORES HTTP Y LLAMADAS A LAS FUNCIONES api_* ───
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Las funciones api_* validan con RAISE EXCEPTION (código P0001) y ya escriben el mensaje en español.
export function traducirError(error, fn = '') {
  const msg = error?.message || 'Error en la base de datos';
  const code = error?.code || '';

  if (code === 'P0001') return new HttpError(400, msg);
  if (code === '23505') return new HttpError(409, 'Ya existe un registro igual');
  if (code === '42501') {
    console.error(`[${fn}] permiso denegado en la BD:`, msg);
    return new HttpError(403, 'La base de datos rechazó la operación');
  }
  if (code === 'PGRST301' || code === 'PGRST303') return new HttpError(401, 'Sesión inválida o vencida');
  if (code === 'PGRST202' || code === '42883') {
    console.error(`[${fn}] la función no existe:`, msg);
    return new HttpError(501, `La función ${fn} no existe en la base de datos.`);
  }
  if (code === 'PGRST106') {
    console.error(`[${fn}]`, msg);
    return new HttpError(503, 'El esquema «algoritmos» no está expuesto en Supabase (Settings → API → Exposed schemas).');
  }
  if (!code) {
    console.error(`[${fn}] sin conexión con Supabase:`, msg);
    return new HttpError(502, 'No se pudo conectar con Supabase');
  }
  console.error(`[${fn}] ${code}: ${msg}`);
  return new HttpError(500, 'Error interno del servidor');
}

// Llama a una función api_* con el cliente indicado y devuelve los datos.
export async function rpc(db, fn, args = {}) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw traducirError(error, fn);
  return data;
}
