import { api } from '../client.js';
import type { ApiResponse, PaginatedResponse } from '@armsrace/shared';

export function getSignals(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<PaginatedResponse<Record<string, unknown>>>(`/api/signals${query ? '?' + query : ''}`);
}

export function getGeoEvents(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<ApiResponse<unknown[]>>(`/api/geo${query ? '?' + query : ''}`);
}
