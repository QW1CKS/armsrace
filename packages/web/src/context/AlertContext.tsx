import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSSE } from './SSEContext.js';

interface Toast {
  id: string;
  title: string;
  body?: string;
  severity: number;
  type: string;
  createdAt: number;
}

interface AlertContextValue {
  unreadCount: number;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  markAllRead: () => void;
}

const AlertContext = createContext<AlertContextValue>({
  unreadCount: 0,
  toasts: [],
  dismissToast: () => {},
  markAllRead: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const { subscribe } = useSSE();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const unsub = subscribe('alert', (data) => {
      const alert = data as { id: string; title: string; body?: string; severity: number; type: string };
      const toast: Toast = {
        id: alert.id,
        title: alert.title,
        body: alert.body,
        severity: alert.severity ?? 50,
        type: alert.type ?? 'info',
        createdAt: Date.now(),
      };

      setToasts((prev) => [toast, ...prev].slice(0, 5));
      setUnreadCount((n) => n + 1);

      // Desktop notification for high severity
      if (alert.severity >= 70 && Notification.permission === 'granted') {
        new Notification(`Armsrace Alert: ${alert.title}`, {
          body: alert.body,
          icon: '/favicon.ico',
        });
      }

      // Auto-dismiss after 8s
      setTimeout(() => dismissToast(toast.id), 8000);
    });

    return unsub;
  }, [subscribe, dismissToast]);

  return (
    <AlertContext.Provider value={{ unreadCount, toasts, dismissToast, markAllRead }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
