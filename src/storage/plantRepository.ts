import type { Plant } from '../models/types';
import { uuid } from '../utils/id';
import { getDb } from './db';

/** Plant fields supplied by the Add/Edit form (id + timestamps are assigned here). */
export type PlantInput = Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>;

interface PlantRow {
  id: string;
  name: string;
  category: string;
  // Legacy column name kept for on-device schema stability; holds the plant's
  // pest ids (Plant.pests) as a JSON array.
  repels: string;
  sun: string;
  water: string;
  zoneMin: number;
  zoneMax: number;
  locationLabel: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  catalogId: string | null;
  createdAt: number;
  updatedAt: number;
}

function rowToPlant(r: PlantRow): Plant {
  return {
    id: r.id,
    name: r.name,
    category: r.category as Plant['category'],
    pests: JSON.parse(r.repels) as string[],
    sun: r.sun as Plant['sun'],
    water: r.water as Plant['water'],
    zoneMin: r.zoneMin,
    zoneMax: r.zoneMax,
    locationLabel: r.locationLabel,
    coordinates:
      r.latitude != null && r.longitude != null
        ? { latitude: r.latitude, longitude: r.longitude }
        : undefined,
    notes: r.notes ?? undefined,
    catalogId: r.catalogId ?? undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

/**
 * CRUD over the user's garden plants (US-3..US-5). Scoped by ownerId so each
 * gardener only sees their own data — the privacy guarantee from US-1/US-2.
 */
export const plantRepository = {
  async list(ownerId: string): Promise<Plant[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<PlantRow>(
      'SELECT * FROM plants WHERE ownerId = ? ORDER BY name COLLATE NOCASE ASC',
      [ownerId],
    );
    return rows.map(rowToPlant);
  },

  async get(id: string): Promise<Plant | undefined> {
    const db = await getDb();
    const row = await db.getFirstAsync<PlantRow>('SELECT * FROM plants WHERE id = ?', [id]);
    return row ? rowToPlant(row) : undefined;
  },

  async create(ownerId: string, input: PlantInput): Promise<Plant> {
    const db = await getDb();
    const now = Date.now();
    const plant: Plant = { ...input, id: uuid(), createdAt: now, updatedAt: now };
    await db.runAsync(
      `INSERT INTO plants
        (id, ownerId, name, category, repels, sun, water, zoneMin, zoneMax,
         locationLabel, latitude, longitude, notes, catalogId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plant.id,
        ownerId,
        plant.name,
        plant.category,
        JSON.stringify(plant.pests),
        plant.sun,
        plant.water,
        plant.zoneMin,
        plant.zoneMax,
        plant.locationLabel,
        plant.coordinates?.latitude ?? null,
        plant.coordinates?.longitude ?? null,
        plant.notes ?? null,
        plant.catalogId ?? null,
        plant.createdAt,
        plant.updatedAt,
      ],
    );
    return plant;
  },

  async update(plant: Plant): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE plants SET
        name = ?, category = ?, repels = ?, sun = ?, water = ?,
        zoneMin = ?, zoneMax = ?, locationLabel = ?, latitude = ?, longitude = ?,
        notes = ?, catalogId = ?, updatedAt = ?
       WHERE id = ?`,
      [
        plant.name,
        plant.category,
        JSON.stringify(plant.pests),
        plant.sun,
        plant.water,
        plant.zoneMin,
        plant.zoneMax,
        plant.locationLabel,
        plant.coordinates?.latitude ?? null,
        plant.coordinates?.longitude ?? null,
        plant.notes ?? null,
        plant.catalogId ?? null,
        Date.now(),
        plant.id,
      ],
    );
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM plants WHERE id = ?', [id]);
  },
};
