import { api } from '../client.js';
import type { ApiResponse } from '@armsrace/shared';

export function getPredictions(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return api.get<ApiResponse<unknown[]>>(`/api/predictions${query ? '?' + query : ''}`);
}
