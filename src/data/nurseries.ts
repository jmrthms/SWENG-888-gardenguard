import type { Coordinates, Nursery } from '../models/types';
import { offsetCoord } from '../utils/geo';

/**
 * Default map center when the user hasn't shared a location yet. Columbia, SC —
 * the home region of GardenGuard's primary persona ("Anita, the Organic
 * Veteran"), and a Zone 8a area.
 */
export const DEFAULT_CENTER: Coordinates = { latitude: 34.0007, longitude: -81.0348 };

/**
 * Sample nurseries that stock organic companion plants. Stored as offsets (in
 * miles, north/east) from a center so the markers always appear "near" the user
 * for the demo. In production these would come from a places API or curated DB.
 */
const SAMPLE_NURSERIES: { id: string; name: string; north: number; east: number; note: string }[] = [
  { id: 'n1', name: 'GreenThumb Organic Co.', north: 1.6, east: 2.1, note: 'Heirloom seeds & companion-plant starts' },
  { id: 'n2', name: 'Marigold Lane Nursery', north: -2.3, east: 1.2, note: 'Pollinator-friendly flowers & herbs' },
  { id: 'n3', name: 'Rooted Garden Center', north: 0.8, east: -2.7, note: 'Native plants & organic soil' },
  { id: 'n4', name: 'Hardy Herb Farm', north: -1.4, east: -1.1, note: 'Culinary & pest-repelling herbs' },
  { id: 'n5', name: 'Sunnyside Plant Market', north: 2.6, east: -0.6, note: 'Vegetable starts & raised-bed supplies' },
];

/** Build nursery markers scattered around a given center (US-6). */
export function nearbyNurseries(center: Coordinates = DEFAULT_CENTER): Nursery[] {
  return SAMPLE_NURSERIES.map((n) => ({
    id: n.id,
    name: n.name,
    note: n.note,
    coordinates: offsetCoord(center, n.north, n.east),
  }));
}
