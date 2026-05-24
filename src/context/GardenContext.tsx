import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Plant } from '../models/types';
import { plantRepository, type PlantInput } from '../storage/plantRepository';
import { useAuth } from './AuthContext';

interface GardenContextValue {
  plants: Plant[];
  loading: boolean;
  refresh: () => Promise<void>;
  addPlant: (input: PlantInput) => Promise<Plant>;
  updatePlant: (plant: Plant) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  getPlant: (id: string) => Plant | undefined;
}

const GardenContext = createContext<GardenContextValue | undefined>(undefined);

/** Holds the signed-in user's garden and brokers CRUD to the SQLite repository. */
export function GardenProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const ownerId = user?.id ?? '';
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!ownerId) {
      setPlants([]);
      setLoading(false);
      return;
    }
    const rows = await plantRepository.list(ownerId);
    setPlants(rows);
    setLoading(false);
  }, [ownerId]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  const addPlant = useCallback(
    async (input: PlantInput) => {
      const created = await plantRepository.create(ownerId, input);
      await refresh();
      return created;
    },
    [ownerId, refresh],
  );

  const updatePlant = useCallback(
    async (plant: Plant) => {
      await plantRepository.update(plant);
      await refresh();
    },
    [refresh],
  );

  const deletePlant = useCallback(
    async (id: string) => {
      await plantRepository.remove(id);
      await refresh();
    },
    [refresh],
  );

  const getPlant = useCallback((id: string) => plants.find((p) => p.id === id), [plants]);

  const value = useMemo(
    () => ({ plants, loading, refresh, addPlant, updatePlant, deletePlant, getPlant }),
    [plants, loading, refresh, addPlant, updatePlant, deletePlant, getPlant],
  );
  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden(): GardenContextValue {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error('useGarden must be used within a GardenProvider');
  return ctx;
}
