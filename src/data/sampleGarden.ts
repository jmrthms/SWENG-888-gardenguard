import type { PlantInput } from '../storage/plantRepository';
import { catalogById } from './plantsCatalog';
import { toPrefill } from './recommendations';
import { DEFAULT_CENTER } from './nurseries';
import { offsetCoord } from '../utils/geo';

/**
 * A small, realistic starter garden for demos and first-run screenshots — drawn
 * straight from the regional catalog so the data is consistent. Beds are
 * scattered a fraction of a mile around the default map center so they sit
 * alongside the sample nurseries on the map.
 */
function fromCatalog(id: string, locationLabel: string, north: number, east: number): PlantInput {
  const c = catalogById(id);
  if (!c) throw new Error(`Unknown catalog plant: ${id}`);
  const pf = toPrefill(c);
  return {
    name: c.name,
    category: c.category,
    pests: c.pests,
    sun: pf.sun ?? 'full',
    water: pf.water ?? 'moderate',
    zoneMin: pf.zoneMin ?? 2,
    zoneMax: pf.zoneMax ?? 11,
    locationLabel,
    coordinates: offsetCoord(DEFAULT_CENTER, north, east),
    catalogId: c.id,
  };
}

export const SAMPLE_PLANTS: PlantInput[] = [
  fromCatalog('tomato', 'Raised vegetable bed', 0.6, 0.1),
  fromCatalog('marigold', 'Front-yard border', 0.4, 0.3),
  fromCatalog('basil', 'Kitchen herb pots', 0.2, -0.4),
  fromCatalog('black-eyed-susan', 'Pollinator corner', -0.3, 0.5),
];
