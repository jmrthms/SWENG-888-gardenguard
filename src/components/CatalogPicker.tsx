import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, List, Portal, SegmentedButtons, Searchbar, Text, useTheme } from 'react-native-paper';
import type { CatalogPlant, PlantCategory, RegionId } from '../models/types';
import { plantsInRegion } from '../data/plantsCatalog';
import { resolveCompanion } from '../data/companions';
import { CATEGORY_META } from './categoryMeta';
import { pestLabel } from '../data/pests';
import { regionLabel } from '../data/regions';

type CatFilter = 'all' | PlantCategory;

/**
 * Button + dialog that lets the user pick a real plant from the regional
 * catalog (filtered to their region), so Add Plant can prefill from the dataset
 * instead of being entirely free-text (F3).
 */
export function CatalogPicker({
  region,
  onSelect,
}: {
  region: RegionId;
  onSelect: (plant: CatalogPlant) => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CatFilter>('all');

  const results = useMemo(
    () => plantsInRegion(region, { category: cat === 'all' ? undefined : cat, query }),
    [region, cat, query],
  );

  const close = () => {
    setOpen(false);
    setQuery('');
    setCat('all');
  };

  const pick = (p: CatalogPlant) => {
    onSelect(p);
    close();
  };

  return (
    <>
      <Button
        mode="contained-tonal"
        icon="book-search-outline"
        onPress={() => setOpen(true)}
        accessibilityLabel="Browse the regional plant catalog"
      >
        Pick from catalog
      </Button>

      <Portal>
        <Dialog visible={open} onDismiss={close} style={styles.dialog}>
          <Dialog.Title>{regionLabel(region)} catalog</Dialog.Title>
          <View style={styles.controls}>
            <Searchbar
              placeholder="Search plants"
              value={query}
              onChangeText={setQuery}
              style={styles.search}
              inputStyle={styles.searchInput}
            />
            <SegmentedButtons
              value={cat}
              onValueChange={(v) => setCat(v as CatFilter)}
              density="small"
              buttons={[
                { value: 'all', label: 'All' },
                { value: 'flower', label: 'Flower', icon: 'flower' },
                { value: 'vegetable', label: 'Veg', icon: 'carrot' },
                { value: 'herb', label: 'Herb', icon: 'leaf' },
              ]}
            />
          </View>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {results.length === 0 ? (
                <Text variant="bodyMedium" style={styles.empty}>
                  No plants match. Try another category or search, or close this and type a custom name.
                </Text>
              ) : (
                results.map((p) => (
                  <List.Item
                    key={p.id}
                    title={p.name}
                    description={
                      p.pests.length
                        ? `Watch for ${p.pests.slice(0, 3).map(pestLabel).join(', ')}`
                        : resolveCompanion(p.id)
                          ? 'Companion plant — repels pests'
                          : 'No pests recorded'
                    }
                    onPress={() => pick(p)}
                    left={(props) => (
                      <List.Icon {...props} icon={CATEGORY_META[p.category].icon} color={theme.colors.primary} />
                    )}
                    right={(props) => <List.Icon {...props} icon="plus" />}
                  />
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={close}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  dialog: { maxHeight: '80%' },
  controls: { paddingHorizontal: 24, gap: 10, paddingBottom: 8 },
  search: { borderRadius: 12 },
  searchInput: { minHeight: 0 },
  scrollArea: { paddingHorizontal: 0 },
  empty: { padding: 24, opacity: 0.7 },
});
