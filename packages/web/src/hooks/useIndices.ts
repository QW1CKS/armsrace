import { useQuery } from '@tanstack/react-query';
import { useSSE } from '../context/SSEContext.js';
import { getIndices, getEscalationScores } from '../api/endpoints/indices.js';
import { useEffect, useState } from 'react';

export function useIndices() {
  const [liveIndices, setLiveIndices] = useState<Record<string, number>>({});
  const { subscribe } = useSSE();

  const query = useQuery({
    queryKey: ['indices'],
    queryFn: getIndices,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    return subscribe('index_update', (data) => {
      setLiveIndices((prev) => ({ ...prev, ...(data as Record<string, number>) }));
    });
  }, [subscribe]);

  const indices = query.data?.data ?? [];
  const merged: Record<string, number> = {};

  for (const idx of indices as Array<{ name: string; value: number }>) {
    merged[idx.name] = idx.value;
  }

  return { ...merged, ...liveIndices, isLoading: query.isLoading };
}

export function useEscalationScores() {
  return useQuery({
    queryKey: ['escalation'],
    queryFn: getEscalationScores,
    refetchInterval: 5 * 60_000,
  });
}
