import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logger.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err }, 'Unhandled error');

  const status = (err as { status?: number }).status ?? 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';

  res.status(status).json({ error: message, timestamp: Date.now() });
}
