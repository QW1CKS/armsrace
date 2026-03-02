import type { Request, Response, NextFunction } from 'express';

/** Strip potentially dangerous characters from string query params */
function sanitizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  // Remove null bytes, control characters (except tab/newline), and HTML special chars
  return value
    .replace(/\0/g, '')
    .replace(/[<>'"]/g, '')
    .trim()
    .slice(0, 500);
}

export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // Sanitize query params
  for (const key of Object.keys(req.query)) {
    const val = req.query[key];
    if (typeof val === 'string') {
      req.query[key] = sanitizeString(val) ?? '';
    }
  }
  next();
}
