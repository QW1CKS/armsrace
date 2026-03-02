import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors.js';
import { sanitizeMiddleware } from './middleware/sanitize.js';
import { errorHandler } from './middleware/errorHandler.js';
import { registerRoutes } from './routes/index.js';

export function createApp() {
  const app = express();

  // Security headers (restricted to localhost usage)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Leaflet tiles need relaxed CSP
    }),
  );

  // CORS — only allow requests from the Vite frontend on localhost
  app.use(corsMiddleware);

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  // Input sanitization
  app.use(sanitizeMiddleware);

  // Routes
  registerRoutes(app);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
