import type { Companion, PlantCategory, Sun, Water } from '../models/types';
import { PEST_REMEDIES, REMEDY_IDS } from './regionalCatalog.generated';

/**
 * Curated growing detail for the dataset's companion/remedy plants — the organic
 * defenders GardenGuard recommends. The dataset names which companion repels
 * which pest (see {@link PEST_REMEDIES}); this table adds the human-facing note
 * and growing needs shown on recommendation cards. Notes are drawn from the
 * organic-gardening references cited in the Conception & Planning document
 * (Gardening.org, NCAT ATTRA).
 */
type CompanionDetail = Omit<Companion, 'id' | 'repels'>;

const DETAIL: Record<string, CompanionDetail> = {
  marigold: {
    name: 'Marigold',
    category: 'flower',
    sun: 'full',
    water: 'moderate',
    zoneMin: 2,
    zoneMax: 11,
    containerFriendly: true,
    note: 'Roots suppress root-knot nematodes; blooms repel aphids and whiteflies and attract ladybugs and hoverflies.',
  },
  nasturtium: {
    name: 'Nasturtium',
    category: 'flower',
    sun: 'full',
    water: 'low',
    zoneMin: 2,
    zoneMax: 11,
    containerFriendly: true,
    note: 'A trap crop that lures aphids and squash bugs away from vegetables; the flowers are edible. Annual.',
  },
  basil: {
    name: 'Basil',
    category: 'herb',
    sun: 'full',
    water: 'moderate',
    zoneMin: 2,
    zoneMax: 11,
    containerFriendly: true,
    note: 'Strong aroma repels flies, mosquitoes, and hornworms; a staple tomato companion. Grown as an annual.',
  },
  chives: {
    name: 'Chives',
    category: 'herb',
    sun: 'full',
    water: 'moderate',
    zoneMin: 3,
    zoneMax: 9,
    containerFriendly: true,
    note: 'Onion-family scent confuses carrot flies and repels aphids; pairs well with carrots and tomatoes.',
  },
  garlic: {
    name: 'Garlic',
    category: 'vegetable',
    sun: 'full',
    water: 'moderate',
    zoneMin: 3,
    zoneMax: 9,
    containerFriendly: true,
    note: 'Sulfur compounds deter aphids, beetles, and spider mites — a classic underplanting for tomatoes and brassicas.',
  },
  mint: {
    name: 'Mint',
    category: 'herb',
    sun: 'partial',
    water: 'moderate',
    zoneMin: 3,
    zoneMax: 8,
    containerFriendly: true,
    note: 'Pungent oils deter ants, cabbage moths, and rodents. Grow in a pot — mint spreads aggressively in beds.',
  },
  rosemary: {
    name: 'Rosemary',
    category: 'herb',
    sun: 'full',
    water: 'low',
    zoneMin: 7,
    zoneMax: 10,
    containerFriendly: true,
    note: 'Woody Mediterranean herb whose scent repels cabbage moths and bean beetles and discourages browsing pests.',
  },
  lavender: {
    name: 'Lavender',
    category: 'herb',
    sun: 'full',
    water: 'low',
    zoneMin: 5,
    zoneMax: 9,
    containerFriendly: true,
    note: 'Aromatic oils mask the scents that draw mosquitoes and moths, and the strong fragrance deters many pests.',
  },
  catnip: {
    name: 'Catnip',
    category: 'herb',
    sun: 'full',
    water: 'low',
    zoneMin: 3,
    zoneMax: 9,
    containerFriendly: true,
    note: 'Its nepetalactone has been shown to repel mosquitoes and several beetles; extremely hardy (and cats love it).',
  },
  dill: {
    name: 'Dill',
    category: 'herb',
    sun: 'full',
    water: 'moderate',
    zoneMin: 2,
    zoneMax: 11,
    containerFriendly: true,
    note: 'Attracts predatory wasps and ladybugs that clear aphids and mites; let some plants flower. Annual.',
  },
  sage: {
    name: 'Sage',
    category: 'herb',
    sun: 'full',
    water: 'low',
    zoneMin: 4,
    zoneMax: 10,
    containerFriendly: true,
    note: 'Drought-tolerant herb that deters cabbage moths and carrot flies and is seldom browsed.',
  },
  borage: {
    name: 'Borage',
    category: 'herb',
    sun: 'full',
    water: 'moderate',
    zoneMin: 2,
    zoneMax: 11,
    containerFriendly: true,
    note: 'Deters tomato hornworms and cabbage worms while attracting pollinators; a classic tomato and squash companion. Annual.',
  },
  // Companions the dataset uses that were not in the original seeded catalog:
  chamomile: {
    name: 'Chamomile',
    category: 'herb',
    sun: 'partial',
    water: 'moderate',
    zoneMin: 3,
    zoneMax: 9,
    containerFriendly: true,
    note: 'Daisy-scented herb that draws hoverflies and predatory wasps which clear aphids; a gentle companion for brassicas and onions. Annual.',
  },
  radish: {
    name: 'Radish',
    category: 'vegetable',
    sun: 'full',
    water: 'moderate',
    zoneMin: 2,
    zoneMax: 11,
    containerFriendly: true,
    note: 'Fast-growing trap crop that draws flea beetles and cucumber beetles away from squash and brassicas — sacrifice a few to protect the rest. Annual.',
  },
  tansy: {
    name: 'Tansy',
    category: 'herb',
    sun: 'full',
    water: 'low',
    zoneMin: 3,
    zoneMax: 9,
    containerFriendly: true,
    note: 'Strong-scented blooms repel Colorado potato beetles, squash bugs, and ants; plant near potatoes and brassicas. Vigorous — give it room or contain it.',
  },
};

// Derive, for each companion, the pests it repels — straight from the dataset's
// global pest -> remedy map, so the catalog and recommendations never drift.
const repelsByCompanion = new Map<string, Set<string>>();
for (const [pestId, companionIds] of Object.entries(PEST_REMEDIES)) {
  for (const id of companionIds) {
    if (!repelsByCompanion.has(id)) repelsByCompanion.set(id, new Set());
    repelsByCompanion.get(id)!.add(pestId);
  }
}

/** Fallback growing detail for any remedy id missing a curated entry. */
function fallbackDetail(id: string): CompanionDetail {
  const name = id.replace(/(^|-)([a-z])/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase()).trim();
  return {
    name,
    category: 'herb' as PlantCategory,
    sun: 'full' as Sun,
    water: 'moderate' as Water,
    zoneMin: 3,
    zoneMax: 9,
    containerFriendly: true,
    note: 'Organic companion plant that helps repel garden pests.',
  };
}

export const COMPANIONS: Companion[] = REMEDY_IDS.map((id) => {
  const detail = DETAIL[id] ?? fallbackDetail(id);
  return {
    id,
    repels: [...(repelsByCompanion.get(id) ?? [])].sort(),
    ...detail,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

export const COMPANION_BY_ID = new Map<string, Companion>(COMPANIONS.map((c) => [c.id, c]));

export function resolveCompanion(id: string): Companion | undefined {
  return COMPANION_BY_ID.get(id);
}
