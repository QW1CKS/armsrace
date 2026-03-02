import { initDb } from './db/client.js';
import { logger } from './logger.js';
import { ConnectorRegistry } from './connectors/base/ConnectorRegistry.js';
import { Scheduler } from './scheduler.js';
import { registerAllConnectors } from './connectors/index.js';
import { runAnalytics } from './analytics/index.js';

async function main() {
  logger.info('Armsrace Worker starting...');

  // Initialize database (will create + migrate if needed)
  await initDb();

  // Register all enabled connectors
  const registry = new ConnectorRegistry();
  registerAllConnectors(registry);

  logger.info(`${registry.getAll().length} connectors registered`);

  // Run initial analytics pass
  await runAnalytics();

  // Start scheduler
  const scheduler = new Scheduler(registry, runAnalytics);
  scheduler.start();

  logger.info('Worker running. Press Ctrl+C to stop.');

  const shutdown = () => {
    logger.info('Shutting down worker...');
    scheduler.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal error during worker startup:', err);
  process.exit(1);
});
