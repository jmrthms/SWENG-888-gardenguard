import type { Pest } from '../models/types';
import { DATASET_PESTS } from './regionalCatalog.generated';

/**
 * Pests, critters, and diseases GardenGuard helps defend against. Derived from
 * the dataset (so the Recommendations menu and the Add/Edit pest selector always
 * match the catalog), with a thin override table for insect/critter/disease
 * typing the raw data doesn't carry.
 */
const TYPE_OVERRIDE: Record<string, Pest['type']> = {
  'early-blight': 'disease',
  'late-blight': 'disease',
  'powdery-mildew': 'disease',
  slugs: 'critter',
};

export const PESTS: Pest[] = DATASET_PESTS.map((p) => ({
  id: p.id,
  label: p.label,
  type: TYPE_OVERRIDE[p.id] ?? 'insect',
})).sort((a, b) => a.label.localeCompare(b.label));

const PEST_BY_ID = new Map(PESTS.map((p) => [p.id, p]));

export function pestLabel(id: string): string {
  return PEST_BY_ID.get(id)?.label ?? id;
}

export function getPest(id: string): Pest | undefined {
  return PEST_BY_ID.get(id);
}

/** Icon for a pest type — insects, critters, and diseases get distinct glyphs. */
export function pestIcon(type: Pest['type']): string {
  switch (type) {
    case 'critter':
      return 'rabbit';
    case 'disease':
      return 'mushroom';
    default:
      return 'bug';
  }
}
