import { describe, it, expect } from '@jest/globals';
import { CATALOG, DATASET_PESTS, PEST_REMEDIES, REMEDY_IDS } from '../regionalCatalog.generated';
import {
  CATALOG_BY_ID,
  catalogById,
  plantsInRegion,
  plantGrowsInRegion,
  regionPlantIds,
} from '../plantsCatalog';
import { REGIONS, REGIONS_BY_ID, DEFAULT_REGION, regionLabel, regionMeta } from '../regions';
import type { RegionId } from '../../models/types';

const ALL_REGIONS: RegionId[] = [
  'northeast',
  'northwest',
  'north_central',
  'south_central',
  'southeast',
  'southwest',
];

describe('generated dataset integrity', () => {
  it('has the expected catalog/pest/remedy counts', () => {
    expect(CATALOG).toHaveLength(123);
    expect(DATASET_PESTS).toHaveLength(35);
    expect(REMEDY_IDS).toHaveLength(15);
  });

  it('splits the catalog 67 flowers / 23 herbs / 33 vegetables', () => {
    const byCat = CATALOG.reduce<Record<string, number>>((m, p) => {
      m[p.category] = (m[p.category] ?? 0) + 1;
      return m;
    }, {});
    expect(byCat).toEqual({ flower: 67, herb: 23, vegetable: 33 });
  });

  it('uses unique plant ids and only valid regions', () => {
    const ids = CATALOG.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of CATALOG) {
      expect(p.regions.length).toBeGreaterThan(0);
      for (const r of p.regions) expect(ALL_REGIONS).toContain(r);
    }
  });

  it('only references pests that exist in DATASET_PESTS', () => {
    const pestIds = new Set(DATASET_PESTS.map((p) => p.id));
    for (const p of CATALOG) {
      for (const pest of p.pests) expect(pestIds.has(pest)).toBe(true);
    }
  });

  it('maps every pest to remedies drawn only from REMEDY_IDS', () => {
    const remedySet = new Set(REMEDY_IDS);
    const keys = Object.keys(PEST_REMEDIES);
    expect(keys).toHaveLength(35);
    for (const [pest, remedies] of Object.entries(PEST_REMEDIES)) {
      expect(remedies.length).toBeGreaterThan(0);
      for (const r of remedies) {
        expect(remedySet.has(r)).toBe(true);
      }
      expect(DATASET_PESTS.some((p) => p.id === pest)).toBe(true);
    }
  });
});

describe('plantsCatalog helpers', () => {
  it('looks plants up by id', () => {
    expect(catalogById('tomato')?.name).toBe('Tomato');
    expect(CATALOG_BY_ID.get('tomato')?.category).toBe('vegetable');
    expect(catalogById('does-not-exist')).toBeUndefined();
    expect(catalogById(undefined)).toBeUndefined();
  });

  it('plantsInRegion filters by region and category', () => {
    const veg = plantsInRegion('southeast', { category: 'vegetable' });
    expect(veg.length).toBeGreaterThan(0);
    for (const p of veg) {
      expect(p.category).toBe('vegetable');
      expect(p.regions).toContain('southeast');
    }
    // results are sorted by name
    const names = veg.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('plantsInRegion supports a search query', () => {
    const hits = plantsInRegion('southeast', { query: 'tom' });
    expect(hits.some((p) => p.id === 'tomato')).toBe(true);
  });

  it('regionPlantIds / plantGrowsInRegion agree', () => {
    const ids = regionPlantIds('northeast');
    const tomato = catalogById('tomato')!;
    expect(plantGrowsInRegion(tomato, 'northeast')).toBe(ids.has('tomato'));
  });
});

describe('regions', () => {
  it('defines all six regions with metadata', () => {
    expect(REGIONS).toHaveLength(6);
    for (const r of ALL_REGIONS) {
      const meta = REGIONS_BY_ID.get(r);
      expect(meta).toBeDefined();
      expect(meta!.label.length).toBeGreaterThan(0);
      expect(typeof meta!.center.latitude).toBe('number');
    }
  });

  it('defaults to the southeast and labels/falls back sensibly', () => {
    expect(DEFAULT_REGION).toBe('southeast');
    expect(regionLabel('southeast')).toBe('Southeast');
    expect(regionMeta('northeast').id).toBe('northeast');
    // unknown id falls back to the first region rather than throwing
    expect(regionMeta('atlantis' as RegionId)).toBe(REGIONS[0]);
  });
});
