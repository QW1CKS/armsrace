import { api } from '../client.js';
import type { ApiResponse, PaginatedResponse } from '@armsrace/shared';

export function getAlerts(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<PaginatedResponse<Record<string, unknown>>>(`/api/alerts${query ? '?' + query : ''}`);
}

export function acknowledgeAlert(id: string) {
  return api.post(`/api/alerts/${id}/acknowledge`);
}

export function dismissAlert(id: string) {
  return api.post(`/api/alerts/${id}/dismiss`);
}
