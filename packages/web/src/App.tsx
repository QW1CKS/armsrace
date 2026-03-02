import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.js';
import { SSEProvider } from './context/SSEContext.js';
import { AlertProvider } from './context/AlertContext.js';
import { SettingsProvider } from './context/SettingsContext.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

export function App() {
  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        <SSEProvider>
          <AlertProvider>
            <RouterProvider router={router} />
          </AlertProvider>
        </SSEProvider>
      </QueryClientProvider>
    </SettingsProvider>
  );
}
