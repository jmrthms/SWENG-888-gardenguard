import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GardenProvider } from '../context/GardenContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

/**
 * Top-level switch: unauthenticated users see the auth flow; authenticated users
 * get the main app, wrapped in GardenProvider so their plant list is available
 * to every screen. App-load/splash is handled upstream in App.tsx.
 */
export default function RootNavigator() {
  const { user } = useAuth();

  if (!user) return <AuthNavigator />;

  return (
    <GardenProvider>
      <MainNavigator />
    </GardenProvider>
  );
}
