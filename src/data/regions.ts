import type { Coordinates, RegionId } from '../models/types';

export interface RegionMeta {
  id: RegionId;
  label: string;
  /** One-line climate description shown under the picker. */
  blurb: string;
  /** Representative states, for orientation. */
  states: string;
  /** A sensible default USDA zone for the region (secondary context). */
  defaultZone: string;
  /** Map center used before the user shares a location. */
  center: Coordinates;
}

/**
 * The six macro-regions the GardenGuard dataset is organized around. These are
 * the primary geography for the catalog and recommendations. They are climate
 * macro-regions, not USDA zones — one region spans several zones — so we keep
 * zone only as optional secondary context.
 */
export const REGIONS: RegionMeta[] = [
  {
    id: 'northeast',
    label: 'Northeast',
    blurb: 'Cold winters, humid summers — roughly USDA zones 3–7.',
    states: 'ME · NH · VT · MA · NY · PA · NJ · CT · RI',
    defaultZone: '6a',
    center: { latitude: 42.3601, longitude: -71.0589 },
  },
  {
    id: 'southeast',
    label: 'Southeast',
    blurb: 'Warm, humid, with a long growing season — roughly zones 6–10.',
    states: 'VA · NC · SC · GA · FL · TN · AL · MS · KY · WV',
    defaultZone: '8a',
    center: { latitude: 34.0007, longitude: -81.0348 },
  },
  {
    id: 'north_central',
    label: 'North Central (Midwest)',
    blurb: 'Continental climate with cold winters — roughly zones 3–6.',
    states: 'OH · MI · IN · IL · WI · MN · IA · MO · ND · SD · NE · KS',
    defaultZone: '5a',
    center: { latitude: 41.8781, longitude: -87.6298 },
  },
  {
    id: 'south_central',
    label: 'South Central',
    blurb: 'Hot summers and mild winters — roughly zones 7–9.',
    states: 'TX · OK · AR · LA',
    defaultZone: '8b',
    center: { latitude: 30.2672, longitude: -97.7431 },
  },
  {
    id: 'northwest',
    label: 'Pacific Northwest',
    blurb: 'Mild, wet winters and dry summers — roughly zones 5–9.',
    states: 'WA · OR · ID · MT',
    defaultZone: '8a',
    center: { latitude: 45.5152, longitude: -122.6784 },
  },
  {
    id: 'southwest',
    label: 'Southwest',
    blurb: 'Arid and hot — desert-adapted plants thrive; roughly zones 5–10.',
    states: 'CA · NV · AZ · NM · UT · CO',
    defaultZone: '9a',
    center: { latitude: 33.4484, longitude: -112.074 },
  },
];

export const REGIONS_BY_ID = new Map<RegionId, RegionMeta>(REGIONS.map((r) => [r.id, r]));

/** Primary persona (Anita, South Carolina) lives in the Southeast. */
export const DEFAULT_REGION: RegionId = 'southeast';

export function regionLabel(id: RegionId): string {
  return REGIONS_BY_ID.get(id)?.label ?? id;
}

export function regionMeta(id: RegionId): RegionMeta {
  return REGIONS_BY_ID.get(id) ?? REGIONS[0];
}
