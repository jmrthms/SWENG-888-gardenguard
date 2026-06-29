import { describe, it, expect } from '@jest/globals';
import { pestsInSeason, primarySeasonalPest, seasonalTip } from '../seasons';

// Fixed local dates so the calendar is deterministic.
const JUNE = new Date(2026, 5, 15); // month index 5
const JANUARY = new Date(2026, 0, 10);

describe('seasonal calendar', () => {
  it('returns the active pests for a month', () => {
    expect(pestsInSeason(JUNE)).toContain('japanese-beetles');
    expect(primarySeasonalPest(JUNE)).toBe('japanese-beetles');
    expect(pestsInSeason(JANUARY)).toContain('scale');
  });

  it('uses only pest ids that exist in the dataset (so tips have companions)', () => {
    // every calendar pest should resolve to a companion recommendation
    for (let m = 0; m < 12; m++) {
      const tip = seasonalTip('southeast', new Date(2026, m, 15));
      expect(tip).toBeDefined();
    }
  });
});

describe('seasonalTip', () => {
  it('produces a region-worded, dataset-backed tip', () => {
    const tip = seasonalTip('southeast', JUNE)!;
    expect(tip.pestId).toBe('japanese-beetles');
    expect(tip.pestLabel).toBe('Japanese Beetles');
    expect(tip.topCompanion).toBeTruthy();
    expect(tip.message).toContain('Japanese Beetles');
    expect(tip.message).toContain('June');
    expect(tip.message).toContain('Southeast');
    expect(tip.message.toLowerCase()).toContain(tip.topCompanion!.toLowerCase());
  });

  it('words the region differently for another region', () => {
    expect(seasonalTip('northwest', JUNE)!.message).toContain('Pacific Northwest');
  });
});
