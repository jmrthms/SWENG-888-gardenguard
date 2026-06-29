import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card, Chip, Divider, Menu, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { usePreferences } from '../context/PreferencesContext';
import { CATEGORY_META } from '../components/categoryMeta';
import { CatalogPicker } from '../components/CatalogPicker';
import { EmptyState } from '../components/EmptyState';
import { PESTS, pestIcon, pestLabel } from '../data/pests';
import {
  companionFitsRegion,
  companionsForCatalogPlant,
  recommendForPest,
  toPrefill,
} from '../data/recommendations';
import { resolveCompanion } from '../data/companions';
import { REGIONS, regionLabel } from '../data/regions';
import type { CatalogPlant, Companion, RegionId } from '../models/types';
import type { RecommendationsTabRoute, TabScreenNav } from '../navigation/types';

type Mode = 'pest' | 'plant';

export default function RecommendationsScreen() {
  const theme = useTheme();
  const nav = useNavigation<TabScreenNav>();
  const route = useRoute<RecommendationsTabRoute>();
  const { preferences } = usePreferences();

  const [mode, setMode] = useState<Mode>('pest');
  const [region, setRegion] = useState<RegionId>(preferences.region);
  const [regionMenu, setRegionMenu] = useState(false);
  const [pestId, setPestId] = useState(route.params?.pestId ?? 'aphids');
  const [pestMenu, setPestMenu] = useState(false);
  const [plant, setPlant] = useState<CatalogPlant | undefined>(undefined);

  // Switching region invalidates a plant picked from the old region's catalog.
  const changeRegion = (r: RegionId) => {
    setRegion(r);
    setPlant(undefined);
  };

  // Keep the local region in sync with the saved preference.
  useEffect(() => {
    setRegion(preferences.region);
    setPlant(undefined);
  }, [preferences.region]);

  // Honor a pest passed in from the Home "In season" card or a deep link.
  useEffect(() => {
    if (route.params?.pestId) {
      setMode('pest');
      setPestId(route.params.pestId);
    }
  }, [route.params?.pestId]);

  const results = useMemo<Companion[]>(
    () =>
      mode === 'pest'
        ? recommendForPest(pestId, { region })
        : plant
          ? companionsForCatalogPlant(plant, region)
          : [],
    [mode, pestId, plant, region],
  );

  const addToGarden = (companion: Companion) => {
    nav.navigate('GardenTab', { screen: 'AddEditPlant', params: { prefill: toPrefill(companion) } });
  };

  const contextLabel =
    mode === 'pest' ? pestLabel(pestId) : plant ? plant.name : 'a plant';

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scroll}
    >
      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.controls}>
          <SegmentedButtons
            value={mode}
            onValueChange={(v) => setMode(v as Mode)}
            buttons={[
              { value: 'pest', label: 'By pest', icon: 'bug' },
              { value: 'plant', label: 'Protect a plant', icon: 'sprout' },
            ]}
          />

          {mode === 'pest' ? (
            <>
              <Text variant="titleMedium" style={styles.heading}>
                What do you want to protect against?
              </Text>
              <Menu
                visible={pestMenu}
                onDismiss={() => setPestMenu(false)}
                anchor={
                  <Button
                    mode="outlined"
                    icon="bug"
                    onPress={() => setPestMenu(true)}
                    contentStyle={styles.pestBtnContent}
                  >
                    {pestLabel(pestId)}
                  </Button>
                }
              >
                <ScrollView style={{ maxHeight: 360 }}>
                  {PESTS.map((p) => (
                    <Menu.Item
                      key={p.id}
                      title={p.label}
                      leadingIcon={pestIcon(p.type)}
                      onPress={() => {
                        setPestId(p.id);
                        setPestMenu(false);
                      }}
                    />
                  ))}
                </ScrollView>
              </Menu>
            </>
          ) : (
            <>
              <Text variant="titleMedium" style={styles.heading}>
                Which plant do you want to protect?
              </Text>
              <CatalogPicker region={region} onSelect={setPlant} />
              {plant && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {plant.name} ·{' '}
                  {resolveCompanion(plant.id)
                    ? 'a companion plant — it already helps repel pests'
                    : plant.pests.length
                      ? `watch for ${plant.pests.map(pestLabel).join(', ')}`
                      : 'no pests recorded for this plant yet'}
                </Text>
              )}
            </>
          )}

          <View style={styles.filterRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Region:
            </Text>
            <Menu
              visible={regionMenu}
              onDismiss={() => setRegionMenu(false)}
              anchor={
                <Chip icon="map-marker-radius" mode="outlined" onPress={() => setRegionMenu(true)} closeIcon="menu-down" onClose={() => setRegionMenu(true)}>
                  {regionLabel(region)}
                </Chip>
              }
            >
              {REGIONS.map((r) => (
                <Menu.Item
                  key={r.id}
                  title={r.label}
                  onPress={() => {
                    changeRegion(r.id);
                    setRegionMenu(false);
                  }}
                />
              ))}
            </Menu>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleSmall" style={[styles.resultsHeading, { color: theme.colors.onSurfaceVariant }]}>
        Organic companions for {contextLabel} · {regionLabel(region)}
      </Text>

      {results.length === 0 ? (
        <EmptyState
          icon="shield-search"
          title={mode === 'plant' && !plant ? 'Pick a plant' : 'No companions found'}
          message={
            mode === 'plant' && !plant
              ? 'Choose a plant from your region’s catalog to see the organic companions that protect it.'
              : 'No companions are tagged for this yet.'
          }
        />
      ) : (
        results.map((c) => {
          const fits = companionFitsRegion(c, region);
          return (
            <Card key={c.id} mode="contained" style={styles.card}>
              <Card.Content style={styles.resultContent}>
                <View style={[styles.resultIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialCommunityIcons name={CATEGORY_META[c.category].icon} size={24} color={theme.colors.onPrimaryContainer} />
                </View>
                <View style={styles.resultBody}>
                  <View style={styles.resultTitleRow}>
                    <Text variant="titleMedium" style={styles.resultName}>
                      {c.name}
                    </Text>
                    {fits ? (
                      <Chip compact textStyle={styles.zoneFitText} style={[styles.zoneFitChip, { backgroundColor: theme.colors.primaryContainer }]}>
                        ✓ Grows here
                      </Chip>
                    ) : (
                      <Chip compact mode="outlined" textStyle={styles.zoneFitText} style={styles.zoneFitChip}>
                        Not local
                      </Chip>
                    )}
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Repels {c.repels.map(pestLabel).slice(0, 4).join(', ')}
                  </Text>
                  <Text variant="bodySmall" style={styles.note}>
                    {c.note}
                  </Text>
                </View>
              </Card.Content>
              <Divider />
              <Card.Actions>
                <Button icon="plus" onPress={() => addToGarden(c)}>
                  Add to my garden
                </Button>
              </Card.Actions>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { borderRadius: 16 },
  controls: { gap: 12 },
  heading: { fontWeight: '700' },
  pestBtnContent: { flexDirection: 'row' },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  resultsHeading: { marginTop: 4, marginLeft: 4 },
  resultContent: { flexDirection: 'row', gap: 12 },
  resultIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  resultBody: { flex: 1, gap: 2 },
  resultTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  resultName: { fontWeight: '700' },
  zoneFitChip: { height: 28 },
  zoneFitText: { fontSize: 11 },
  note: { fontStyle: 'italic', marginTop: 2, opacity: 0.85 },
});
