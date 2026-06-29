import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { ActivityIndicator, Card, Chip, List, Snackbar, Text, useTheme } from 'react-native-paper';
import { useGarden } from '../context/GardenContext';
import { usePreferences } from '../context/PreferencesContext';
import { pestLabel } from '../data/pests';
import { nearbyNurseries } from '../data/nurseries';
import { regionMeta } from '../data/regions';
import { buildLeafletHtml, type BedMarker, type NurseryMarker } from './mapHtml';
import { markerColors } from '../theme/colors';
import type { Coordinates } from '../models/types';
import type { MapTabRoute, TabScreenNav } from '../navigation/types';

const NEAR_RADIUS_MI = 50;
const mapsSupported = Platform.OS !== 'web';

export default function MapScreen() {
  const theme = useTheme();
  const nav = useNavigation<TabScreenNav>();
  const route = useRoute<MapTabRoute>();
  const { plants } = useGarden();
  const { preferences } = usePreferences();

  const focusPlantId = route.params?.focusPlantId;
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [userLoc, setUserLoc] = useState<Coordinates | null>(null);
  const [nearOnly, setNearOnly] = useState(false);
  const [snack, setSnack] = useState('');

  const bedPlants = useMemo(() => plants.filter((p) => p.coordinates), [plants]);
  const focusPlant = focusPlantId ? bedPlants.find((p) => p.id === focusPlantId) : undefined;

  const center: Coordinates = bedPlants[0]?.coordinates ?? regionMeta(preferences.region).center;

  const beds = useMemo<BedMarker[]>(
    () =>
      bedPlants.map((p) => ({
        id: p.id,
        name: p.name,
        label: p.locationLabel || 'Garden bed',
        pests: p.pests.slice(0, 3).map(pestLabel),
        lat: p.coordinates!.latitude,
        lng: p.coordinates!.longitude,
      })),
    [bedPlants],
  );

  const nurseries = useMemo<NurseryMarker[]>(
    () =>
      nearbyNurseries(center).map((n) => ({
        id: n.id,
        name: n.name,
        note: n.note ?? '',
        lat: n.coordinates.latitude,
        lng: n.coordinates.longitude,
      })),
    [center.latitude, center.longitude],
  );

  // Stable across filter toggles / focus (those are driven by injected JS), so
  // the map only reloads when the underlying plant set or region changes.
  const html = useMemo(
    () => buildLeafletHtml({ beds, nurseries, center, bedColor: markerColors.bed, nurseryColor: markerColors.nursery }),
    [beds, nurseries, center.latitude, center.longitude],
  );

  const inject = (js: string) => webRef.current?.injectJavaScript(`${js};true;`);

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
    if (loc) inject(`GG.setUser(${loc.latitude},${loc.longitude});GG.flyTo(${loc.latitude},${loc.longitude},13)`);
  };

  const toggleNear = async () => {
    const next = !nearOnly;
    setNearOnly(next);
    let loc = userLoc;
    if (next && !loc) loc = await ensureLocation();
    if (next && !loc) {
      setNearOnly(false); // couldn't get location — don't leave the chip stuck "on"
      return;
    }
    if (loc) inject(`GG.setUser(${loc.latitude},${loc.longitude});GG.filterNear(${next},${loc.latitude},${loc.longitude},${NEAR_RADIUS_MI})`);
    else inject(`GG.filterNear(false,0,0,0)`);
  };

  // Recenter when arriving via "View on Map" from a plant.
  useEffect(() => {
    if (ready && focusPlant) inject(`GG.focus(${JSON.stringify(focusPlant.id)})`);
  }, [ready, focusPlant?.id]);

  const onMessage = (e: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as { type: string; id?: string };
      if (msg.type === 'ready') setReady(true);
      else if (msg.type === 'open' && msg.id) {
        nav.navigate('GardenTab', { screen: 'PlantDetail', params: { plantId: msg.id } });
      }
    } catch {
      // ignore malformed messages
    }
  };

  // Web is out of scope (WebView is native-only here) — show a readable list.
  if (!mapsSupported) {
    return (
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.fallback}>
        <Text variant="titleMedium" style={styles.fallbackTitle}>Garden beds</Text>
        {beds.length === 0 && <Text variant="bodyMedium">No plants have a saved location yet.</Text>}
        {beds.map((b) => (
          <List.Item
            key={b.id}
            title={b.name}
            description={b.label}
            left={(props) => <List.Icon {...props} icon="map-marker" color={markerColors.bed} />}
            onPress={() => nav.navigate('GardenTab', { screen: 'PlantDetail', params: { plantId: b.id } })}
          />
        ))}
        <Text variant="titleMedium" style={styles.fallbackTitle}>Nearby nurseries</Text>
        {nurseries.map((n) => (
          <List.Item key={n.id} title={n.name} description={n.note} left={(props) => <List.Icon {...props} icon="storefront" color={markerColors.nursery} />} />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.flex}>
      <WebView
        ref={webRef}
        style={styles.map}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
      />

      {/* Top control row: location filter (US-7) */}
      <View style={styles.topControls}>
        <Chip
          icon={nearOnly ? 'crosshairs-gps' : 'filter-variant'}
          selected={nearOnly}
          mode="flat"
          onPress={toggleNear}
          style={styles.controlChip}
          accessibilityLabel={nearOnly ? 'Filter: near me. Tap to show all locations.' : 'Filter: all locations. Tap to show only nearby beds.'}
        >
          {nearOnly ? 'Near me' : 'All locations'}
        </Chip>
        <Chip icon="crosshairs" onPress={recenterOnMe} style={styles.controlChip} accessibilityLabel="Center the map on my location">
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
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
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
