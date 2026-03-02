import type { ConnectorRegistry } from './base/ConnectorRegistry.js';

// Hazards
import { UsgsConnector } from './hazards/UsgsConnector.js';
import { NasaEonetConnector } from './hazards/NasaEonetConnector.js';
import { GdacsConnector } from './hazards/GdacsConnector.js';
import { NasaFirmsConnector } from './hazards/NasaFirmsConnector.js';

// Geo / Conflict
import { GdeltConnector } from './geo/GdeltConnector.js';
import { UcdpConnector } from './geo/UcdpConnector.js';
import { AcledConnector } from './geo/AcledConnector.js';
import { TravelAdvisoryConnector } from './geo/TravelAdvisoryConnector.js';
import { HapiConnector } from './geo/HapiConnector.js';

// Cyber
import { FeodoConnector } from './cyber/FeodoConnector.js';
import { UrlhausConnector } from './cyber/UrlhausConnector.js';
import { RansomwareLiveConnector } from './cyber/RansomwareLiveConnector.js';
import { C2IntelConnector } from './cyber/C2IntelConnector.js';
import { AlienVaultOtxConnector } from './cyber/AlienVaultOtxConnector.js';
import { AbuseIpdbConnector } from './cyber/AbuseIpdbConnector.js';

// Markets
import { YahooFinanceConnector } from './markets/YahooFinanceConnector.js';
import { CoinGeckoConnector } from './markets/CoinGeckoConnector.js';
import { FearGreedConnector } from './markets/FearGreedConnector.js';
import { FinnhubConnector } from './markets/FinnhubConnector.js';
import { FredConnector } from './markets/FredConnector.js';
import { EiaConnector } from './markets/EiaConnector.js';
import { MempoolConnector } from './markets/MempoolConnector.js';
import { PolymarketConnector } from './markets/PolymarketConnector.js';

// Military / Aviation
import { OpenskyConnector } from './military/OpenskyConnector.js';
import { GpsjamConnector } from './military/GpsjamConnector.js';
import { OrefConnector } from './military/OrefConnector.js';
import { FaaAswsConnector } from './military/FaaAswsConnector.js';

// Infrastructure
import { CloudflareRadarConnector } from './infrastructure/CloudflareRadarConnector.js';

// News
import { RssConnector } from './news/RssConnector.js';
import { HackerNewsConnector } from './news/HackerNewsConnector.js';
import { ArxivConnector } from './news/ArxivConnector.js';

// Social
import { TelegramConnector } from './social/TelegramConnector.js';

export function registerAllConnectors(registry: ConnectorRegistry): void {
  // No-key required (always enabled)
  registry.registerAll([
    new UsgsConnector(),
    new NasaEonetConnector(),
    new GdacsConnector(),
    new GdeltConnector(),
    new UcdpConnector(),
    new TravelAdvisoryConnector(),
    new HapiConnector(),
    new FeodoConnector(),
    new UrlhausConnector(),
    new RansomwareLiveConnector(),
    new C2IntelConnector(),
    new YahooFinanceConnector(),
    new CoinGeckoConnector(),
    new FearGreedConnector(),
    new MempoolConnector(),
    new PolymarketConnector(),
    new OpenskyConnector(),
    new GpsjamConnector(),
    new OrefConnector(),
    new FaaAswsConnector(),
    new RssConnector(),
    new HackerNewsConnector(),
    new ArxivConnector(),
  ]);

  // Key-optional (auto-skip if key missing)
  registry.registerAll([
    new NasaFirmsConnector(),
    new AcledConnector(),
    new AlienVaultOtxConnector(),
    new AbuseIpdbConnector(),
    new FinnhubConnector(),
    new FredConnector(),
    new EiaConnector(),
    new CloudflareRadarConnector(),
    new TelegramConnector(),
  ]);
}
