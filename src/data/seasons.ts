import type { RegionId } from '../models/types';
import { pestLabel } from './pests';
import { recommendForPest } from './recommendations';
import { regionLabel } from './regions';

/**
 * Seasonal pest intelligence (secondary feature: "Pest of the season" tips).
 *
 * A general Northern-Hemisphere calendar of when each pest tends to be active,
 * using the dataset's own pest ids so every tip can surface a real companion.
 * A production version would refine this per region and local frost dates.
 */
const SEASONAL_PESTS: Record<number, string[]> = {
  0: ['scale', 'weevils'], // Jan
  1: ['aphids', 'leaf-miners'], // Feb
  2: ['aphids', 'slugs', 'flea-beetles'], // Mar
  3: ['aphids', 'flea-beetles', 'cabbage-moths'], // Apr
  4: ['aphids', 'cucumber-beetles', 'cabbage-loopers', 'colorado-potato-beetle'], // May
  5: ['japanese-beetles', 'squash-bugs', 'hornworms', 'cucumber-beetles'], // Jun
  6: ['japanese-beetles', 'spider-mites', 'whiteflies', 'squash-bugs'], // Jul
  7: ['whiteflies', 'spider-mites', 'stink-bugs', 'powdery-mildew'], // Aug
  8: ['aphids', 'cabbage-loopers', 'powdery-mildew', 'late-blight'], // Sep
  9: ['aphids', 'root-maggots', 'slugs'], // Oct
  10: ['scale', 'weevils'], // Nov
  11: ['scale', 'slugs'], // Dec
};

/** Pests typically active for the given date's month. */
export function pestsInSeason(date: Date = new Date()): string[] {
  return SEASONAL_PESTS[date.getMonth()] ?? [];
}

/** The headline pest to surface for the season, if any. */
export function primarySeasonalPest(date: Date = new Date()): string | undefined {
  return pestsInSeason(date)[0];
}

export interface SeasonalTip {
  pestId: string;
  pestLabel: string;
  topCompanion?: string;
  message: string;
}

/**
 * A region-specific, plain-language tip for the season — e.g.
 * "Aphids are active around June in the Southeast — consider planting marigold."
 */
export function seasonalTip(region: RegionId, date: Date = new Date()): SeasonalTip | undefined {
  const pestId = primarySeasonalPest(date);
  if (!pestId) return undefined;

  const label = pestLabel(pestId);
  const month = date.toLocaleString('en-US', { month: 'long' });
  const top = recommendForPest(pestId, { region })[0];
  const where = regionLabel(region);

  const message = top
    ? `${label} are active around ${month} in the ${where} — consider planting ${top.name.toLowerCase()}.`
    : `${label} tend to be active around ${month} in the ${where}.`;

  return { pestId, pestLabel: label, topCompanion: top?.name, message };
}
