/** Core domain models for GardenGuard. */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type PlantCategory = 'flower' | 'vegetable' | 'herb';
export type Sun = 'full' | 'partial' | 'shade';
export type Water = 'low' | 'moderate' | 'high';

/** A pest or critter a plant can repel. */
export interface Pest {
  id: string;
  label: string;
  type: 'insect' | 'critter';
}

/**
 * A plant in the curated knowledge base — what GardenGuard can recommend.
 * Distinct from a {@link Plant}, which is an instance the user has added to
 * their own garden.
 */
export interface CatalogPlant {
  id: string;
  name: string;
  category: PlantCategory;
  /** Pest ids this plant repels or deters. */
  repels: string[];
  sun: Sun;
  water: Water;
  /** USDA hardiness zone range this plant tolerates. */
  zoneMin: number;
  zoneMax: number;
  /** Works well in pots / on a balcony (for small-space growers). */
  containerFriendly: boolean;
  /** Short, citable rationale shown to the user. */
  note: string;
  /** Catalog ids of plants this one pairs well with. */
  goodWith?: string[];
}

/** A plant the user has added to their own garden. */
export interface Plant {
  id: string;
  name: string;
  category: PlantCategory;
  repels: string[];
  sun: Sun;
  water: Water;
  zoneMin: number;
  zoneMax: number;
  /** Free-text bed / site label, e.g. "Front-yard bed". */
  locationLabel: string;
  /** Optional geocoded site for the map (US-6) and "near me" filter (US-7). */
  coordinates?: Coordinates;
  notes?: string;
  /** Source catalog plant, if added from a recommendation. */
  catalogId?: string;
  createdAt: number;
  updatedAt: number;
}

/** A nursery that stocks recommended companion plants (map markers, US-6). */
export interface Nursery {
  id: string;
  name: string;
  coordinates: Coordinates;
  note?: string;
}

/** Subset of plant fields used to pre-fill the Add Plant form from a recommendation. */
export type PlantPrefill = Partial<
  Pick<Plant, 'name' | 'category' | 'repels' | 'sun' | 'water' | 'zoneMin' | 'zoneMax' | 'catalogId'>
>;

export type Units = 'imperial' | 'metric';
export type ThemeMode = 'light' | 'dark' | 'system';

/** Device-stored preferences (AsyncStorage), applied app-wide (F8). */
export interface Preferences {
  zone: string; // e.g. "8a"
  units: Units;
  themeMode: ThemeMode;
  notifications: boolean;
}

/** Authenticated user. Local stub today; AWS Cognito identity later. */
export interface User {
  id: string;
  name: string;
  email: string;
}
