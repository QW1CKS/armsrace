import { createHash } from 'crypto';

/** Produce a deterministic SHA-256 hex digest of the inputs (deduplication key) */
export function signalHash(sourceId: string, title: string, publishedDateStr: string): string {
  return createHash('sha256')
    .update(`${sourceId}::${title}::${publishedDateStr}`)
    .digest('hex');
}
