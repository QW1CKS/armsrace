export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  region: string;
  lat: number;
  lon: number;
}
