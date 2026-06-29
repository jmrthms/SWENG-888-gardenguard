import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, useTheme } from 'react-native-paper';
import type { Plant } from '../models/types';
import { pestLabel } from '../data/pests';
import { CATEGORY_META } from './categoryMeta';

/** A single row in the My Garden list (US-3). */
export function PlantListItem({
  plant,
  distanceLabel,
  onPress,
}: {
  plant: Plant;
  distanceLabel?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const cat = CATEGORY_META[plant.category];
  const pestsText =
    plant.pests.length > 0
      ? plant.pests.slice(0, 3).map(pestLabel).join(', ') +
        (plant.pests.length > 3 ? `, +${plant.pests.length - 3}` : '')
      : 'No pests tagged';

  const a11yLabel =
    `${plant.name}, ${cat.label}. Pests to watch: ${pestsText}.` +
    (plant.locationLabel ? ` Location ${plant.locationLabel}.` : '') +
    (distanceLabel ? ` ${distanceLabel} away.` : '');

  return (
    <Card
      mode="contained"
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint="Opens plant details"
    >
      <Card.Content style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name={cat.icon} size={24} color={theme.colors.onPrimaryContainer} />
        </View>
        <View style={styles.body}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
            {plant.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
            Pests: {pestsText}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
            {cat.label}
            {plant.locationLabel ? ` · ${plant.locationLabel}` : ''}
            {distanceLabel ? ` · ${distanceLabel}` : ''}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
  name: { fontWeight: '700' },
});
