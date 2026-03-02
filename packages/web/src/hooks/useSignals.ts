import { useQuery } from '@tanstack/react-query';
import { getSignals, getGeoEvents } from '../api/endpoints/signals.js';

export function useSignals(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['signals', params],
    queryFn: () => getSignals(params),
    refetchInterval: 60_000,
  });
}

export function useGeoEvents(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['geoEvents', params],
    queryFn: () => getGeoEvents(params),
    refetchInterval: 2 * 60_000,
  });
}
