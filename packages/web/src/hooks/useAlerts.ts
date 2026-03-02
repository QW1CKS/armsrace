import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSSE } from '../context/SSEContext.js';
import { getAlerts } from '../api/endpoints/alerts.js';
import { useEffect } from 'react';

export function useAlerts(params: Record<string, string | number> = {}) {
  const queryClient = useQueryClient();
  const { subscribe } = useSSE();

  const query = useQuery({
    queryKey: ['alerts', params],
    queryFn: () => getAlerts(params),
    refetchInterval: 30_000,
  });

  // Invalidate alerts query when new alert arrives via SSE
  useEffect(() => {
    return subscribe('alert', () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    });
  }, [subscribe, queryClient]);

  return query;
}
