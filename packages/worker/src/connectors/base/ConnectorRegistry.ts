import type { BaseConnector } from './BaseConnector.js';
import type { ConnectorCategory } from '@armsrace/shared';

export class ConnectorRegistry {
  private connectors = new Map<string, BaseConnector>();

  register(connector: BaseConnector): void {
    if (connector.isEnabled()) {
      this.connectors.set(connector.config.id, connector);
    }
  }

  /** Register multiple connectors at once */
  registerAll(connectors: BaseConnector[]): void {
    for (const c of connectors) {
      this.register(c);
    }
  }

  get(id: string): BaseConnector | undefined {
    return this.connectors.get(id);
  }

  getAll(): BaseConnector[] {
    return [...this.connectors.values()];
  }

  getByCategory(category: ConnectorCategory): BaseConnector[] {
    return this.getAll().filter((c) => c.config.category === category);
  }

  count(): number {
    return this.connectors.size;
  }
}
