import type { ConnectorRegistry } from './connectors/base/ConnectorRegistry.js';
import { Pipeline } from './pipeline/Pipeline.js';
import { logger } from './logger.js';

type AnalyticsFn = () => Promise<void>;

export class Scheduler {
  private timers: ReturnType<typeof setInterval>[] = [];
  private pipeline = new Pipeline();
  private running = false;

  constructor(
    private registry: ConnectorRegistry,
    private runAnalytics: AnalyticsFn,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;

    const connectors = this.registry.getAll();

    for (const connector of connectors) {
      // Run immediately on start
      this.runConnector(connector.config.id);

      // Schedule recurring fetches
      const timer = setInterval(
        () => this.runConnector(connector.config.id),
        connector.config.intervalMs,
      );
      this.timers.push(timer);
    }

    logger.info(`Scheduler started with ${connectors.length} connectors`);
  }

  stop(): void {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers = [];
    this.running = false;
    logger.info('Scheduler stopped');
  }

  private async runConnector(connectorId: string): Promise<void> {
    const connector = this.registry.get(connectorId);
    if (!connector) return;

    try {
      const signals = await connector.fetch();
      const written = await this.pipeline.process(signals, connectorId);

      this.pipeline.getWriter().updateSourceHealth(connectorId, 'ok', written);

      if (written > 0) {
        logger.info({ connectorId, written }, 'New signals ingested');
        // Run analytics after any new data lands
        await this.runAnalytics().catch((err) =>
          logger.error({ err }, 'Analytics run failed'),
        );
      }
    } catch (err) {
      logger.error({ connectorId, err }, 'Connector run failed');
      this.pipeline
        .getWriter()
        .updateSourceHealth(connectorId, 'error', 0, String(err));
    }
  }
}
