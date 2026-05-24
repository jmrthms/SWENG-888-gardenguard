import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Preferences } from '../models/types';
import { DEFAULT_PREFERENCES, loadPreferences, savePreferences } from '../storage/preferences';

interface PreferencesContextValue {
  preferences: Preferences;
  loading: boolean;
  update: (partial: Partial<Preferences>) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadPreferences().then((p) => {
      if (active) {
        setPreferences(p);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(async (partial: Partial<Preferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...partial };
      void savePreferences(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ preferences, loading, update }), [preferences, loading, update]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider');
  return ctx;
}
