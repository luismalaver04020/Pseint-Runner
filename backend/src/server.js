import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import rpcRoutes from './routes/rpc.js';
import evaluacionRoutes from './routes/evaluacion.js';
import { HttpError } from './lib/errores.js';

const app = express();
app.disable('x-powered-by');

// FRONTEND_ORIGIN admite varios orígenes separados por comas (p. ej. localhost y el dominio de Vercel).
const origenes = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);

app.use(cors({ origin: origenes }));
app.use(express.json({ limit: '100kb' }));

app.use('/api', healthRoutes);
app.use('/api/rpc', rpcRoutes);
app.use('/api/evaluar', evaluacionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'El cuerpo no es un JSON válido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'El cuerpo es demasiado grande' });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API lista en http://localhost:${port}`);
});
