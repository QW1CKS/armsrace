import { createApp } from './app.js';
import { logger } from './logger.js';
import { initDb } from './db/client.js';
import { sseService } from './services/sseService.js';
import open from 'open';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HOST = '127.0.0.1';

async function main() {
  // Initialize database
  await initDb();

  const app = createApp();

  const server = app.listen(PORT, HOST, () => {
    sseService.start();
    logger.info(`API server ready at http://${HOST}:${PORT}`);

    if (process.env.OPEN_BROWSER !== 'false') {
      setTimeout(() => {
        open('http://localhost:4010').catch(() => {
          logger.warn('Could not auto-open browser');
        });
      }, 2500);
    }
  });

  const shutdown = () => {
    logger.info('Shutting down API server...');
    sseService.stop();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal error during API startup:', err);
  process.exit(1);
});
