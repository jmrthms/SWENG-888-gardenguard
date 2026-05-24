import type { CatalogPlant, Plant, PlantPrefill } from '../models/types';
import { CATALOG, CATALOG_BY_ID } from './plantsCatalog';
import { zoneNumber } from './zones';

export function catalogById(id: string | undefined): CatalogPlant | undefined {
  return id ? CATALOG_BY_ID.get(id) : undefined;
}

/** True if the plant tolerates the given USDA zone (or zone is unknown). */
export function plantFitsZone(plant: CatalogPlant, zone?: string): boolean {
  const n = zoneNumber(zone);
  if (Number.isNaN(n)) return true; // no zone set → don't filter anything out
  return n >= plant.zoneMin && n <= plant.zoneMax;
}

export interface RecommendOptions {
  zone?: string;
  /** Only suggest plants that grow well in containers / on a balcony. */
  containerOnly?: boolean;
}

/**
 * Region-aware organic companions that repel a given pest (F5). Plants that fit
 * the user's zone rank first, then those repelling the most pests overall.
 */
export function recommendForPest(pestId: string, opts: RecommendOptions = {}): CatalogPlant[] {
  const { zone, containerOnly } = opts;
  return CATALOG.filter((p) => p.repels.includes(pestId))
    .filter((p) => (containerOnly ? p.containerFriendly : true))
    .sort((a, b) => {
      const fitA = plantFitsZone(a, zone) ? 0 : 1;
      const fitB = plantFitsZone(b, zone) ? 0 : 1;
      if (fitA !== fitB) return fitA - fitB;
      return b.repels.length - a.repels.length;
    });
}

/**
 * Companion plants that pair well with, or extend the pest coverage of, a plant
 * already in the user's garden. Combines curated pairings (goodWith) with plants
 * that share a repelled pest, filtered to the user's zone.
 */
export function companionsForPlant(plant: Plant, zone?: string, limit = 4): CatalogPlant[] {
  const source = catalogById(plant.catalogId);
  const seen = new Set<string>([plant.catalogId ?? '', plant.name.toLowerCase()]);
  const out: CatalogPlant[] = [];

  const push = (c: CatalogPlant | undefined) => {
    if (!c) return;
    if (seen.has(c.id) || seen.has(c.name.toLowerCase())) return;
    if (!plantFitsZone(c, zone)) return;
    seen.add(c.id);
    out.push(c);
  };

  // 1. Curated pairings for the source catalog plant.
  source?.goodWith?.forEach((id) => push(catalogById(id)));

  // 2. Plants that share at least one repelled pest (synergistic defense).
  if (plant.repels.length > 0) {
    CATALOG.filter((c) => c.repels.some((r) => plant.repels.includes(r)))
      .sort((a, b) => b.repels.length - a.repels.length)
      .forEach(push);
  }

  // 3. Fall back to broadly useful, zone-fitting protectors.
  CATALOG.slice()
    .sort((a, b) => b.repels.length - a.repels.length)
    .forEach(push);

  return out.slice(0, limit);
}

/** Build Add-Plant form values from a catalog plant (used by "+ Add"). */
export function toPrefill(c: CatalogPlant): PlantPrefill {
  return {
    name: c.name,
    category: c.category,
    repels: [...c.repels],
    sun: c.sun,
    water: c.water,
    zoneMin: c.zoneMin,
    zoneMax: c.zoneMax,
    catalogId: c.id,
  };
}
