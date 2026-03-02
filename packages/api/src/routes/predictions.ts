import { Router } from 'express';
import { getDb } from '../db/client.js';
import { z } from 'zod';

const router = Router();

const predictionsQuerySchema = z.object({
  horizon: z.enum(['24h', '72h', '7d']).optional(),
  subject_type: z.enum(['global', 'region', 'country', 'asset']).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

router.get('/', (req, res, next) => {
  try {
    const params = predictionsQuerySchema.parse(req.query);
    const db = getDb();

    const conditions: string[] = [];
    const bindParams: Record<string, unknown> = { limit: params.limit };

    if (params.horizon) {
      conditions.push('horizon = @horizon');
      bindParams.horizon = params.horizon;
    }
    if (params.subject_type) {
      conditions.push('subject_type = @subjectType');
      bindParams.subjectType = params.subject_type;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = db.prepare(`
      SELECT f.* FROM forecasts f
      ${where}
      ORDER BY f.generated_at DESC
      LIMIT @limit
    `).all(bindParams) as Array<{ signal_basis: string; [key: string]: unknown }>;

    const result = rows.map((r) => ({
      ...r,
      signalBasis: JSON.parse(r.signal_basis ?? '[]'),
    }));

    res.json({ data: result, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

export default router;
