// ─── PUENTE HACIA LAS FUNCIONES api_* ───
// POST /api/rpc/:funcion  con el cuerpo { ...argumentos }  →  devuelve lo que devuelve la función.
// Solo se llaman las funciones de lib/funciones.js; los argumentos los valida la propia base de datos.
import { Router } from 'express';
import { HttpError, rpc } from '../lib/errores.js';
import { FUNCIONES, esFuncionPermitida } from '../lib/funciones.js';
import { clienteParaPeticion } from '../middleware/auth.js';

const router = Router();

router.post('/:funcion', async (req, res) => {
  const nombre = req.params.funcion;
  if (!esFuncionPermitida(nombre)) throw new HttpError(404, 'Función no disponible');

  const args = req.body ?? {};
  if (typeof args !== 'object' || Array.isArray(args)) throw new HttpError(400, 'Los argumentos deben ser un objeto');

  const db = await clienteParaPeticion(req, FUNCIONES[nombre]);
  const datos = await rpc(db, nombre, args);
  res.json(datos ?? null);
});

export default router;
