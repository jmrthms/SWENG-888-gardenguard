import React, { useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { useGarden } from '../context/GardenContext';
import { usePreferences } from '../context/PreferencesContext';
import { PestRow } from '../components/PestChips';
import { CATEGORY_META, SUN_META, WATER_META, zoneRangeLabel } from '../components/categoryMeta';
import { EmptyState } from '../components/EmptyState';
import { companionsForPlant, toPrefill } from '../data/recommendations';
import { pestLabel } from '../data/pests';
import { regionLabel } from '../data/regions';
import { zoneNumber } from '../data/zones';
import type { GardenScreenNav, PlantDetailRoute } from '../navigation/types';

function AttributeRow({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.attrRow}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
      <Text variant="bodyMedium" style={styles.attrLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {value}
      </Text>
    </View>
  );
}

export default function PlantDetailScreen() {
  const theme = useTheme();
  const nav = useNavigation<GardenScreenNav>();
  const route = useRoute<PlantDetailRoute>();
  const { getPlant, deletePlant } = useGarden();
  const { preferences } = usePreferences();

  const plant = getPlant(route.params.plantId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const userZone = zoneNumber(preferences.zone);
  const zoneFits = plant ? !Number.isNaN(userZone) && userZone >= plant.zoneMin && userZone <= plant.zoneMax : false;

  const companions = useMemo(
    () => (plant ? companionsForPlant(plant, preferences.region) : []),
    [plant, preferences.region],
  );

  useLayoutEffect(() => {
    nav.setOptions({
      title: plant?.name ?? 'Plant',
      headerRight: plant
        ? () => (
            <View style={styles.headerActions}>
              <IconButton
                icon="pencil"
                iconColor={theme.colors.onPrimary}
                size={22}
                accessibilityLabel="Edit plant"
                onPress={() => nav.navigate('AddEditPlant', { plantId: plant.id })}
              />
              <IconButton
                icon="trash-can-outline"
                iconColor={theme.colors.onPrimary}
                size={22}
                accessibilityLabel="Delete plant"
                onPress={() => setConfirmDelete(true)}
              />
            </View>
          )
        : undefined,
    });
  }, [nav, plant, theme.colors.onPrimary]);

  if (!plant) {
    return (
      <EmptyState
        icon="leaf-off"
        title="Plant not found"
        message="This plant may have been deleted."
        actionLabel="Back to My Garden"
        onAction={() => nav.navigate('MyGarden')}
      />
    );
  }

  const cat = CATEGORY_META[plant.category];

  const onDelete = async () => {
    setConfirmDelete(false);
    await deletePlant(plant.id);
    nav.goBack();
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scroll}
    >
      <Card mode="contained" style={styles.hero}>
        <Card.Content style={styles.heroContent}>
          <View style={[styles.heroIcon, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name={cat.icon} size={32} color={theme.colors.onPrimaryContainer} />
          </View>
          <View style={styles.flex}>
            <Text variant="headlineSmall" style={styles.name}>
              {plant.name}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {cat.label}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Pests to watch
          </Text>
          <PestRow pests={plant.pests} />
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.attrs}>
          <AttributeRow icon={SUN_META[plant.sun].icon} label="Sun" value={SUN_META[plant.sun].label} />
          <Divider />
          <AttributeRow icon={WATER_META[plant.water].icon} label="Water" value={WATER_META[plant.water].label} />
          <Divider />
          <AttributeRow
            icon="thermometer"
            label="Zone fit"
            value={`${zoneRangeLabel(plant.zoneMin, plant.zoneMax)}${
              zoneFits ? `  ✓ your ${preferences.zone}` : ''
            }`}
          />
          {(plant.locationLabel || plant.coordinates) && <Divider />}
          {(plant.locationLabel || plant.coordinates) && (
            <AttributeRow
              icon="map-marker-outline"
              label="Location"
              value={plant.locationLabel || 'Pinned on map'}
            />
          )}
        </Card.Content>
      </Card>

      {plant.notes && (
        <Card mode="contained" style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.cardTitle}>
              Notes
            </Text>
            <Text variant="bodyMedium">{plant.notes}</Text>
          </Card.Content>
        </Card>
      )}

      {plant.coordinates && (
        <Button
          mode="contained-tonal"
          icon="map"
          style={styles.mapBtn}
          onPress={() => nav.navigate('MapTab', { focusPlantId: plant.id })}
        >
          View on Map
        </Button>
      )}

      {companions.length > 0 && (
        <Card mode="contained" style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.cardTitle}>
              Companion suggestions
            </Text>
            <Text variant="bodySmall" style={[styles.subtle, { color: theme.colors.onSurfaceVariant }]}>
              Organic companions for the {regionLabel(preferences.region)} that repel this plant&apos;s pests
            </Text>
          </Card.Content>
          {companions.map((c) => (
            <List.Item
              key={c.id}
              title={c.name}
              description={`Repels ${c.repels.slice(0, 3).map(pestLabel).join(', ')}`}
              left={(props) => <List.Icon {...props} icon={CATEGORY_META[c.category].icon} color={theme.colors.primary} />}
              right={() => (
                <Button
                  compact
                  mode="text"
                  icon="plus"
                  onPress={() => nav.navigate('AddEditPlant', { prefill: toPrefill(c) })}
                >
                  Add
                </Button>
              )}
            />
          ))}
        </Card>
      )}

      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={styles.dialogTitle}>Delete {plant.name}?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This removes the plant from your garden. This action can&apos;t be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={onDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  headerActions: { flexDirection: 'row', marginRight: -8 },
  hero: { borderRadius: 16 },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '800' },
  card: { borderRadius: 16 },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
  attrs: { gap: 10 },
  attrRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  attrLabel: { width: 84, fontWeight: '600' },
  subtle: { marginTop: -4, marginBottom: 4 },
  mapBtn: { borderRadius: 12, alignSelf: 'flex-start' },
  dialogTitle: { textAlign: 'center' },
});
