import { api } from '../client.js';
import type { ApiResponse } from '@armsrace/shared';

export function getMarkets(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<ApiResponse<unknown[]>>(`/api/markets${query ? '?' + query : ''}`);
}

export function getTopMovers(limit = 10) {
  return api.get<ApiResponse<unknown[]>>(`/api/markets/top-movers?limit=${limit}`);
}
