import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { brand } from './colors';

/**
 * React Native Paper (Material Design 3) themes for GardenGuard. We spread the
 * stock MD3 themes so every token is populated, then override the brand-defining
 * colors. The matching React Navigation themes keep the nav container, headers,
 * and tab bar in sync with Paper.
 */

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.green800,
    onPrimary: brand.white,
    primaryContainer: brand.green100,
    onPrimaryContainer: brand.green900,
    secondary: brand.olive,
    onSecondary: brand.white,
    secondaryContainer: '#E4ECD2',
    onSecondaryContainer: brand.oliveDark,
    tertiary: brand.bark,
    onTertiary: brand.white,
    tertiaryContainer: '#EFE6E1',
    onTertiaryContainer: brand.soil,
    background: brand.green050,
    onBackground: brand.black,
    surface: brand.white,
    surfaceVariant: '#E7EFE7',
    onSurfaceVariant: '#43504399',
    error: brand.danger,
    outline: '#7A867A',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.green500,
    onPrimary: '#06270B',
    primaryContainer: brand.oliveDark,
    onPrimaryContainer: '#D7F0D9',
    secondary: '#AFC58A',
    onSecondary: '#1E2A0E',
    secondaryContainer: '#3A4A22',
    onSecondaryContainer: '#D9E8BE',
    tertiary: brand.clay,
    onTertiary: '#2A1B15',
    background: '#0F140F',
    onBackground: '#E4EAE1',
    surface: '#161D16',
    surfaceVariant: '#3F4A3F',
    onSurfaceVariant: '#C2CBBF',
    error: '#FF6F60',
    outline: '#8C968B',
  },
};

export const navLightTheme: NavTheme = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.onSurface,
    border: lightTheme.colors.outline,
    notification: lightTheme.colors.error,
  },
};

export const navDarkTheme: NavTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: darkTheme.colors.primary,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.onSurface,
    border: darkTheme.colors.outline,
    notification: darkTheme.colors.error,
  },
};

export const TAGLINE = 'Grow naturally. Defend organically.';
export const APP_NAME = 'GardenGuard';
