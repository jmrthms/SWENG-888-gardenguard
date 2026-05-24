import { pestLabel } from './pests';
import { recommendForPest } from './recommendations';

/**
 * Seasonal pest intelligence (secondary feature: "Pest of the season" tips).
 *
 * A general Northern-Hemisphere calendar of when each pest/critter tends to be
 * active. Intentionally a curated, on-device heuristic — a production version
 * would refine this per hardiness zone and local frost dates.
 */
const SEASONAL_PESTS: Record<number, string[]> = {
  0: ['mice', 'deer'], // Jan
  1: ['aphids', 'mice'], // Feb
  2: ['aphids', 'slugs', 'snails'], // Mar
  3: ['aphids', 'flea-beetles', 'cabbage-moths'], // Apr
  4: ['aphids', 'cucumber-beetles', 'cabbage-loopers', 'flea-beetles'], // May
  5: ['japanese-beetles', 'squash-bugs', 'tomato-hornworms', 'mosquitoes'], // Jun
  6: ['japanese-beetles', 'mosquitoes', 'spider-mites', 'whiteflies'], // Jul
  7: ['whiteflies', 'spider-mites', 'squash-bugs', 'mosquitoes'], // Aug
  8: ['aphids', 'cabbage-loopers', 'rabbits'], // Sep
  9: ['rabbits', 'deer', 'mice'], // Oct
  10: ['deer', 'mice'], // Nov
  11: ['mice', 'deer'], // Dec
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
 * "Aphids are active around May in Zone 8a — consider planting marigold."
 */
export function seasonalTip(zone: string, date: Date = new Date()): SeasonalTip | undefined {
  const pestId = primarySeasonalPest(date);
  if (!pestId) return undefined;

  const label = pestLabel(pestId);
  const month = date.toLocaleString('en-US', { month: 'long' });
  const top = recommendForPest(pestId, { zone })[0];

  const message = top
    ? `${label} are active around ${month} in Zone ${zone} — consider planting ${top.name.toLowerCase()}.`
    : `${label} tend to be active around ${month} in Zone ${zone}.`;

  return { pestId, pestLabel: label, topCompanion: top?.name, message };
}
