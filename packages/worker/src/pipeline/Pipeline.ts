import type { Signal } from '@armsrace/shared';
import { Deduplicator } from './Deduplicator.js';
import { Enricher } from './Enricher.js';
import { Writer } from './Writer.js';
import { logger } from '../logger.js';

export class Pipeline {
  private dedup = new Deduplicator();
  private enricher = new Enricher();
  private writer = new Writer();

  async process(rawSignals: Signal[], sourceId: string): Promise<number> {
    if (rawSignals.length === 0) return 0;

    // Enrich
    const enriched = this.enricher.enrich(rawSignals);

    // Filter duplicates
    const newSignals = this.dedup.filterNew(enriched);

    if (newSignals.length === 0) {
      logger.debug({ sourceId }, 'No new signals after deduplication');
      return 0;
    }

    // Write signals to DB
    const written = this.writer.writeSignals(newSignals);

    // Write geo events for map
    this.writer.writeGeoEvents(newSignals);

    // Record dedup hashes
    for (const s of newSignals) {
      this.dedup.recordHash(s);
    }

    logger.debug({ sourceId, written, total: rawSignals.length }, 'Pipeline processed signals');

    return written;
  }

  getWriter(): Writer {
    return this.writer;
  }
}
