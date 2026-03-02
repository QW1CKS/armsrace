import type { ConnectorCategory } from '@armsrace/shared';

export interface RssFeedConfig {
  id: string;
  name: string;
  url: string;
  category: ConnectorCategory;
  subcategory?: string;
  defaultSeverity?: number;
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // ── Major Wire Services ──────────────────────────────────────────────────
  { id: 'reuters_world', name: 'Reuters World News', url: 'https://feeds.reuters.com/reuters/worldNews', category: 'news', subcategory: 'world' },
  { id: 'reuters_politics', name: 'Reuters Politics', url: 'https://feeds.reuters.com/Reuters/PoliticsNews', category: 'news', subcategory: 'politics' },
  { id: 'ap_world', name: 'AP World News', url: 'https://rsshub.app/apnews/topics/world-news', category: 'news', subcategory: 'world' },
  { id: 'bbc_world', name: 'BBC World News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'news', subcategory: 'world' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'news', subcategory: 'world' },
  { id: 'ft_world', name: 'Financial Times World', url: 'https://www.ft.com/world?format=rss', category: 'news', subcategory: 'economics' },
  { id: 'economist', name: 'The Economist', url: 'https://www.economist.com/sections/the-world-this-week/rss.xml', category: 'news', subcategory: 'analysis' },
  { id: 'guardian_world', name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss', category: 'news', subcategory: 'world' },
  { id: 'nyt_world', name: 'NY Times World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'news', subcategory: 'world' },

  // ── Geopolitical / Conflict specific ─────────────────────────────────────
  { id: 'foreignpolicy', name: 'Foreign Policy', url: 'https://foreignpolicy.com/feed/', category: 'geo', subcategory: 'geopolitics' },
  { id: 'war_on_rocks', name: 'War on the Rocks', url: 'https://warontherocks.com/feed/', category: 'military', subcategory: 'analysis' },
  { id: 'bellingcat', name: 'Bellingcat', url: 'https://www.bellingcat.com/feed/', category: 'geo', subcategory: 'osint' },
  { id: 'iiss', name: 'IISS (Arms Control)', url: 'https://www.iiss.org/en/rss/', category: 'military', subcategory: 'arms_control', defaultSeverity: 50 },
  { id: 'sipri', name: 'SIPRI', url: 'https://www.sipri.org/rss.xml', category: 'military', subcategory: 'arms_control' },
  { id: 'cfr', name: 'Council on Foreign Relations', url: 'https://www.cfr.org/publications/rss.xml', category: 'geo', subcategory: 'analysis' },
  { id: 'rand', name: 'RAND Corporation', url: 'https://www.rand.org/pubs/rss/all.xml', category: 'geo', subcategory: 'research' },

  // ── Cyber / Security ─────────────────────────────────────────────────────
  { id: 'krebs', name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', category: 'cyber', subcategory: 'threat_intel', defaultSeverity: 60 },
  { id: 'bleepingcomputer', name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', category: 'cyber', subcategory: 'malware' },
  { id: 'threatpost', name: 'Threatpost', url: 'https://threatpost.com/feed/', category: 'cyber', subcategory: 'vulnerabilities' },
  { id: 'darkreading', name: 'Dark Reading', url: 'https://www.darkreading.com/rss_simple.asp', category: 'cyber', subcategory: 'security_news' },
  { id: 'sans_isc', name: 'SANS Internet Storm Center', url: 'https://isc.sans.edu/rssfeed_full.xml', category: 'cyber', subcategory: 'incident', defaultSeverity: 55 },

  // ── Markets / Economics ───────────────────────────────────────────────────
  { id: 'zerohedge', name: 'ZeroHedge Markets', url: 'https://feeds.feedburner.com/zerohedge/feed', category: 'market', subcategory: 'markets' },
  { id: 'bloomberg_markets', name: 'Bloomberg Markets (via RSS)', url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'market', subcategory: 'markets' },
  { id: 'wsj_markets', name: 'WSJ Markets', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'market', subcategory: 'markets' },

  // ── Climate / Environment ─────────────────────────────────────────────────
  { id: 'un_climate', name: 'UN Climate News', url: 'https://unfccc.int/news/rss', category: 'hazard', subcategory: 'climate' },
  { id: 'reliefweb', name: 'ReliefWeb Disasters', url: 'https://reliefweb.int/disasters/rss.xml', category: 'hazard', subcategory: 'humanitarian', defaultSeverity: 55 },

  // ── Government / Institutional ───────────────────────────────────────────
  { id: 'state_dept', name: 'US State Department', url: 'https://www.state.gov/rss-feeds/press-releases/', category: 'geo', subcategory: 'diplomacy' },
  { id: 'nato', name: 'NATO News', url: 'https://www.nato.int/cps/en/natolive/news.rss', category: 'military', subcategory: 'nato', defaultSeverity: 50 },
  { id: 'un_news', name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', category: 'geo', subcategory: 'un' },
  { id: 'ecdc', name: 'ECDC (Health)', url: 'https://www.ecdc.europa.eu/en/rss.xml', category: 'hazard', subcategory: 'health', defaultSeverity: 45 },
  { id: 'who_news', name: 'WHO News', url: 'https://www.who.int/rss-feeds/news-english.xml', category: 'hazard', subcategory: 'health', defaultSeverity: 45 },

  // ── Intelligence / OSINT ────────────────────────────────────────────────
  { id: 'intel_today', name: 'Intelligence Online (Today)', url: 'https://www.intelligence-online.com/intelligence-online/rss/', category: 'geo', subcategory: 'intelligence' },
  { id: 'geopolitical_monitor', name: 'Geopolitical Monitor', url: 'https://www.geopoliticalmonitor.com/feed/', category: 'geo', subcategory: 'geopolitics' },
  { id: 'stratfor', name: 'Stratfor (via worldview)', url: 'https://worldview.stratfor.com/rss.xml', category: 'geo', subcategory: 'analysis' },

  // ── Regional ─────────────────────────────────────────────────────────────
  { id: 'haaretz_english', name: 'Haaretz (Israel)', url: 'https://www.haaretz.com/cmlink/1.628765', category: 'geo', subcategory: 'middle_east' },
  { id: 'scmp', name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed', category: 'geo', subcategory: 'east_asia' },
  { id: 'kyiv_independent', name: 'Kyiv Independent', url: 'https://kyivindependent.com/feed/', category: 'geo', subcategory: 'europe' },
  { id: 'tass_world', name: 'TASS International', url: 'https://tass.com/rss/v2.xml', category: 'geo', subcategory: 'russia' },
  { id: 'xinhua', name: 'Xinhua World', url: 'http://www.xinhuanet.com/english/rss/worldrss.xml', category: 'geo', subcategory: 'china' },
];
