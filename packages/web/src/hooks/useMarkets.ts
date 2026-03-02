import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSSE } from '../context/SSEContext.js';
import { getMarkets, getTopMovers } from '../api/endpoints/markets.js';
import { useEffect } from 'react';

export function useMarkets(params: Record<string, string | number> = {}) {
  const queryClient = useQueryClient();
  const { subscribe } = useSSE();

  const query = useQuery({
    queryKey: ['markets', params],
    queryFn: () => getMarkets(params),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    return subscribe('market_update', () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    });
  }, [subscribe, queryClient]);

  return query;
}

export function useTopMovers(limit = 10) {
  return useQuery({
    queryKey: ['topMovers', limit],
    queryFn: () => getTopMovers(limit),
    refetchInterval: 5 * 60_000,
  });
}
