import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  Menu,
  Searchbar,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useGarden } from '../context/GardenContext';
import { usePreferences } from '../context/PreferencesContext';
import { PlantListItem } from '../components/PlantListItem';
import { EmptyState } from '../components/EmptyState';
import { pestLabel } from '../data/pests';
import { zoneNumber } from '../data/zones';
import { distanceMiles, formatDistance } from '../utils/geo';
import { seasonalTip } from '../data/seasons';
import type { Coordinates, Plant } from '../models/types';
import type { GardenScreenNav } from '../navigation/types';

type FilterMode = 'all' | 'zone' | 'near';
const NEAR_RADIUS_MI = 50;

export default function MyGardenScreen() {
  const theme = useTheme();
  const nav = useNavigation<GardenScreenNav>();
  const { plants, loading } = useGarden();
  const { preferences } = usePreferences();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [filterMenu, setFilterMenu] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [snack, setSnack] = useState('');

  // Live zone indicator in the header (matches the wireframe "Zone 8a").
  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => nav.navigate('SettingsTab')}
          style={styles.zoneChip}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Current zone ${preferences.zone}. Opens settings.`}
        >
          <MaterialCommunityIcons name="map-marker-radius" size={16} color={theme.colors.onPrimary} />
          <Text style={[styles.zoneText, { color: theme.colors.onPrimary }]}>Zone {preferences.zone}</Text>
        </Pressable>
      ),
    });
  }, [nav, preferences.zone, theme.colors.onPrimary]);

  const requestNearMe = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setSnack('Location permission denied — showing all plants.');
        setFilter('all');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch {
      setSnack('Could not get your location — showing all plants.');
      setFilter('all');
    } finally {
      setLocating(false);
    }
  }, []);

  const chooseFilter = (mode: FilterMode) => {
    setFilterMenu(false);
    setFilter(mode);
    if (mode === 'near' && !location) void requestNearMe();
  };

  const seasonal = useMemo(() => seasonalTip(preferences.zone), [preferences.zone]);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    const userZone = zoneNumber(preferences.zone);

    let rows: { plant: Plant; distance?: number }[] = plants.map((plant) => ({ plant }));

    if (q) {
      rows = rows.filter(
        ({ plant }) =>
          plant.name.toLowerCase().includes(q) ||
          plant.locationLabel.toLowerCase().includes(q) ||
          plant.repels.some((r) => pestLabel(r).toLowerCase().includes(q)),
      );
    }

    if (filter === 'zone' && !Number.isNaN(userZone)) {
      rows = rows.filter(({ plant }) => userZone >= plant.zoneMin && userZone <= plant.zoneMax);
    }

    if (filter === 'near' && location) {
      rows = rows
        .filter(({ plant }) => plant.coordinates)
        .map(({ plant }) => ({ plant, distance: distanceMiles(location, plant.coordinates!) }))
        .filter((r) => (r.distance ?? Infinity) <= NEAR_RADIUS_MI)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }

    return rows;
  }, [plants, query, filter, location, preferences.zone]);

  const filterLabel =
    filter === 'all' ? 'All plants' : filter === 'zone' ? `My zone (${preferences.zone})` : 'Near me';

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.controls}>
        {seasonal && (
          <Card
            mode="contained"
            style={[styles.seasonCard, { backgroundColor: theme.colors.primaryContainer }]}
            accessible
            accessibilityLabel={`In season now. ${seasonal.message}`}
          >
            <Card.Content style={styles.seasonContent}>
              <MaterialCommunityIcons name="calendar-alert" size={22} color={theme.colors.onPrimaryContainer} />
              <View style={styles.flexCol}>
                <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
                  In season now
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                  {seasonal.message}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                compact
                textColor={theme.colors.onPrimaryContainer}
                onPress={() => nav.navigate('RecommendationsTab', { pestId: seasonal.pestId })}
                accessibilityHint="Opens organic companion recommendations for this pest"
              >
                See companions
              </Button>
            </Card.Actions>
          </Card>
        )}
        <Searchbar
          placeholder="Search plants or pests"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          inputStyle={styles.searchInput}
        />
        <View style={styles.filterRow}>
          <Menu
            visible={filterMenu}
            onDismiss={() => setFilterMenu(false)}
            anchor={
              <Chip
                icon="filter-variant"
                onPress={() => setFilterMenu(true)}
                mode={filter === 'all' ? 'outlined' : 'flat'}
                selected={filter !== 'all'}
                closeIcon="menu-down"
                onClose={() => setFilterMenu(true)}
              >
                {filterLabel}
              </Chip>
            }
          >
            <Menu.Item onPress={() => chooseFilter('all')} title="All plants" leadingIcon="format-list-bulleted" />
            <Menu.Item onPress={() => chooseFilter('zone')} title={`My zone (${preferences.zone})`} leadingIcon="map-marker-radius" />
            <Menu.Item onPress={() => chooseFilter('near')} title="Near me" leadingIcon="crosshairs-gps" />
          </Menu>
          {locating && <ActivityIndicator size={18} style={styles.locating} color={theme.colors.primary} />}
          <View style={styles.spacer} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {data.length} {data.length === 1 ? 'plant' : 'plants'}
          </Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.plant.id}
        renderItem={({ item }) => (
          <PlantListItem
            plant={item.plant}
            distanceLabel={item.distance != null ? formatDistance(item.distance) : undefined}
            onPress={() => nav.navigate('PlantDetail', { plantId: item.plant.id })}
          />
        )}
        contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          plants.length === 0 ? (
            <EmptyState
              icon="sprout-outline"
              title="Your garden is empty"
              message="Add the plants you grow and tag the pests they fend off — or get organic companion recommendations for your zone."
              actionLabel="Add your first plant"
              onAction={() => nav.navigate('AddEditPlant')}
            />
          ) : (
            <EmptyState
              icon="magnify"
              title="No matches"
              message={
                filter === 'near'
                  ? 'No plants with a saved location are within 50 miles. Add a location to a plant, or change the filter.'
                  : 'No plants match your search or filter. Try clearing them.'
              }
              actionLabel="Clear filters"
              onAction={() => {
                setQuery('');
                setFilter('all');
              }}
            />
          )
        }
      />

      <FAB
        icon="plus"
        label="Add Plant"
        style={styles.fab}
        onPress={() => nav.navigate('AddEditPlant')}
        accessibilityLabel="Add a plant to your garden"
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={4000}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controls: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 10 },
  seasonCard: { borderRadius: 14 },
  seasonContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flexCol: { flex: 1 },
  search: { borderRadius: 12 },
  searchInput: { minHeight: 0 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locating: { marginLeft: 4 },
  spacer: { flex: 1 },
  zoneChip: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 },
  zoneText: { fontWeight: '600', fontSize: 14 },
  listContent: { paddingTop: 4, paddingBottom: 96 },
  emptyContainer: { flexGrow: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
