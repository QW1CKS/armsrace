import { Router } from 'express';
import { getDb } from '../db/client.js';
import { z } from 'zod';

const router = Router();

const geoQuerySchema = z.object({
  event_type: z.string().optional(),
  window: z.enum(['1h', '6h', '24h', '7d']).default('24h'),
  limit: z.coerce.number().min(1).max(2000).default(500),
});

const WINDOW_MS: Record<string, number> = {
  '1h': 60 * 60_000,
  '6h': 6 * 60 * 60_000,
  '24h': 24 * 60 * 60_000,
  '7d': 7 * 24 * 60 * 60_000,
};

router.get('/', (req, res, next) => {
  try {
    const params = geoQuerySchema.parse(req.query);
    const db = getDb();
    const since = Date.now() - (WINDOW_MS[params.window] ?? WINDOW_MS['24h']);

    const conditions: string[] = ['ge.timestamp > @since'];
    const bindParams: Record<string, unknown> = { since, limit: params.limit };

    if (params.event_type) {
      conditions.push('ge.event_type = @eventType');
      bindParams.eventType = params.event_type;
    }

    const where = conditions.join(' AND ');
    const rows = db.prepare(`
      SELECT ge.*, s.category, s.severity, s.title, s.country_code
      FROM geo_events ge
      JOIN signals s ON ge.signal_id = s.id
      WHERE ${where}
      ORDER BY ge.timestamp DESC
      LIMIT @limit
    `).all(bindParams);

    res.json({ data: rows, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

export default router;
