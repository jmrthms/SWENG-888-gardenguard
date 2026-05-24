/** USDA Plant Hardiness Zones 1a–13b (USDA ARS 2023 map). */

export interface ZoneOption {
  value: string; // "8a"
  label: string; // "Zone 8a (10 to 15°F)"
}

const ZONE_TEMPS: Record<number, [string, string]> = {
  1: ['-60 to -55°F', '-55 to -50°F'],
  2: ['-50 to -45°F', '-45 to -40°F'],
  3: ['-40 to -35°F', '-35 to -30°F'],
  4: ['-30 to -25°F', '-25 to -20°F'],
  5: ['-20 to -15°F', '-15 to -10°F'],
  6: ['-10 to -5°F', '-5 to 0°F'],
  7: ['0 to 5°F', '5 to 10°F'],
  8: ['10 to 15°F', '15 to 20°F'],
  9: ['20 to 25°F', '25 to 30°F'],
  10: ['30 to 35°F', '35 to 40°F'],
  11: ['40 to 45°F', '45 to 50°F'],
  12: ['50 to 55°F', '55 to 60°F'],
  13: ['60 to 65°F', '65 to 70°F'],
};

export const ZONES: ZoneOption[] = Object.keys(ZONE_TEMPS)
  .map(Number)
  .sort((a, b) => a - b)
  .flatMap((n) =>
    (['a', 'b'] as const).map((half) => ({
      value: `${n}${half}`,
      label: `Zone ${n}${half} (${ZONE_TEMPS[n][half === 'a' ? 0 : 1]})`,
    })),
  );

export const DEFAULT_ZONE = '8a';

/** Numeric part of a zone string, e.g. "8a" -> 8. Returns NaN if unparseable. */
export function zoneNumber(zone: string | undefined): number {
  if (!zone) return NaN;
  const m = /^(\d+)/.exec(zone.trim());
  return m ? parseInt(m[1], 10) : NaN;
}
