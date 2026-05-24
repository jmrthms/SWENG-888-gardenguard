import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { PlantCategory, Sun, Water } from '../models/types';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const CATEGORY_META: Record<PlantCategory, { label: string; icon: IconName }> = {
  flower: { label: 'Flower', icon: 'flower' },
  vegetable: { label: 'Vegetable', icon: 'carrot' },
  herb: { label: 'Herb', icon: 'leaf' },
};

export const SUN_META: Record<Sun, { label: string; icon: IconName }> = {
  full: { label: 'Full sun', icon: 'white-balance-sunny' },
  partial: { label: 'Partial sun', icon: 'weather-partly-cloudy' },
  shade: { label: 'Shade', icon: 'weather-cloudy' },
};

export const WATER_META: Record<Water, { label: string; icon: IconName }> = {
  low: { label: 'Low water', icon: 'water-outline' },
  moderate: { label: 'Moderate water', icon: 'water' },
  high: { label: 'High water', icon: 'water-plus' },
};

export const zoneRangeLabel = (min: number, max: number): string => `Zones ${min}–${max}`;
