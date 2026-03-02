import { api } from '../client.js';
import type { ApiResponse } from '@armsrace/shared';

export function getSources() {
  return api.get<ApiResponse<unknown[]>>('/api/sources');
}
