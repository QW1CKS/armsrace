import type { Express } from 'express';
import { apiRateLimiter } from '../middleware/rateLimiter.js';
import signalsRouter from './signals.js';
import alertsRouter from './alerts.js';
import marketsRouter from './markets.js';
import geoRouter from './geo.js';
import indicesRouter from './indices.js';
import predictionsRouter from './predictions.js';
import sourcesRouter from './sources.js';
import sseRouter from './sse.js';

export function registerRoutes(app: Express): void {
  app.use('/api', apiRateLimiter);
  app.use('/api/signals', signalsRouter);
  app.use('/api/alerts', alertsRouter);
  app.use('/api/markets', marketsRouter);
  app.use('/api/geo', geoRouter);
  app.use('/api/indices', indicesRouter);
  app.use('/api/predictions', predictionsRouter);
  app.use('/api/sources', sourcesRouter);
  app.use('/api', sseRouter);
}
