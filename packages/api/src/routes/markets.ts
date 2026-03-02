import { Router } from 'express';
import { getDb } from '../db/client.js';
import { z } from 'zod';

const router = Router();

const marketsQuerySchema = z.object({
  asset_class: z.string().optional(),
  symbols: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
});

router.get('/', (req, res, next) => {
  try {
    const params = marketsQuerySchema.parse(req.query);
    const db = getDb();

    const conditions: string[] = [];
    const bindParams: Record<string, unknown> = { limit: params.limit };

    if (params.asset_class) {
      conditions.push('asset_class = @assetClass');
      bindParams.assetClass = params.asset_class;
    }
    if (params.symbols) {
      const syms = params.symbols.split(',').map((s) => s.trim().toUpperCase()).slice(0, 50);
      conditions.push(`symbol IN (${syms.map((_, i) => `@sym${i}`).join(',')})`);
      syms.forEach((s, i) => { bindParams[`sym${i}`] = s; });
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get latest snapshot per symbol
    const rows = db.prepare(`
      SELECT ms.* FROM market_snapshots ms
      INNER JOIN (
        SELECT symbol, MAX(snapshot_at) as latest FROM market_snapshots
        ${where ? where.replace(/asset_class/g, 'ms2.asset_class').replace(/symbol/g, 'ms2.symbol') : ''}
        GROUP BY symbol
      ) latest_snap ON ms.symbol = latest_snap.symbol AND ms.snapshot_at = latest_snap.latest
      ${where}
      ORDER BY ms.asset_class, ABS(ms.change_pct) DESC
      LIMIT @limit
    `).all(bindParams);

    res.json({ data: rows, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

router.get('/top-movers', (req, res, next) => {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit as string ?? '10', 10), 50);
    const since = Date.now() - 60 * 60_000;

    const rows = db.prepare(`
      SELECT ms.* FROM market_snapshots ms
      INNER JOIN (
        SELECT symbol, MAX(snapshot_at) as latest FROM market_snapshots GROUP BY symbol
      ) l ON ms.symbol = l.symbol AND ms.snapshot_at = l.latest
      WHERE ms.snapshot_at > ? AND ms.change_pct IS NOT NULL
      ORDER BY ABS(ms.change_pct) DESC
      LIMIT ?
    `).all(since, limit);

    res.json({ data: rows, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
});

export default router;
