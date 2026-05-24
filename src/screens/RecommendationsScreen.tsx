import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Chip, Divider, Menu, Text, useTheme } from 'react-native-paper';
import { usePreferences } from '../context/PreferencesContext';
import { CATEGORY_META } from '../components/categoryMeta';
import { EmptyState } from '../components/EmptyState';
import { PESTS, pestLabel } from '../data/pests';
import { plantFitsZone, recommendForPest, toPrefill } from '../data/recommendations';
import type { TabScreenNav } from '../navigation/types';

export default function RecommendationsScreen() {
  const theme = useTheme();
  const nav = useNavigation<TabScreenNav>();
  const { preferences } = usePreferences();

  const [pestId, setPestId] = useState('aphids');
  const [pestMenu, setPestMenu] = useState(false);
  const [containerOnly, setContainerOnly] = useState(false);

  const results = useMemo(
    () => recommendForPest(pestId, { zone: preferences.zone, containerOnly }),
    [pestId, preferences.zone, containerOnly],
  );

  const addToGarden = (catalogId: string) => {
    const c = results.find((r) => r.id === catalogId);
    if (!c) return;
    nav.navigate('GardenTab', { screen: 'AddEditPlant', params: { prefill: toPrefill(c) } });
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scroll}
    >
      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.controls}>
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
                  leadingIcon={p.type === 'critter' ? 'rabbit' : 'bug'}
                  onPress={() => {
                    setPestId(p.id);
                    setPestMenu(false);
                  }}
                />
              ))}
            </ScrollView>
          </Menu>

          <View style={styles.filterRow}>
            <Chip
              icon="flower-pot"
              selected={containerOnly}
              mode={containerOnly ? 'flat' : 'outlined'}
              showSelectedCheck
              onPress={() => setContainerOnly((v) => !v)}
            >
              Fits containers
            </Chip>
            <Chip icon="map-marker-radius" mode="outlined" disabled>
              Zone {preferences.zone}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleSmall" style={[styles.resultsHeading, { color: theme.colors.onSurfaceVariant }]}>
        Organic companions for Zone {preferences.zone}
      </Text>

      {results.length === 0 ? (
        <EmptyState
          icon="shield-search"
          title="No companions found"
          message={
            containerOnly
              ? 'No container-friendly companions are tagged for this pest. Try turning off the container filter.'
              : 'No companions are tagged for this pest yet.'
          }
        />
      ) : (
        results.map((c) => {
          const fits = plantFitsZone(c, preferences.zone);
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
                        ✓ Zone {preferences.zone}
                      </Chip>
                    ) : (
                      <Chip compact mode="outlined" textStyle={styles.zoneFitText} style={styles.zoneFitChip}>
                        Outside your zone
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
                <Button icon="plus" onPress={() => addToGarden(c.id)}>
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
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
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
