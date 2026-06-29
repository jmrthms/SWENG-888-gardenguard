import { describe, it, expect } from '@jest/globals';
import {
  recommendForPest,
  companionFitsRegion,
  companionsForPlant,
  companionsForCatalogPlant,
  toPrefill,
  allCompanions,
} from '../recommendations';
import { COMPANIONS, resolveCompanion } from '../companions';
import { catalogById, CATALOG_BY_ID } from '../plantsCatalog';
import type { Plant } from '../../models/types';

const makePlant = (over: Partial<Plant>): Plant => ({
  id: 'p1',
  name: 'Test',
  category: 'vegetable',
  pests: [],
  sun: 'full',
  water: 'moderate',
  zoneMin: 2,
  zoneMax: 11,
  locationLabel: '',
  createdAt: 0,
  updatedAt: 0,
  ...over,
});

describe('recommendForPest', () => {
  it('returns the dataset companions for a pest', () => {
    const recs = recommendForPest('aphids', { region: 'southeast' });
    const names = recs.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['Marigold', 'Chives', 'Mint', 'Basil']));
    // every result is a real companion that repels aphids
    for (const c of recs) expect(c.repels).toContain('aphids');
  });

  it('returns [] for a pest with no remedies', () => {
    expect(recommendForPest('not-a-real-pest', { region: 'southeast' })).toEqual([]);
  });

  it('ranks region-local companions ahead of non-local ones', () => {
    // Marigold grows only in southern regions, so in the Northeast it should be
    // tagged not-local and sorted behind companions that do grow there.
    const ne = recommendForPest('aphids', { region: 'northeast' });
    const marigold = ne.find((c) => c.id === 'marigold')!;
    expect(marigold).toBeDefined();
    expect(companionFitsRegion(marigold, 'northeast')).toBe(false);

    const firstNonLocal = ne.findIndex((c) => !companionFitsRegion(c, 'northeast'));
    const lastLocal = ne.reduce((acc, c, i) => (companionFitsRegion(c, 'northeast') ? i : acc), -1);
    expect(firstNonLocal).toBeGreaterThan(lastLocal); // all locals come first
  });

  it('treats the same companion as local in a region where it grows', () => {
    const se = recommendForPest('aphids', { region: 'southeast' });
    const marigold = se.find((c) => c.id === 'marigold')!;
    expect(companionFitsRegion(marigold, 'southeast')).toBe(true);
  });
});

describe('companionFitsRegion', () => {
  it('is region-agnostic for remedy-only companions (e.g. Tansy)', () => {
    const tansy = resolveCompanion('tansy')!;
    expect(tansy).toBeDefined();
    expect(CATALOG_BY_ID.has('tansy')).toBe(false); // not a growable catalog plant
    expect(companionFitsRegion(tansy, 'northeast')).toBe(true);
    expect(companionFitsRegion(tansy, 'southwest')).toBe(true);
  });
});

describe('companionsForPlant / companionsForCatalogPlant', () => {
  it('suggests companions for a garden plant and never itself', () => {
    const basil = makePlant({ name: 'Basil', category: 'herb', pests: ['aphids'], catalogId: 'basil' });
    const recs = companionsForPlant(basil, 'southeast');
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((c) => c.id !== 'basil')).toBe(true);
  });

  it('returns [] when the plant has no pests to address', () => {
    const marigold = makePlant({ name: 'Marigold', category: 'flower', pests: [], catalogId: 'marigold' });
    expect(companionsForPlant(marigold, 'southeast')).toEqual([]);
  });

  it('suggests companions that address a catalog plant’s pests (Tomato)', () => {
    const tomato = catalogById('tomato')!;
    expect(tomato.pests).toContain('hornworms');
    const recs = companionsForCatalogPlant(tomato, 'southeast');
    const ids = recs.map((c) => c.id);
    expect(recs.length).toBeGreaterThan(0);
    expect(ids).not.toContain('tomato');
    // 'dill' is a hornworm remedy and ranks into the suggestions
    expect(ids).toContain('dill');
    // every suggested companion repels at least one of the plant's pests
    for (const c of recs) {
      expect(c.repels.some((p) => tomato.pests.includes(p))).toBe(true);
    }
  });
});

describe('toPrefill', () => {
  it('builds a prefill from a catalog plant', () => {
    const tomato = catalogById('tomato')!;
    const pf = toPrefill(tomato);
    expect(pf.name).toBe('Tomato');
    expect(pf.category).toBe('vegetable');
    expect(pf.catalogId).toBe('tomato');
    expect(pf.pests).toEqual(tomato.pests);
  });

  it('pulls growing needs from companion detail when available', () => {
    const lavender = resolveCompanion('lavender')!;
    const pf = toPrefill(lavender);
    expect(pf.zoneMin).toBe(lavender.zoneMin);
    expect(pf.water).toBe(lavender.water);
  });
});

describe('allCompanions', () => {
  it('returns every companion, region-ranked', () => {
    expect(allCompanions('southeast')).toHaveLength(COMPANIONS.length);
  });
});
