import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Text, useTheme } from 'react-native-paper';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Friendly empty/placeholder state with an optional call to action. */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  actionIcon = 'plus',
  secondaryActionLabel,
  onSecondaryAction,
  secondaryIcon,
}: {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: IconName;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryIcon?: IconName;
}) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={72} color={theme.colors.primary} style={styles.icon} />
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button mode="contained" icon={actionIcon} onPress={onAction} style={styles.action}>
          {actionLabel}
        </Button>
      )}
      {secondaryActionLabel && onSecondaryAction && (
        <Button mode="text" icon={secondaryIcon} onPress={onSecondaryAction}>
          {secondaryActionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  icon: { opacity: 0.9 },
  title: { fontWeight: '700', textAlign: 'center' },
  message: { textAlign: 'center', lineHeight: 20 },
  action: { marginTop: 12 },
});
