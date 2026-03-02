import type { TimeWindow } from '../types/common.js';

/** Return a Date that is `ms` milliseconds in the past */
export function msAgo(ms: number): Date {
  return new Date(Date.now() - ms);
}

/** Convert a TimeWindow string to a past Date boundary */
export function windowToDate(window: TimeWindow): Date {
  const now = Date.now();
  const map: Record<Exclude<TimeWindow, 'custom'>, number> = {
    '1h': 3600_000,
    '6h': 6 * 3600_000,
    '24h': 24 * 3600_000,
    '7d': 7 * 24 * 3600_000,
  };
  if (window === 'custom') return new Date(0);
  return new Date(now - map[window]);
}

/** Format a Date as a short relative string, e.g. "3m ago", "2h ago" */
export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
