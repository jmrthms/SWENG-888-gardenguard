import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Preferences } from '../models/types';
import { DEFAULT_ZONE } from '../data/zones';
import { DEFAULT_REGION } from '../data/regions';

const KEY = 'gardenguard:preferences:v1';

/** Device preferences (F8): region, zone, units, theme, notifications via AsyncStorage. */
export const DEFAULT_PREFERENCES: Preferences = {
  region: DEFAULT_REGION,
  zone: DEFAULT_ZONE,
  units: 'imperial',
  themeMode: 'system',
  notifications: true,
};

export async function loadPreferences(): Promise<Preferences> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    // Merge so new keys added in later versions fall back to defaults.
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: Preferences): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}
