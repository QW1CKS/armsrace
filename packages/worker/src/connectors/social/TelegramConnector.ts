import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import { logger } from '../../logger.js';

/**
 * Telegram MTProto Channel Aggregator
 *
 * Requires one-time auth setup: run `npm run telegram:auth` in the worker package.
 * This generates a TELEGRAM_SESSION string saved to .env.
 *
 * The gramjs library handles MTProto protocol.
 */
export class TelegramConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'telegram_osint',
    name: 'Telegram OSINT Channels',
    category: 'social',
    subcategory: 'telegram',
    intervalMs: 5 * 60_000,
    rateLimitMs: 500,
    requiresApiKey: true,
    apiKeyEnvVar: 'TELEGRAM_SESSION',
    enabled: true,
    baseUrl: 'https://api.telegram.org',
    attribution: 'Telegram (MTProto)',
    termsUrl: 'https://core.telegram.org/api/terms',
  };

  // Curated OSINT / conflict intelligence channels (public)
  private readonly CHANNELS = [
    'Intel_Slava_Z',
    'ukr_underground',
    'wartranslated',
    'warmonitor1',
    'Osint_Alerts',
    'intelsky_osint',
    'DefenceU',
    'mod_russia',
    'UkraineNewsLive',
    'MiddleEastSpectator',
  ];

  protected async doFetch(): Promise<Signal[]> {
    // Dynamic import to avoid loading gramjs when Telegram is disabled
    let TelegramClient: typeof import('telegram').TelegramClient;
    let StringSession: typeof import('telegram/sessions/StringSession.js').StringSession;

    try {
      const telegramMod = await import('telegram');
      const sessionMod = await import('telegram/sessions/StringSession.js');
      TelegramClient = telegramMod.TelegramClient;
      StringSession = sessionMod.StringSession;
    } catch {
      logger.warn('telegram package not available');
      return [];
    }

    const apiId = parseInt(process.env.TELEGRAM_API_ID ?? '0', 10);
    const apiHash = process.env.TELEGRAM_API_HASH ?? '';
    const sessionStr = process.env.TELEGRAM_SESSION ?? '';

    if (!apiId || !apiHash || !sessionStr) return [];

    const session = new StringSession(sessionStr);
    const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 2 });

    await client.connect();

    const signals: Signal[] = [];
    const cutoff = new Date(Date.now() - 30 * 60_000); // last 30 minutes

    for (const channel of this.CHANNELS) {
      try {
        const messages = await client.getMessages(channel, { limit: 10 });
        for (const msg of messages) {
          if (!msg.message?.trim()) continue;
          const msgDate = new Date((msg.date ?? 0) * 1000);
          if (msgDate < cutoff) continue;

          signals.push({
            id: `tg_${channel}_${msg.id}`,
            sourceId: this.config.id,
            category: this.config.category,
            subcategory: 'telegram_osint',
            title: `[${channel}] ${msg.message.slice(0, 100)}`,
            summary: msg.message.slice(0, 300),
            severity: 45,
            confidence: 0.5,
            url: `https://t.me/${channel}/${msg.id}`,
            publishedAt: msgDate,
          });
        }
      } catch {
        // Skip failed channels
      }
    }

    await client.disconnect();
    return signals;
  }
}
