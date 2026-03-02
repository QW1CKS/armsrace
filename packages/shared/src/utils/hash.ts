/**
 * FNV-1a 64-bit hash — deterministic, no Node builtins, works in browser and Node.
 * Used for signal deduplication; not a cryptographic function.
 */
function fnv1a64(str: string): string {
  let hash = 14695981039346656037n;
  for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * 1099511628211n);
  }
  return hash.toString(16).padStart(16, '0');
}

/** Produce a deterministic hex digest of the inputs (deduplication key) */
export function signalHash(sourceId: string, title: string, publishedDateStr: string): string {
  return fnv1a64(`${sourceId}::${title}::${publishedDateStr}`);
}
