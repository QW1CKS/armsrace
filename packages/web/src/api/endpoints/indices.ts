import { api } from '../client.js';
import type { ApiResponse } from '@armsrace/shared';

export function getIndices() {
  return api.get<ApiResponse<unknown[]>>('/api/indices');
}

export function getIndexHistory(name: string, window = '24h') {
  return api.get<ApiResponse<unknown[]>>(`/api/indices/${name}/history?window=${window}`);
}

export function getEscalationScores() {
  return api.get<ApiResponse<unknown[]>>('/api/indices/escalation');
}
