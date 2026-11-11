// Evaluación de código: solo una pregunta asignada a la partida activa del usuario.
import { Router } from 'express';
import { HttpError } from '../lib/errores.js';
import { usuarioAutenticado } from '../middleware/auth.js';
import { privado } from '../db.js';
import { obtenerEvaluacion } from '../evaluador/fuentePreguntas.js';
import { evaluarCodigo, ConfigInvalida, CodigoInvalido } from '../evaluador/evaluarCodigo.js';

const router = Router();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function validarAsignacion({ userId, sessionId, preguntaId }) {
  if (!privado) throw new HttpError(501, 'El backend necesita SUPABASE_SERVICE_ROLE_KEY para validar la partida.');
  const { data: partida, error: errorPartida } = await privado
    .from('game_sessions').select('session_id')
    .eq('session_id', sessionId).eq('user_id', userId).eq('status', 'en_curso').maybeSingle();
  if (errorPartida) {
    console.error('[evaluacion] error al validar partida:', errorPartida.message);
    throw new HttpError(502, 'No se pudo verificar la partida.');
  }
  if (!partida) throw new HttpError(403, 'La partida no existe, no te pertenece o ya terminó.');

  const { data: asignacion, error: errorAsignacion } = await privado
    .from('question_assignments').select('assignment_id')
    .eq('session_id', sessionId).eq('user_id', userId).eq('question_id', preguntaId).maybeSingle();
  if (errorAsignacion) {
    console.error('[evaluacion] error al validar asignación:', errorAsignacion.message);
    throw new HttpError(502, 'No se pudo verificar la pregunta asignada.');
  }
  if (!asignacion) throw new HttpError(403, 'Esta pregunta no está asignada a tu partida.');
}

async function ejecutar(codigo, config) {
  try {
    if (!Array.isArray(config?.casos) || config.casos.length === 0) {
      throw new ConfigInvalida('la pregunta no tiene casos de prueba publicados');
    }
    return await evaluarCodigo(codigo, config);
  } catch (e) {
    if (e instanceof CodigoInvalido) throw new HttpError(400, e.message);
    if (e instanceof ConfigInvalida) {
      console.error('[evaluacion] configuración inválida:', e.message);
      throw new HttpError(422, `No se pudo preparar la evaluación de esta pregunta: ${e.message}`);
    }
    throw e;
  }
}

router.post('/codigo', async (req, res) => {
  const usuario = await usuarioAutenticado(req);
  const { pregunta_id: preguntaIdRaw, session_id: sessionId, codigo } = req.body ?? {};
  if (preguntaIdRaw === undefined || preguntaIdRaw === null || !/^\d+$/.test(String(preguntaIdRaw))) {
    throw new HttpError(400, 'Falta un pregunta_id válido.');
  }
  if (typeof sessionId !== 'string' || !UUID.test(sessionId)) throw new HttpError(400, 'Falta un session_id válido.');
  if (typeof codigo !== 'string' || !codigo.trim()) throw new HttpError(400, 'Escribe tu código antes de enviarlo.');

  const preguntaId = String(preguntaIdRaw);
  await validarAsignacion({ userId: usuario.id, sessionId, preguntaId });
  const { config } = await obtenerEvaluacion(preguntaId);
  res.json(await ejecutar(codigo, config));
});

// Herramienta local para que el docente/desarrollador pruebe configuraciones.
// Se desactiva en producción para que no exista una ruta pública de evaluación arbitraria.
router.post('/probar', async (req, res) => {
  if (process.env.NODE_ENV === 'production') throw new HttpError(404, 'Ruta no encontrada');
  await usuarioAutenticado(req);
  const { config, codigo } = req.body ?? {};
  res.json(await ejecutar(codigo, config, null));
});

export default router;
