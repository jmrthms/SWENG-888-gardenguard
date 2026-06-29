import type { CatalogPlant, PlantCategory, RegionId } from '../models/types';
import { CATALOG } from './regionalCatalog.generated';

/**
 * The growable-plant knowledge base, built from the real 6-region dataset (see
 * scripts/buildCatalog.mjs and regionalCatalog.generated.ts). Each plant carries
 * the regions it grows in and the pests that commonly affect it; companion
 * remedies for those pests live in companions.ts.
 */
export { CATALOG } from './regionalCatalog.generated';

export const CATALOG_BY_ID = new Map<string, CatalogPlant>(CATALOG.map((p) => [p.id, p]));

export function catalogById(id: string | undefined): CatalogPlant | undefined {
  return id ? CATALOG_BY_ID.get(id) : undefined;
}

/** True if the plant grows in the given region (or it isn't a catalog plant). */
export function plantGrowsInRegion(plant: CatalogPlant, region: RegionId): boolean {
  return plant.regions.includes(region);
}

/** Catalog plant ids that grow in a region — for fast region-fit checks. */
export function regionPlantIds(region: RegionId): Set<string> {
  return new Set(CATALOG.filter((p) => p.regions.includes(region)).map((p) => p.id));
}

/** Plants growable in a region, optionally filtered by category and search text. */
export function plantsInRegion(
  region: RegionId,
  opts: { category?: PlantCategory; query?: string } = {},
): CatalogPlant[] {
  const q = opts.query?.trim().toLowerCase();
  return CATALOG.filter((p) => p.regions.includes(region))
    .filter((p) => (opts.category ? p.category === opts.category : true))
    .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
    .sort((a, b) => a.name.localeCompare(b.name));
}
