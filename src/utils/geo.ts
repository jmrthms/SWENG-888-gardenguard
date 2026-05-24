import type { Coordinates } from '../models/types';

const EARTH_RADIUS_MI = 3958.8;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance between two coordinates, in miles (Haversine). */
export function distanceMiles(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Human-friendly distance label, e.g. "0.4 mi" or "3.2 mi". */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi';
  return `${miles.toFixed(1)} mi`;
}

/**
 * Offset a coordinate by a rough number of miles (used to scatter demo nursery
 * markers around the user). ~69 mi per degree latitude.
 */
export function offsetCoord(
  origin: Coordinates,
  northMiles: number,
  eastMiles: number,
): Coordinates {
  const dLat = northMiles / 69;
  const dLng = eastMiles / (69 * Math.cos(toRad(origin.latitude)) || 1);
  return {
    latitude: origin.latitude + dLat,
    longitude: origin.longitude + dLng,
  };
}
