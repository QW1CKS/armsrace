import React, { createContext, useContext, useEffect, useState } from 'react';

interface Settings {
  openBrowserOnStart: boolean;
  desktopNotifications: boolean;
  dataRetentionDays: number;
  apiKeys: Record<string, string>;
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  setApiKey: (key: string, value: string) => void;
}

const DEFAULT_SETTINGS: Settings = {
  openBrowserOnStart: true,
  desktopNotifications: false,
  dataRetentionDays: 30,
  apiKeys: {},
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  setApiKey: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem('armsrace-settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('armsrace-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const setApiKey = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [key]: value },
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
