import { describe, it, expect } from '@jest/globals';
import { distanceMiles, formatDistance, offsetCoord } from '../geo';

describe('distanceMiles', () => {
  it('is zero for the same point', () => {
    expect(distanceMiles({ latitude: 34, longitude: -81 }, { latitude: 34, longitude: -81 })).toBe(0);
  });

  it('approximates a known distance (NYC → Boston ≈ 190 mi)', () => {
    const d = distanceMiles(
      { latitude: 40.7128, longitude: -74.006 },
      { latitude: 42.3601, longitude: -71.0589 },
    );
    expect(d).toBeGreaterThan(180);
    expect(d).toBeLessThan(200);
  });
});

describe('formatDistance', () => {
  it('formats near and far distances', () => {
    expect(formatDistance(0.05)).toBe('< 0.1 mi');
    expect(formatDistance(0.1)).toBe('0.1 mi');
    expect(formatDistance(3.24)).toBe('3.2 mi');
  });
});

describe('offsetCoord', () => {
  it('moves ~1 degree latitude per 69 miles north', () => {
    const moved = offsetCoord({ latitude: 34, longitude: -81 }, 69, 0);
    expect(moved.latitude).toBeCloseTo(35, 2);
    expect(moved.longitude).toBeCloseTo(-81, 5); // no eastward move
  });

  it('moves east for positive eastMiles', () => {
    const moved = offsetCoord({ latitude: 34, longitude: -81 }, 0, 10);
    expect(moved.longitude).toBeGreaterThan(-81);
    expect(moved.latitude).toBeCloseTo(34, 5);
  });
});
