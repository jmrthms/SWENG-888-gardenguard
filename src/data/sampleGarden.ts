import type { PlantInput } from '../storage/plantRepository';
import { CATALOG_BY_ID } from './plantsCatalog';
import { DEFAULT_CENTER } from './nurseries';
import { offsetCoord } from '../utils/geo';

/**
 * A small, realistic starter garden for demos and first-run screenshots — drawn
 * straight from the catalog so the data is consistent. Beds are scattered a
 * fraction of a mile around the default map center so they sit alongside the
 * sample nurseries on the map.
 */
function fromCatalog(id: string, locationLabel: string, north: number, east: number): PlantInput {
  const c = CATALOG_BY_ID.get(id);
  if (!c) throw new Error(`Unknown catalog plant: ${id}`);
  return {
    name: c.name,
    category: c.category,
    repels: [...c.repels],
    sun: c.sun,
    water: c.water,
    zoneMin: c.zoneMin,
    zoneMax: c.zoneMax,
    locationLabel,
    coordinates: offsetCoord(DEFAULT_CENTER, north, east),
    catalogId: c.id,
  };
}

export const SAMPLE_PLANTS: PlantInput[] = [
  fromCatalog('marigold', 'Front-yard bed', 0.4, 0.3),
  fromCatalog('lavender', 'Patio planter', -0.3, 0.5),
  fromCatalog('basil', 'Kitchen herb pots', 0.2, -0.4),
  fromCatalog('garlic', 'Raised vegetable bed', 0.6, 0.1),
];
