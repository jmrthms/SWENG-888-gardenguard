/** Core domain models for GardenGuard. */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type PlantCategory = 'flower' | 'vegetable' | 'herb';
export type Sun = 'full' | 'partial' | 'shade';
export type Water = 'low' | 'moderate' | 'high';

/**
 * The six macro-regions the curated dataset is organized around. This is the
 * primary geography that drives the catalog, recommendations, and filtering —
 * USDA hardiness zone is kept only as optional secondary context.
 */
export type RegionId =
  | 'northeast'
  | 'northwest'
  | 'north_central'
  | 'south_central'
  | 'southeast'
  | 'southwest';

/** A pest, critter, or disease a plant can be affected by. */
export interface Pest {
  id: string;
  label: string;
  type: 'insect' | 'critter' | 'disease';
}

/**
 * A growable plant in the curated regional knowledge base — what a gardener can
 * add to their garden. Distinct from a {@link Plant}, which is an instance the
 * user has actually added. Built from the dataset (see plantsCatalog.ts).
 */
export interface CatalogPlant {
  id: string;
  name: string;
  category: PlantCategory;
  /** Regions this plant grows in (dataset-derived). */
  regions: RegionId[];
  /** Pest ids that commonly affect this plant in the garden. */
  pests: string[];
}

/**
 * A companion plant the dataset prescribes as an organic remedy — its scent,
 * roots, or blooms repel one or more pests. Carries the curated growing detail
 * shown on recommendation cards.
 */
export interface Companion {
  id: string;
  name: string;
  category: PlantCategory;
  sun: Sun;
  water: Water;
  /** USDA hardiness zone range this companion tolerates. */
  zoneMin: number;
  zoneMax: number;
  /** Works well in pots / on a balcony (for small-space growers). */
  containerFriendly: boolean;
  /** Short, citable rationale shown to the user. */
  note: string;
  /** Pest ids this companion repels (derived from the dataset's remedy map). */
  repels: string[];
}

/** A plant the user has added to their own garden. */
export interface Plant {
  id: string;
  name: string;
  category: PlantCategory;
  /** Pest ids to watch for this plant (the dataset's pest associations). */
  pests: string[];
  sun: Sun;
  water: Water;
  zoneMin: number;
  zoneMax: number;
  /** Free-text bed / site label, e.g. "Front-yard bed". */
  locationLabel: string;
  /** Optional geocoded site for the map (US-6) and "near me" filter (US-7). */
  coordinates?: Coordinates;
  notes?: string;
  /** Source catalog plant, if added from the catalog or a recommendation. */
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

/** Subset of plant fields used to pre-fill the Add Plant form from the catalog. */
export type PlantPrefill = Partial<
  Pick<Plant, 'name' | 'category' | 'pests' | 'sun' | 'water' | 'zoneMin' | 'zoneMax' | 'catalogId'>
>;

export type Units = 'imperial' | 'metric';
export type ThemeMode = 'light' | 'dark' | 'system';

/** Device-stored preferences (AsyncStorage), applied app-wide (F8). */
export interface Preferences {
  /** Primary geography — keys the catalog & recommendations. */
  region: RegionId;
  zone: string; // optional secondary context, e.g. "8a"
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
