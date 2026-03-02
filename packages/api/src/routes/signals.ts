import { Router } from 'express';
import { getDb } from '../db/client.js';
import { z } from 'zod';

const router = Router();

const signalsQuerySchema = z.object({
  category: z.string().optional(),
  severity_min: z.coerce.number().min(0).max(100).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
  window: z.enum(['1h', '6h', '24h', '7d']).default('24h'),
  country_code: z.string().max(2).optional(),
});

const WINDOW_MS: Record<string, number> = {
  '1h': 60 * 60_000,
  '6h': 6 * 60 * 60_000,
  '24h': 24 * 60 * 60_000,
  '7d': 7 * 24 * 60 * 60_000,
};

router.get('/', (req, res, next) => {
  try {
    const params = signalsQuerySchema.parse(req.query);
    const db = getDb();

    const since = Date.now() - (WINDOW_MS[params.window] ?? WINDOW_MS['24h']);

    const conditions: string[] = ['published_at > @since', 'is_stale = 0'];
    const bindParams: Record<string, unknown> = { since, limit: params.limit, offset: params.offset };

    if (params.category) {
      conditions.push('category = @category');
      bindParams.category = params.category;
    }
    if (params.severity_min != null) {
      conditions.push('severity >= @severityMin');
      bindParams.severityMin = params.severity_min;
    }
    if (params.country_code) {
      conditions.push('country_code = @countryCode');
      bindParams.countryCode = params.country_code.toUpperCase();
    }

    const where = conditions.join(' AND ');
    const rows = db.prepare(`
      SELECT * FROM signals WHERE ${where}
      ORDER BY published_at DESC
      LIMIT @limit OFFSET @offset
    `).all(bindParams);

    const total = (db.prepare(`SELECT COUNT(*) as cnt FROM signals WHERE ${where}`).get(
      Object.fromEntries(Object.entries(bindParams).filter(([k]) => k !== 'limit' && k !== 'offset'))
    ) as { cnt: number }).cnt;

    res.json({ data: rows, total, offset: params.offset, limit: params.limit, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

export default router;
