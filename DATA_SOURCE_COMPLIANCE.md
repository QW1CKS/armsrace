# Data Source Compliance & Attribution

This document describes the terms of service, attribution requirements, and usage restrictions for all data sources integrated into Armsrace Monitor.

Armsrace Monitor is a **localhost-only, single-user personal research tool**. All data is fetched at reasonable intervals with appropriate backoff and never redistributed externally.

---

## General Principles

- **No redistribution**: Raw data fetched from third-party APIs is stored locally in SQLite and is never forwarded, published, or shared with external parties.
- **Rate limiting**: All connectors implement per-source rate limiting via `Bottleneck`. No source is polled faster than its stated public API limits.
- **Stale caching**: On fetch failure, connectors serve the most recent successful response. No retry storms.
- **Attribution**: Where required, source attribution is retained in the `source_id` and `summary` fields of each signal.
- **Personal use scope**: This tool is intended for individual research and informational purposes only, consistent with the "personal/non-commercial" usage tiers of the APIs below.

---

## Source-by-Source Notes

### USGS Earthquake Hazards
- **Terms**: Public domain data, no restrictions on use.
- **Attribution**: U.S. Geological Survey (earthquake.usgs.gov)

### NASA EONET
- **Terms**: NASA open data, no restrictions. Attribution appreciated.
- **Attribution**: NASA Earth Observatory Natural Event Tracker (eonet.gsfc.nasa.gov)

### GDACS
- **Terms**: Free for non-commercial, educational, and humanitarian use. Data provided by the European Commission Joint Research Centre.
- **Attribution**: GDACS (gdacs.org) / European Commission JRC

### NASA FIRMS
- **Terms**: Free for all uses with NASA key. Attribution required.
- **Attribution**: NASA FIRMS, courtesy of NASA EOSDIS (firms.modaps.eosdis.nasa.gov)

### GDELT Project
- **Terms**: All GDELT datasets are released as open data under Creative Commons Attribution 3.0 Unported.
- **Attribution**: The GDELT Project (gdeltproject.org)
- **License**: CC BY 3.0

### UCDP (Uppsala Conflict Data Program)
- **Terms**: Free for research and non-commercial use. Attribution required.
- **Attribution**: Uppsala Conflict Data Program, Uppsala University (ucdp.uu.se)
- **License**: CC BY 4.0

### ACLED (Armed Conflict Location & Event Data)
- **Terms**: Free for academic and non-commercial use with registration. API key required.
- **Attribution**: ACLED (acleddata.com) — used under ACLED Academic Use Terms
- **Key required**: Yes — register at acleddata.com

### US State Department / UK FCDO / AU DFAT / NZ MFAT Travel Advisories
- **Terms**: Official government public advisories. No restrictions on use for informational purposes.
- **Attribution**: US State Department, UK FCDO, Australian DFAT, New Zealand MFAT

### OCHA HAPI
- **Terms**: Humanitarian data under CC BY license. Attribution required.
- **Attribution**: OCHA Centre for Humanitarian Data (hapi.humdata.org)
- **License**: CC BY IGO 3.0

### abuse.ch (Feodo Tracker, URLhaus)
- **Terms**: Free for any use. No redistribution of raw database dumps without permission.
- **Attribution**: abuse.ch (abuse.ch)
- **Note**: Threat intelligence feeds only; no user PII.

### ransomware.live
- **Terms**: Public aggregation of publicly disclosed ransomware victim data. Use for research and threat intelligence.
- **Attribution**: ransomware.live

### C2IntelFeeds
- **Terms**: Open-source threat intelligence. Free for non-commercial use.
- **Attribution**: C2IntelFeeds contributors

### AlienVault OTX
- **Terms**: Free for personal use with API key. Commercial use requires separate agreement.
- **Attribution**: AlienVault OTX (otx.alienvault.com)
- **Key required**: Yes — free registration

### AbuseIPDB
- **Terms**: Free tier (1,000 req/day). Non-commercial use. Attribution required.
- **Attribution**: AbuseIPDB (abuseipdb.com)
- **Key required**: Yes — free registration

### Yahoo Finance
- **Terms**: Unofficial public API. Yahoo Finance data is proprietary. This connector uses publicly accessible data URLs with no authentication, consistent with personal/educational use. **Do not use in commercial products.**
- **Note**: Yahoo may change or rate-limit this endpoint at any time.

### CoinGecko
- **Terms**: Free Demo API tier (10,000 credits/month). Attribution required for public display.
- **Attribution**: CoinGecko (coingecko.com)

### CNN Fear & Greed Index
- **Terms**: Publicly accessible endpoint. Personal/research use. Not for commercial redistribution.
- **Attribution**: CNN Business Fear & Greed Index

### mempool.space
- **Terms**: Open-source project, MIT license. Free API with no key.
- **Attribution**: mempool.space (mempool.space)

### Polymarket
- **Terms**: Public prediction market data. Personal and research use. Not for commercial redistribution.
- **Attribution**: Polymarket (polymarket.com)

### Finnhub
- **Terms**: Free tier (60 calls/minute). Non-commercial and personal use.
- **Attribution**: Finnhub (finnhub.io)
- **Key required**: Yes — free registration

### Federal Reserve FRED
- **Terms**: Free for any use with API key. Attribution encouraged.
- **Attribution**: Federal Reserve Bank of St. Louis (fred.stlouisfed.org)
- **Key required**: Yes — free registration at fred.stlouisfed.org

### US EIA
- **Terms**: Government open data. Free for any use with API key.
- **Attribution**: U.S. Energy Information Administration (eia.gov)
- **Key required**: Yes — free registration at eia.gov

### OpenSky Network
- **Terms**: Free unauthenticated access (100 API credits/day). Research and non-commercial use.
- **Attribution**: OpenSky Network (opensky-network.org)
- **Note**: Rate-limited to avoid exceeding anonymous tier.

### gpsjam.org
- **Terms**: Crowd-sourced GPS interference data. Free for research use.
- **Attribution**: gpsjam.org

### IDF OREF (Pikud HaOref / Home Front Command)
- **Terms**: Official Israeli government public alert system. No restrictions on passive monitoring.
- **Attribution**: IDF Home Front Command (oref.org.il)

### FAA ASWS
- **Terms**: US government public data. No restrictions.
- **Attribution**: US Federal Aviation Administration (faa.gov)

### Cloudflare Radar
- **Terms**: Free tier with API token. Non-commercial and personal use.
- **Attribution**: Cloudflare Radar (radar.cloudflare.com)
- **Key required**: Yes — free Cloudflare account

### RSS Feeds (bulk)
- **Terms**: Varies by publisher. All feeds accessed via standard RSS/Atom protocol. Content summaries only (≤300 chars). Full articles are linked, not stored.
- **Attribution**: Attribution retained in `source_id` and `url` fields per signal.
- **Note**: Some publishers restrict automated access — review individual feed terms if deploying commercially.

### Hacker News (Algolia API)
- **Terms**: Free public API, no key required. Algolia Search API. Personal use.
- **Attribution**: Hacker News (news.ycombinator.com) / Y Combinator

### arXiv
- **Terms**: Open-access preprints. arXiv API is free for low-volume use (<=3 req/sec).
- **Attribution**: arXiv.org (arxiv.org)
- **License**: Individual paper licenses vary (typically CC BY or arXiv non-exclusive)

### Telegram (gram.js)
- **Terms**: Telegram API requires MTProto authentication with a registered app. Only **public channels** are monitored. Users are responsible for complying with Telegram's Terms of Service and applicable law. MTProto session generation is done once via interactive script.
- **Note**: This connector is opt-in. No messages or user data are stored — only extracted signal metadata (title, URL, timestamp).

---

## Disclaimer

Armsrace Monitor is a personal informational tool. It does not:
- Redistribute or republish any third-party data externally
- Scrape data beyond publicly accessible endpoints
- Store personally identifiable information (PII)
- Use any data for commercial purposes

All data is retained locally in `data/armsrace.db` for the configured retention period (default: 30 days) and is not shared with any external service.

Users are responsible for complying with the terms of service of any API provider whose key they configure.
