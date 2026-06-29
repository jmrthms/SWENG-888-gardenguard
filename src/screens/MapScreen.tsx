import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Callout, Marker, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Card, Chip, List, Snackbar, Text, useTheme } from 'react-native-paper';
import { useGarden } from '../context/GardenContext';
import { usePreferences } from '../context/PreferencesContext';
import { EmptyState } from '../components/EmptyState';
import { pestLabel } from '../data/pests';
import { nearbyNurseries } from '../data/nurseries';
import { regionMeta } from '../data/regions';
import { distanceMiles } from '../utils/geo';
import { markerColors } from '../theme/colors';
import type { Coordinates } from '../models/types';
import type { MapTabRoute, TabScreenNav } from '../navigation/types';

const DELTA = 0.12;
const NEAR_RADIUS_MI = 50;
const mapsSupported = Platform.OS !== 'web';

export default function MapScreen() {
  const theme = useTheme();
  const nav = useNavigation<TabScreenNav>();
  const route = useRoute<MapTabRoute>();
  const { plants } = useGarden();
  const { preferences } = usePreferences();

  const focusPlantId = route.params?.focusPlantId;
  const mapRef = useRef<MapView>(null);
  const [userLoc, setUserLoc] = useState<Coordinates | null>(null);
  const [nearOnly, setNearOnly] = useState(false);
  const [snack, setSnack] = useState('');

  const focusPlant = focusPlantId ? plants.find((p) => p.id === focusPlantId) : undefined;
  const bedPlants = useMemo(() => plants.filter((p) => p.coordinates), [plants]);

  const center: Coordinates =
    focusPlant?.coordinates ?? userLoc ?? bedPlants[0]?.coordinates ?? regionMeta(preferences.region).center;
  const nurseries = useMemo(() => nearbyNurseries(center), [center.latitude, center.longitude]);

  const visibleBeds = useMemo(() => {
    if (nearOnly && userLoc) {
      return bedPlants.filter((p) => p.coordinates && distanceMiles(userLoc, p.coordinates) <= NEAR_RADIUS_MI);
    }
    return bedPlants;
  }, [bedPlants, nearOnly, userLoc]);

  const initialRegion: Region = {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
  };

  // Recenter when arriving via "View on Map" from a plant.
  useEffect(() => {
    if (focusPlant?.coordinates && mapRef.current) {
      mapRef.current.animateToRegion(
        { ...focusPlant.coordinates, latitudeDelta: DELTA / 2, longitudeDelta: DELTA / 2 },
        600,
      );
    }
  }, [focusPlant?.coordinates?.latitude, focusPlant?.coordinates?.longitude]);

  const ensureLocation = async (): Promise<Coordinates | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setSnack('Location permission denied.');
      return null;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    setUserLoc(loc);
    return loc;
  };

  const recenterOnMe = async () => {
    const loc = userLoc ?? (await ensureLocation());
    if (loc && mapRef.current) {
      mapRef.current.animateToRegion({ ...loc, latitudeDelta: DELTA, longitudeDelta: DELTA }, 600);
    }
  };

  const toggleNear = async () => {
    const next = !nearOnly;
    setNearOnly(next);
    // If we can't get a location, don't leave the chip stuck "on" while showing everything.
    if (next && !userLoc) {
      const loc = await ensureLocation();
      if (!loc) setNearOnly(false);
    }
  };

  // Web is out of scope (no native map module) — show a readable marker list.
  if (!mapsSupported) {
    return (
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.fallback}>
        <Text variant="titleMedium" style={styles.fallbackTitle}>
          Garden beds
        </Text>
        {visibleBeds.length === 0 && <Text variant="bodyMedium">No plants have a saved location yet.</Text>}
        {visibleBeds.map((p) => (
          <List.Item
            key={p.id}
            title={p.name}
            description={p.locationLabel || 'Pinned location'}
            left={(props) => <List.Icon {...props} icon="map-marker" color={markerColors.bed} />}
            onPress={() => nav.navigate('GardenTab', { screen: 'PlantDetail', params: { plantId: p.id } })}
          />
        ))}
        <Text variant="titleMedium" style={styles.fallbackTitle}>
          Nearby nurseries
        </Text>
        {nurseries.map((n) => (
          <List.Item
            key={n.id}
            title={n.name}
            description={n.note}
            left={(props) => <List.Icon {...props} icon="storefront" color={markerColors.nursery} />}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.flex}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation={!!userLoc}>
        {visibleBeds.map((p) => (
          <Marker
            key={p.id}
            coordinate={p.coordinates!}
            pinColor={markerColors.bed}
            title={p.name}
            description={p.pests.length ? `Pests: ${p.pests.slice(0, 3).map(pestLabel).join(', ')}` : undefined}
          >
            <Callout onPress={() => nav.navigate('GardenTab', { screen: 'PlantDetail', params: { plantId: p.id } })}>
              <View style={styles.callout}>
                <Text variant="titleSmall">{p.name}</Text>
                <Text variant="bodySmall">{p.locationLabel || 'Garden bed'}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                  Tap for details ›
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {nurseries.map((n) => (
          <Marker key={n.id} coordinate={n.coordinates} pinColor={markerColors.nursery} title={n.name} description={n.note}>
            <Callout>
              <View style={styles.callout}>
                <Text variant="titleSmall">{n.name}</Text>
                <Text variant="bodySmall">{n.note}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Top control row: location filter (US-7) */}
      <View style={styles.topControls}>
        <Chip
          icon={nearOnly ? 'crosshairs-gps' : 'filter-variant'}
          selected={nearOnly}
          mode="flat"
          onPress={toggleNear}
          style={styles.controlChip}
          accessibilityLabel={
            nearOnly
              ? 'Filter: near me. Tap to show all locations.'
              : 'Filter: all locations. Tap to show only nearby beds.'
          }
        >
          {nearOnly ? 'Near me' : 'All locations'}
        </Chip>
        <Chip
          icon="crosshairs"
          onPress={recenterOnMe}
          style={styles.controlChip}
          accessibilityLabel="Center the map on my location"
        >
          My location
        </Chip>
      </View>

      {/* Legend */}
      <Card mode="elevated" style={styles.legend}>
        <Card.Content style={styles.legendContent}>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="map-marker" size={18} color={markerColors.bed} />
            <Text variant="bodySmall">Your beds</Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="map-marker" size={18} color={markerColors.nursery} />
            <Text variant="bodySmall">Nurseries</Text>
          </View>
        </Card.Content>
      </Card>

      {bedPlants.length === 0 && (
        <View style={styles.hintWrap} pointerEvents="none">
          <Card mode="elevated" style={styles.hint}>
            <Card.Content>
              <Text variant="bodySmall">
                Add a location to a plant (Add/Edit → “Use my GPS”) to drop your own garden beds here.
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3500}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  callout: { maxWidth: 220, gap: 2, padding: 4 },
  topControls: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', gap: 8 },
  controlChip: { backgroundColor: 'white' },
  legend: { position: 'absolute', bottom: 16, left: 12, borderRadius: 12 },
  legendContent: { flexDirection: 'row', gap: 16, paddingVertical: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hintWrap: { position: 'absolute', bottom: 16, right: 12, maxWidth: 220 },
  hint: { borderRadius: 12 },
  fallback: { padding: 16, gap: 4 },
  fallbackTitle: { fontWeight: '700', marginTop: 12 },
});
