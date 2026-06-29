import type { CatalogPlant, Companion, Plant, PlantCategory, PlantPrefill, RegionId } from '../models/types';
import { CATALOG_BY_ID, catalogById, regionPlantIds } from './plantsCatalog';
import { COMPANIONS, resolveCompanion } from './companions';
import { PEST_REMEDIES } from './regionalCatalog.generated';

export interface RecommendOptions {
  region: RegionId;
}

/**
 * True if a companion is appropriate for the region — either it grows there, or
 * it is a remedy-only plant (e.g. Tansy) that isn't tracked in the regional
 * catalog at all, in which case we treat it as region-agnostic rather than
 * spuriously "not local".
 */
export function companionFitsRegion(companion: Companion, region: RegionId): boolean {
  if (!CATALOG_BY_ID.has(companion.id)) return true; // remedy-only → region-agnostic
  return regionPlantIds(region).has(companion.id);
}

/**
 * Rank companions so those that fit the user's region come first, then those
 * that tackle the widest range of pests, then alphabetically.
 */
function rankForRegion(companions: Companion[], region: RegionId): Companion[] {
  return [...companions].sort((a, b) => {
    const fitA = companionFitsRegion(a, region) ? 0 : 1;
    const fitB = companionFitsRegion(b, region) ? 0 : 1;
    if (fitA !== fitB) return fitA - fitB;
    if (b.repels.length !== a.repels.length) return b.repels.length - a.repels.length;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Region-aware organic companions that repel a given pest (F5). Drawn straight
 * from the dataset's pest -> remedy map, ranked region-first.
 */
export function recommendForPest(pestId: string, opts: RecommendOptions): Companion[] {
  const ids = PEST_REMEDIES[pestId] ?? [];
  const companions = ids.map(resolveCompanion).filter((c): c is Companion => !!c);
  return rankForRegion(companions, opts.region);
}

/** Distinct companions that address any pest in the given list, ranked region-first. */
function companionsForPests(pestIds: string[], region: RegionId, exclude: string[] = []): Companion[] {
  const skip = new Set(exclude);
  const ids = new Set<string>();
  for (const pest of pestIds) {
    for (const id of PEST_REMEDIES[pest] ?? []) {
      if (!skip.has(id)) ids.add(id);
    }
  }
  const companions = [...ids].map(resolveCompanion).filter((c): c is Companion => !!c);
  return rankForRegion(companions, region);
}

/**
 * Companion plants that help protect a plant already in the user's garden —
 * the organic remedies for the pests that plant faces (F5, "protect a plant").
 */
export function companionsForPlant(plant: Plant, region: RegionId, limit = 4): Companion[] {
  return companionsForPests(plant.pests, region, [plant.catalogId ?? '']).slice(0, limit);
}

/** Companions for a catalog plant the user is considering (Recommendations "by plant"). */
export function companionsForCatalogPlant(plant: CatalogPlant, region: RegionId, limit = 6): Companion[] {
  return companionsForPests(plant.pests, region, [plant.id]).slice(0, limit);
}

/**
 * Build Add-Plant form values from a catalog plant or companion. Pulls the pest
 * associations from the growable catalog and the growing needs from the curated
 * companion table when available.
 */
export function toPrefill(p: { id: string; name: string; category: PlantCategory }): PlantPrefill {
  const cat = catalogById(p.id);
  const comp = resolveCompanion(p.id);
  return {
    name: p.name,
    category: p.category,
    pests: cat?.pests ?? [],
    sun: comp?.sun ?? 'full',
    water: comp?.water ?? 'moderate',
    zoneMin: comp?.zoneMin ?? 2,
    zoneMax: comp?.zoneMax ?? 11,
    catalogId: p.id,
  };
}

/** All companions, ranked for a region — used when browsing the full defender list. */
export function allCompanions(region: RegionId): Companion[] {
  return rankForRegion(COMPANIONS, region);
}
