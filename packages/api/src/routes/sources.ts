import { Router } from 'express';
import { getDb } from '../db/client.js';

const router = Router();

router.get('/', (_req, res, next) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM source_health ORDER BY source_id
    `).all();

    res.json({ data: rows, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

export default router;
