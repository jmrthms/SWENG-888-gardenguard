import 'react-native-get-random-values'; // polyfill crypto.getRandomValues for uuid()
import React from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

// Render React Native Paper's string-named icons through @expo/vector-icons
// (SDK 56 no longer bundles a default icon library for Paper).
const paperSettings = {
  icon: (props: { name: string; color?: string; size: number }) => (
    <MaterialCommunityIcons
      name={props.name as keyof typeof MaterialCommunityIcons.glyphMap}
      color={props.color}
      size={props.size}
    />
  ),
};
import { NavigationContainer } from '@react-navigation/native';
import { PreferencesProvider, usePreferences } from './src/context/PreferencesContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { darkTheme, lightTheme, navDarkTheme, navLightTheme } from './src/theme/theme';
import { configureNotificationHandler } from './src/storage/notifications';

/** Applies the effective theme and shows the splash until prefs + session load. */
// Surface scheduled local notifications while the app is foregrounded.
configureNotificationHandler();

function ThemedApp() {
  const systemScheme = useColorScheme();
  const { preferences, loading: prefsLoading } = usePreferences();
  const { loading: authLoading } = useAuth();

  const mode = preferences.themeMode === 'system' ? systemScheme ?? 'light' : preferences.themeMode;
  const isDark = mode === 'dark';
  const paperTheme = isDark ? darkTheme : lightTheme;
  const navTheme = isDark ? navDarkTheme : navLightTheme;
  const booting = prefsLoading || authLoading;

  return (
    <PaperProvider theme={paperTheme} settings={paperSettings}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {booting ? (
        <SplashScreen />
      ) : (
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      )}
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
