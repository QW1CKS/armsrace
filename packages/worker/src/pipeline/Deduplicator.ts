import type { Signal } from '@armsrace/shared';
import { signalHash } from '@armsrace/shared';
import { getDb } from '../../db/client.js';

/** Filters out signals whose dedup hash is already recorded in the DB */
export class Deduplicator {
  isDuplicate(signal: Signal): boolean {
    const db = getDb();
    const hash = this.hashFor(signal);
    const row = db.prepare('SELECT 1 FROM dedup_hashes WHERE hash = ?').get(hash);
    return row !== undefined;
  }

  recordHash(signal: Signal): void {
    const db = getDb();
    const hash = this.hashFor(signal);
    db.prepare(`
      INSERT OR IGNORE INTO dedup_hashes (hash, signal_id)
      VALUES (?, ?)
    `).run(hash, signal.id);
  }

  filterNew(signals: Signal[]): Signal[] {
    const db = getDb();
    return signals.filter((signal) => {
      const hash = this.hashFor(signal);
      const row = db.prepare('SELECT 1 FROM dedup_hashes WHERE hash = ?').get(hash);
      return row === undefined;
    });
  }

  private hashFor(signal: Signal): string {
    const dateStr = signal.publishedAt.toDateString();
    return signalHash(signal.sourceId, signal.title, dateStr);
  }
}
