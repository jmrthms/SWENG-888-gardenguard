import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, useTheme } from 'react-native-paper';
import { APP_NAME, TAGLINE } from '../theme/theme';

/** GardenGuard wordmark + tagline, used on Splash and the auth screens. */
export function Logo({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="shield-sun"
        size={compact ? 40 : 64}
        color={theme.colors.primary}
      />
      <Text variant={compact ? 'headlineSmall' : 'displaySmall'} style={[styles.name, { color: theme.colors.primary }]}>
        {APP_NAME}
      </Text>
      {!compact && (
        <Text variant="titleSmall" style={[styles.tagline, { color: theme.colors.secondary }]}>
          {TAGLINE}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  name: { fontWeight: '800', letterSpacing: 0.5 },
  tagline: { fontStyle: 'italic' },
});
