import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface SSEContextValue {
  connected: boolean;
  lastEvent: { type: string; data: unknown } | null;
  subscribe: (eventType: string, handler: (data: unknown) => void) => () => void;
}

const SSEContext = createContext<SSEContextValue>({
  connected: false,
  lastEvent: null,
  subscribe: () => () => {},
});

type EventHandler = (data: unknown) => void;

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ type: string; data: unknown } | null>(null);
  const handlersRef = useRef(new Map<string, Set<EventHandler>>());
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      const es = new EventSource('http://localhost:3001/api/events');
      esRef.current = es;

      es.addEventListener('connected', () => setConnected(true));
      es.addEventListener('heartbeat', () => {});
      es.addEventListener('error', () => {
        setConnected(false);
        es.close();
        retryTimeout = setTimeout(connect, 5000);
      });

      // Generic event listener for all event types
      const eventTypes = ['alert', 'index_update', 'market_update'];
      for (const eventType of eventTypes) {
        es.addEventListener(eventType, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            setLastEvent({ type: eventType, data });
            const handlers = handlersRef.current.get(eventType);
            if (handlers) {
              for (const handler of handlers) {
                handler(data);
              }
            }
          } catch {}
        });
      }
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      esRef.current?.close();
    };
  }, []);

  const subscribe = (eventType: string, handler: EventHandler) => {
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    handlersRef.current.get(eventType)!.add(handler);
    return () => {
      handlersRef.current.get(eventType)?.delete(handler);
    };
  };

  return (
    <SSEContext.Provider value={{ connected, lastEvent, subscribe }}>
      {children}
    </SSEContext.Provider>
  );
}

export function useSSE() {
  return useContext(SSEContext);
}
