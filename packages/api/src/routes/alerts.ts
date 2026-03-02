import { Router } from 'express';
import { getDb } from '../db/client.js';
import { z } from 'zod';

const router = Router();

const alertsQuerySchema = z.object({
  type: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  acknowledged: z.enum(['true', 'false']).optional(),
});

router.get('/', (req, res, next) => {
  try {
    const params = alertsQuerySchema.parse(req.query);
    const db = getDb();

    const conditions: string[] = ['dismissed_at IS NULL'];
    const bindParams: Record<string, unknown> = { limit: params.limit, offset: params.offset };

    if (params.type) {
      conditions.push('type = @type');
      bindParams.type = params.type;
    }
    if (params.acknowledged === 'true') {
      conditions.push('acknowledged_at IS NOT NULL');
    } else if (params.acknowledged === 'false') {
      conditions.push('acknowledged_at IS NULL');
    }

    const where = conditions.join(' AND ');
    const rows = db.prepare(`
      SELECT * FROM alerts WHERE ${where}
      ORDER BY triggered_at DESC
      LIMIT @limit OFFSET @offset
    `).all(bindParams);

    // Deserialize JSON fields
    const alerts = rows.map((r: Record<string, unknown>) => ({
      ...r,
      sources: JSON.parse(r.sources_json as string ?? '[]'),
      entities: JSON.parse(r.entities_json as string ?? '[]'),
      signalIds: JSON.parse(r.signal_ids as string ?? '[]'),
    }));

    const total = (db.prepare(`SELECT COUNT(*) as cnt FROM alerts WHERE ${where}`).get(
      Object.fromEntries(Object.entries(bindParams).filter(([k]) => k !== 'limit' && k !== 'offset'))
    ) as { cnt: number }).cnt;

    res.json({ data: alerts, total, offset: params.offset, limit: params.limit, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/acknowledge', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.prepare(`UPDATE alerts SET acknowledged_at = ? WHERE id = ?`).run(Date.now(), id);
    res.json({ ok: true, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/dismiss', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.prepare(`UPDATE alerts SET dismissed_at = ? WHERE id = ?`).run(Date.now(), id);
    res.json({ ok: true, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

export default router;
