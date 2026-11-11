// ─── COMPROBACIONES ───
// GET /api/health      → el servidor responde (no toca la base de datos).
// GET /api/health/db   → la base de datos responde (llama a api_ranking, que es pública).
import { Router } from 'express';
import { publico } from '../db.js';
import { rpc } from '../lib/errores.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.get('/health/db', async (req, res) => {
  await rpc(publico, 'api_ranking', { p_dificultad: 'facil' });
  res.json({ ok: true });
});

export default router;
