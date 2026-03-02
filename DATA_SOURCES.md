# Data Sources

All sources ingested by Armsrace Monitor. Connectors marked **No Key** run immediately out of the box. Connectors marked **Key Required** or **Key Optional** are skipped when the corresponding environment variable is absent.

---

## Hazards

| Connector | Source | Category | Key | Update Interval | Notes |
|---|---|---|---|---|---|
| UsgsConnector | USGS Earthquake Hazards Program | hazard | No Key | 5 min | M1.0+ earthquakes worldwide |
| NasaEonetConnector | NASA EONET (Earth Observatory Natural Event Tracker) | hazard | No Key | 15 min | Storms, wildfires, floods, volcanic activity |
| GdacsConnector | GDACS (Global Disaster Alert and Coordination System) | hazard | No Key | 15 min | Red/orange/green alerts for earthquakes, floods, cyclones |
| NasaFirmsConnector | NASA FIRMS (Fire Information for Resource Management) | hazard | Key Optional (`NASA_FIRMS_MAP_KEY`) | 30 min | Active fire detections from VIIRS/MODIS |

---

## Geopolitical / Conflict

| Connector | Source | Category | Key | Update Interval | Notes |
|---|---|---|---|---|---|
| GdeltConnector | GDELT Project | conflict | No Key | 15 min | Global news event coding; geopolitical tone analysis |
| UcdpConnector | UCDP (Uppsala Conflict Data Program) | conflict | No Key | 60 min | Georeferenced conflict events database |
| AcledConnector | ACLED (Armed Conflict Location & Event Data) | conflict | Key Optional (`ACLED_API_KEY` + `ACLED_EMAIL`) | 30 min | Detailed armed conflict events; free academic key |
| TravelAdvisoryConnector | US State Dept, UK FCDO, AU DFAT, NZ MFAT | advisory | No Key | 60 min | Official government travel advisories (level 1–4) |
| HapiConnector | OCHA HAPI (Humanitarian API) | humanitarian | Key Optional (`HAPI_APP_IDENTIFIER`) | 60 min | Humanitarian situation indicators |

---

## Cyber Threat Intelligence

| Connector | Source | Category | Key | Update Interval | Notes |
|---|---|---|---|---|---|
| FeodoConnector | abuse.ch Feodo Tracker | cyber | No Key | 15 min | C2 botnet infrastructure (Emotet, TrickBot, etc.) |
| UrlhausConnector | abuse.ch URLhaus | cyber | No Key | 15 min | Malware distribution URLs |
| RansomwareLiveConnector | ransomware.live | cyber | No Key | 30 min | Active ransomware group victim posts |
| C2IntelConnector | C2IntelFeeds | cyber | No Key | 30 min | Open-source C2 server indicators |
| AlienVaultOtxConnector | AlienVault OTX (Open Threat Exchange) | cyber | Key Optional (`OTX_API_KEY`) | 20 min | Community threat pulses; IoCs |
| AbuseIpdbConnector | AbuseIPDB | cyber | Key Optional (`ABUSEIPDB_API_KEY`) | 30 min | IP reputation and abuse reports |

---

## Markets & Economy

| Connector | Source | Category | Key | Update Interval | Notes |
|---|---|---|---|---|---|
| YahooFinanceConnector | Yahoo Finance (unofficial) | market | No Key | 5 min | Equities, indices, FX spot prices |
| CoinGeckoConnector | CoinGecko Public API | market | No Key | 5 min | Cryptocurrency prices and market caps |
| FearGreedConnector | CNN Fear & Greed Index | market | No Key | 10 min | Composite sentiment index (0–100) |
| MempoolConnector | mempool.space Bitcoin API | market | No Key | 10 min | Bitcoin mempool, fees, block data |
| PolymarketConnector | Polymarket prediction markets | market | No Key | 15 min | Prediction market probabilities for geopolitical events |
| FinnhubConnector | Finnhub.io | market | Key Optional (`FINNHUB_API_KEY`) | 5 min | Real-time stock quotes, earnings, news sentiment |
| FredConnector | Federal Reserve FRED API | economy | Key Optional (`FRED_API_KEY`) | 60 min | US macro indicators: CPI, unemployment, treasury yields |
| EiaConnector | US Energy Information Administration | energy | Key Optional (`EIA_API_KEY`) | 60 min | WTI/Brent crude, natural gas, refined product prices |

---

## Military / Aviation / Maritime

| Connector | Source | Category | Key | Update Interval | Notes |
|---|---|---|---|---|---|
| OpenskyConnector | OpenSky Network | aviation | No Key | 10 min | Live ADS-B aircraft positions (unauthenticated rate limit) |
| GpsjamConnector | gpsjam.org | military | No Key | 30 min | GPS jamming/spoofing event reports |
| OrefConnector | IDF OREF (Pikud HaOref) | military | No Key | 2 min | Israeli Home Front Command alerts |
| FaaAswsConnector | FAA ASWS (Air Safety Warning System) | aviation | No Key | 15 min | FAA TFRs and airspace alerts |

---

## Infrastructure

| Connector | Source | Category | Key | Update Interval | Notes |
|---|---|---|---|---|---|
| CloudflareRadarConnector | Cloudflare Radar API | infrastructure | Key Optional (`CLOUDFLARE_API_TOKEN`) | 10 min | Internet traffic anomalies, outages, routing events |

---

## News & Research

| Connector | Source | Category | Key | Update Interval | Notes |
|---|---|---|---|---|---|
| RssConnector | 150+ curated RSS feeds | news/various | No Key | 10 min | Bulk feed aggregator: Reuters, AP, BBC, Al Jazeera, defense/security blogs, regional outlets |
| HackerNewsConnector | Hacker News Algolia API | cyber/tech | No Key | 15 min | Top HN stories with security/geopolitical tags |
| ArxivConnector | arXiv.org API | research | No Key | 60 min | Recent papers in security, AI warfare, conflict studies |

---

## Social / Messaging

| Connector | Source | Category | Key | Update Interval | Notes |
|---|---|---|---|---|---|
| TelegramConnector | Telegram (gram.js MTProto) | social | Key Optional (`TELEGRAM_API_ID` + `TELEGRAM_API_HASH` + `TELEGRAM_SESSION`) | 2 min | Monitors configured public channels for conflict signals |

---

## Signal Counts by Category

| Category | Typical Signals/Day | Primary Sources |
|---|---|---|
| conflict | 500–2000 | GDELT, ACLED, UCDP, RSS |
| cyber | 200–800 | Feodo, URLhaus, RansomwareLive, C2Intel |
| market | 100–400 | Yahoo Finance, CoinGecko, Finnhub |
| hazard | 50–200 | USGS, EONET, GDACS |
| advisory | 10–50 | Travel advisories |
| military | 20–100 | OpenSky, OREF, GPSJAM |
| infrastructure | 10–50 | Cloudflare Radar |
| news | 1000–5000 | RSS bulk |
| social | variable | Telegram |
