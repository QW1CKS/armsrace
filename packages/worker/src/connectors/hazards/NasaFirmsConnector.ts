import type { ConnectorConfig, Signal } from '@armsrace/shared';
import { BaseConnector } from '../base/BaseConnector.js';
import got from 'got';

export class NasaFirmsConnector extends BaseConnector {
  readonly config: ConnectorConfig = {
    id: 'nasa_firms',
    name: 'NASA FIRMS Active Fires',
    category: 'hazard',
    subcategory: 'wildfire',
    intervalMs: 60 * 60_000, // hourly
    rateLimitMs: 5000,
    requiresApiKey: true,
    apiKeyEnvVar: 'NASA_FIRMS_MAP_KEY',
    enabled: true,
    baseUrl: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
    attribution: 'NASA FIRMS - Fire Information for Resource Management System',
    termsUrl: 'https://www.earthdata.nasa.gov/learn/use-data/data-use-policy',
  };

  protected async doFetch(): Promise<Signal[]> {
    const key = process.env.NASA_FIRMS_MAP_KEY!;
    // Get VIIRS active fire data globally, last 24h
    const url = `${this.config.baseUrl}/${key}/VIIRS_SNPP_NRT/world/1`;

    const csv = await got(url).text();
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',');
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('bright_ti4');
    const dateIdx = headers.indexOf('acq_date');
    const timeIdx = headers.indexOf('acq_time');
    const confIdx = headers.indexOf('confidence');

    const signals: Signal[] = [];
    // Limit to first 200 fire detections to avoid noise
    for (const line of lines.slice(1, 201)) {
      const cols = line.split(',');
      const lat = parseFloat(cols[latIdx]);
      const lon = parseFloat(cols[lonIdx]);
      const bright = parseFloat(cols[brightIdx]) || 300;
      const conf = cols[confIdx] ?? 'nominal';
      const acqDate = cols[dateIdx] ?? '';
      const acqTime = cols[timeIdx] ?? '0000';

      if (isNaN(lat) || isNaN(lon)) continue;

      const confidence = conf === 'high' ? 0.9 : conf === 'nominal' ? 0.7 : 0.5;
      const severity = Math.min(100, Math.round(((bright - 300) / 200) * 60 + 20));

      const timeStr = acqTime.padStart(4, '0');
      const publishedAt = new Date(`${acqDate}T${timeStr.slice(0, 2)}:${timeStr.slice(2)}:00Z`);

      signals.push({
        id: `firms_${lat.toFixed(2)}_${lon.toFixed(2)}_${acqDate}`,
        sourceId: this.config.id,
        category: this.config.category,
        subcategory: 'wildfire',
        title: `Active Fire Detected at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        summary: `Brightness: ${bright}K, Confidence: ${conf}`,
        severity,
        confidence,
        lat,
        lon,
        publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
      });
    }

    return signals;
  }
}
