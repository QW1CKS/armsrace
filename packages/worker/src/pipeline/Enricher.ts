import type { Signal } from '@armsrace/shared';
import { clamp } from '@armsrace/shared';

/** Normalizes and enriches raw signals before persistence */
export class Enricher {
  enrich(signals: Signal[]): Signal[] {
    return signals.map((s) => this.enrichOne(s));
  }

  private enrichOne(signal: Signal): Signal {
    return {
      ...signal,
      severity: clamp(Math.round(signal.severity), 0, 100),
      confidence: clamp(signal.confidence, 0, 1),
      title: this.truncate(signal.title, 500),
      summary: signal.summary ? this.truncate(signal.summary, 2000) : undefined,
      countryCode: signal.countryCode ? signal.countryCode.toUpperCase().slice(0, 2) : undefined,
    };
  }

  private truncate(text: string, maxLen: number): string {
    return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
  }
}
