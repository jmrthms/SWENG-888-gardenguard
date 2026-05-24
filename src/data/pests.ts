import type { Pest } from '../models/types';

/**
 * Catalog of pests and critters GardenGuard helps defend against. Ids are
 * referenced by the plant knowledge base (plantsCatalog.ts).
 */
export const PESTS: Pest[] = [
  { id: 'aphids', label: 'Aphids', type: 'insect' },
  { id: 'whiteflies', label: 'Whiteflies', type: 'insect' },
  { id: 'nematodes', label: 'Root-knot nematodes', type: 'insect' },
  { id: 'japanese-beetles', label: 'Japanese beetles', type: 'insect' },
  { id: 'mexican-bean-beetles', label: 'Mexican bean beetles', type: 'insect' },
  { id: 'cucumber-beetles', label: 'Cucumber beetles', type: 'insect' },
  { id: 'flea-beetles', label: 'Flea beetles', type: 'insect' },
  { id: 'asparagus-beetles', label: 'Asparagus beetles', type: 'insect' },
  { id: 'carrot-flies', label: 'Carrot flies', type: 'insect' },
  { id: 'cabbage-loopers', label: 'Cabbage loopers', type: 'insect' },
  { id: 'cabbage-moths', label: 'Cabbage moths', type: 'insect' },
  { id: 'tomato-hornworms', label: 'Tomato hornworms', type: 'insect' },
  { id: 'squash-bugs', label: 'Squash bugs', type: 'insect' },
  { id: 'spider-mites', label: 'Spider mites', type: 'insect' },
  { id: 'leafhoppers', label: 'Leafhoppers', type: 'insect' },
  { id: 'mosquitoes', label: 'Mosquitoes', type: 'insect' },
  { id: 'flies', label: 'Flies', type: 'insect' },
  { id: 'moths', label: 'Moths', type: 'insect' },
  { id: 'ants', label: 'Ants', type: 'insect' },
  { id: 'fleas', label: 'Fleas', type: 'insect' },
  { id: 'ticks', label: 'Ticks', type: 'insect' },
  { id: 'slugs', label: 'Slugs', type: 'critter' },
  { id: 'snails', label: 'Snails', type: 'critter' },
  { id: 'rabbits', label: 'Rabbits', type: 'critter' },
  { id: 'deer', label: 'Deer', type: 'critter' },
  { id: 'mice', label: 'Mice & rodents', type: 'critter' },
];

const PEST_BY_ID = new Map(PESTS.map((p) => [p.id, p]));

export function pestLabel(id: string): string {
  return PEST_BY_ID.get(id)?.label ?? id;
}

export function getPest(id: string): Pest | undefined {
  return PEST_BY_ID.get(id);
}
