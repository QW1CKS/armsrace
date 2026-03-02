import React from 'react';
import { Toast } from './Toast.js';
import { useAlertContext } from '../../context/AlertContext.js';

export function ToastContainer() {
  const { toasts, dismissToast } = useAlertContext();

  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '10px',
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  );
}
