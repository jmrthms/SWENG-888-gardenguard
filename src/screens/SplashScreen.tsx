import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { Logo } from '../components/Logo';

/** Shown while preferences and the session are loading (App.tsx bootstrap). */
export default function SplashScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Logo />
      <ActivityIndicator style={styles.spinner} color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  spinner: { marginTop: 28 },
});
