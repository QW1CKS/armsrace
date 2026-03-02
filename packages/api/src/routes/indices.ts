import { Router } from 'express';
import { getDb } from '../db/client.js';

const router = Router();

router.get('/', (_req, res, next) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT DISTINCT ON (name) name, value, components, computed_at
      FROM indices
      GROUP BY name
      HAVING MAX(computed_at)
      ORDER BY name
    `).all() as Array<{ name: string; value: number; components: string; computed_at: number }>;

    // Try alternate query if DISTINCT ON fails (SQLite syntax)
    const indices = rows.length > 0 ? rows : db.prepare(`
      SELECT i.name, i.value, i.components, i.computed_at
      FROM indices i
      INNER JOIN (
        SELECT name, MAX(computed_at) as latest FROM indices GROUP BY name
      ) l ON i.name = l.name AND i.computed_at = l.latest
    `).all() as Array<{ name: string; value: number; components: string; computed_at: number }>;

    const result = indices.map((r) => ({
      ...r,
      components: JSON.parse(r.components ?? '{}'),
    }));

    res.json({ data: result, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

router.get('/:name/history', (req, res, next) => {
  try {
    const { name } = req.params;
    const window = (req.query.window as string) ?? '24h';
    const db = getDb();

    const windowMs: Record<string, number> = {
      '1h': 60 * 60_000,
      '6h': 6 * 60 * 60_000,
      '24h': 24 * 60 * 60_000,
      '7d': 7 * 24 * 60 * 60_000,
    };
    const since = Date.now() - (windowMs[window] ?? windowMs['24h']);

    const rows = db.prepare(`
      SELECT value, computed_at FROM indices
      WHERE name = ? AND computed_at > ?
      ORDER BY computed_at ASC
    `).all(name, since);

    res.json({ data: rows, name, window, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

router.get('/escalation', (_req, res, next) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT es.* FROM escalation_scores es
      INNER JOIN (
        SELECT country_code, MAX(computed_at) as latest FROM escalation_scores GROUP BY country_code
      ) l ON es.country_code = l.country_code AND es.computed_at = l.latest
      ORDER BY es.score DESC
      LIMIT 50
    `).all() as Array<{ top_signals: string; [key: string]: unknown }>;

    const result = rows.map((r) => ({
      ...r,
      topSignals: JSON.parse(r.top_signals ?? '[]'),
    }));

    res.json({ data: result, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

export default router;
