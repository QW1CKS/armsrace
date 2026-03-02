import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout.js';

// Lazy imports for each page
import { lazy, Suspense } from 'react';

const MissionControl = lazy(() => import('../pages/MissionControl/index.js'));
const Geopolitics = lazy(() => import('../pages/Geopolitics/index.js'));
const Markets = lazy(() => import('../pages/Markets/index.js'));
const Infrastructure = lazy(() => import('../pages/Infrastructure/index.js'));
const Predictions = lazy(() => import('../pages/Predictions/index.js'));
const Alerts = lazy(() => import('../pages/Alerts/index.js'));
const DataSources = lazy(() => import('../pages/DataSources/index.js'));
const Settings = lazy(() => import('../pages/Settings/index.js'));

import React from 'react';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Loading...</div>}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <PageWrapper><MissionControl /></PageWrapper>,
      },
      {
        path: 'geopolitics',
        element: <PageWrapper><Geopolitics /></PageWrapper>,
      },
      {
        path: 'markets',
        element: <PageWrapper><Markets /></PageWrapper>,
      },
      {
        path: 'infrastructure',
        element: <PageWrapper><Infrastructure /></PageWrapper>,
      },
      {
        path: 'predictions',
        element: <PageWrapper><Predictions /></PageWrapper>,
      },
      {
        path: 'alerts',
        element: <PageWrapper><Alerts /></PageWrapper>,
      },
      {
        path: 'sources',
        element: <PageWrapper><DataSources /></PageWrapper>,
      },
      {
        path: 'settings',
        element: <PageWrapper><Settings /></PageWrapper>,
      },
    ],
  },
]);
