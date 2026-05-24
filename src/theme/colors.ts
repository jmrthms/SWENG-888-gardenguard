/**
 * GardenGuard brand palette.
 *
 * Forest greens for trust + nature, an olive secondary, and an earthy brown
 * tertiary. Pulled from the Conception & Planning wordmark ("GardenGuard —
 * Grow naturally. Defend organically.").
 */
export const brand = {
  // Primary greens
  green900: '#1B5E20', // deepest — splash / headers
  green800: '#2E7D32', // primary
  green700: '#388E3C',
  green600: '#43A047', // tagline / accents
  green500: '#4CAF50',
  green100: '#E6F4EA', // tinted surfaces (light)
  green050: '#F1F8F2',

  // Earthy neutrals
  soil: '#5D4037', // brown
  bark: '#8D6E63',
  clay: '#A1887F',

  // Olive / herb secondary
  olive: '#6D8B3A',
  oliveDark: '#4F6B27',

  // Functional
  danger: '#C62828', // destructive (delete, logout)
  warning: '#F9A825',
  info: '#0277BD',

  white: '#FFFFFF',
  black: '#101510',
} as const;

/** Marker colors used on the map. */
export const markerColors = {
  bed: brand.green700, // user's garden beds
  nursery: brand.soil, // nurseries that stock companions
} as const;
