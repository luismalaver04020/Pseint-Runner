// ─── ELIGE EL CLIENTE CON EL QUE SE EJECUTA LA FUNCIÓN ───
// Con token válido → cliente del usuario (la BD ve auth.uid() de esa persona).
// Sin token o con token vencido → cliente anónimo, salvo que la función exija sesión (401).
import { publico, clienteDe } from '../db.js';
import { HttpError } from '../lib/errores.js';

function leerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

export async function usuarioAutenticado(req) {
  const token = leerToken(req);
  if (!token) throw new HttpError(401, 'Inicia sesión para continuar');

  const { data, error } = await publico.auth.getUser(token);
  if (error || !data?.user) {
    throw new HttpError(401, 'Sesión inválida o vencida');
  }
  return data.user;
}

export async function clienteParaPeticion(req, acceso) {
  const token = leerToken(req);

  if (token) {
    const { data, error } = await publico.auth.getUser(token);
    if (!error && data?.user) return clienteDe(token);
  }

  if (acceso === 'sesion') {
    throw new HttpError(401, token ? 'Sesión inválida o vencida' : 'Inicia sesión para continuar');
  }
  return publico;
}
