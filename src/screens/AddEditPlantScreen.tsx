import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import {
  Button,
  Chip,
  Divider,
  HelperText,
  Menu,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useGarden } from '../context/GardenContext';
import { PestSelector } from '../components/PestChips';
import type { Coordinates, PlantCategory, Sun, Water } from '../models/types';
import type { AddEditPlantRoute, GardenScreenNav } from '../navigation/types';

const ZONE_NUMBERS = Array.from({ length: 13 }, (_, i) => i + 1);

/** Compact dropdown for a single hardiness-zone number. */
function ZoneNumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <Button mode="outlined" onPress={() => setOpen(true)} icon="menu-down" contentStyle={styles.zoneBtnContent}>
          {label} {value}
        </Button>
      }
    >
      <ScrollView style={{ maxHeight: 320 }}>
        {ZONE_NUMBERS.map((n) => (
          <Menu.Item
            key={n}
            onPress={() => {
              onChange(n);
              setOpen(false);
            }}
            title={`Zone ${n}`}
          />
        ))}
      </ScrollView>
    </Menu>
  );
}

export default function AddEditPlantScreen() {
  const theme = useTheme();
  const nav = useNavigation<GardenScreenNav>();
  const route = useRoute<AddEditPlantRoute>();
  const { addPlant, updatePlant, getPlant } = useGarden();

  const editingId = route.params?.plantId;
  const prefill = route.params?.prefill;
  const existing = useMemo(() => (editingId ? getPlant(editingId) : undefined), [editingId, getPlant]);
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? prefill?.name ?? '');
  const [category, setCategory] = useState<PlantCategory>(existing?.category ?? prefill?.category ?? 'flower');
  const [repels, setRepels] = useState<string[]>(existing?.repels ?? prefill?.repels ?? []);
  const [sun, setSun] = useState<Sun>(existing?.sun ?? prefill?.sun ?? 'full');
  const [water, setWater] = useState<Water>(existing?.water ?? prefill?.water ?? 'moderate');
  const [zoneMin, setZoneMin] = useState(existing?.zoneMin ?? prefill?.zoneMin ?? 2);
  const [zoneMax, setZoneMax] = useState(existing?.zoneMax ?? prefill?.zoneMax ?? 11);
  const [locationLabel, setLocationLabel] = useState(existing?.locationLabel ?? '');
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>(existing?.coordinates);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const [gpsBusy, setGpsBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    nav.setOptions({ title: isEditing ? 'Edit Plant' : 'Add Plant' });
  }, [nav, isEditing]);

  const useGps = async () => {
    setGpsBusy(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setSnack('Location permission denied.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoordinates({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setSnack('Location captured for this plant.');
    } catch {
      setSnack('Could not get your location.');
    } finally {
      setGpsBusy(false);
    }
  };

  const nameError = submitted && !name.trim();

  const save = async () => {
    setSubmitted(true);
    if (!name.trim()) {
      setSnack('Please enter a plant name.');
      return;
    }
    // Keep the zone range sane regardless of pick order.
    const lo = Math.min(zoneMin, zoneMax);
    const hi = Math.max(zoneMin, zoneMax);
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        repels,
        sun,
        water,
        zoneMin: lo,
        zoneMax: hi,
        locationLabel: locationLabel.trim(),
        coordinates,
        notes: notes.trim() || undefined,
        catalogId: existing?.catalogId ?? prefill?.catalogId,
      };
      if (isEditing && existing) {
        await updatePlant({ ...existing, ...payload });
      } else {
        await addPlant(payload);
      }
      nav.goBack();
    } catch {
      setSnack('Could not save the plant. Please try again.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TextInput
          mode="outlined"
          label="Plant name"
          value={name}
          onChangeText={setName}
          error={nameError}
          left={<TextInput.Icon icon="leaf" />}
        />
        {nameError && (
          <HelperText type="error" visible>
            A name is required.
          </HelperText>
        )}

        <Text variant="labelLarge" style={styles.label}>
          Category
        </Text>
        <SegmentedButtons
          value={category}
          onValueChange={(v) => setCategory(v as PlantCategory)}
          buttons={[
            { value: 'flower', label: 'Flower', icon: 'flower' },
            { value: 'vegetable', label: 'Veg', icon: 'carrot' },
            { value: 'herb', label: 'Herb', icon: 'leaf' },
          ]}
        />

        <Text variant="labelLarge" style={styles.label}>
          Repels (pests &amp; critters)
        </Text>
        <PestSelector selected={repels} onToggle={(id) => setRepels((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))} />

        <Divider style={styles.divider} />

        <Text variant="labelLarge" style={styles.label}>
          Sunlight
        </Text>
        <SegmentedButtons
          value={sun}
          onValueChange={(v) => setSun(v as Sun)}
          buttons={[
            { value: 'full', label: 'Full' },
            { value: 'partial', label: 'Partial' },
            { value: 'shade', label: 'Shade' },
          ]}
        />

        <Text variant="labelLarge" style={styles.label}>
          Water
        </Text>
        <SegmentedButtons
          value={water}
          onValueChange={(v) => setWater(v as Water)}
          buttons={[
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
          ]}
        />

        <Text variant="labelLarge" style={styles.label}>
          Hardiness zone range
        </Text>
        <View style={styles.zoneRow}>
          <ZoneNumberField label="Min" value={zoneMin} onChange={setZoneMin} />
          <Text variant="bodyLarge">to</Text>
          <ZoneNumberField label="Max" value={zoneMax} onChange={setZoneMax} />
        </View>

        <Divider style={styles.divider} />

        <Text variant="labelLarge" style={styles.label}>
          Location
        </Text>
        <TextInput
          mode="outlined"
          label="Bed / site label"
          placeholder="e.g. Front-yard bed, Patio pots"
          value={locationLabel}
          onChangeText={setLocationLabel}
          left={<TextInput.Icon icon="map-marker-outline" />}
        />
        <View style={styles.gpsRow}>
          <Button mode="outlined" icon="crosshairs-gps" onPress={useGps} loading={gpsBusy} disabled={gpsBusy}>
            Use my GPS
          </Button>
          {coordinates && (
            <Chip icon="map-marker-check" onClose={() => setCoordinates(undefined)} style={styles.coordChip}>
              {coordinates.latitude.toFixed(3)}, {coordinates.longitude.toFixed(3)}
            </Chip>
          )}
        </View>
        <HelperText type="info" visible style={styles.helper}>
          A saved location lets this plant appear on the map and in the “Near me” filter.
        </HelperText>

        <TextInput
          mode="outlined"
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.notes}
        />

        <Button mode="contained" icon="content-save" onPress={save} loading={saving} disabled={saving} style={styles.save}>
          Save
        </Button>
      </ScrollView>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 16, gap: 8, paddingBottom: 40 },
  label: { marginTop: 12, marginBottom: 4 },
  divider: { marginTop: 16 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  zoneBtnContent: { flexDirection: 'row-reverse' },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  coordChip: { alignSelf: 'flex-start' },
  helper: { paddingHorizontal: 0 },
  notes: { marginTop: 8 },
  save: { marginTop: 20, borderRadius: 12, paddingVertical: 4 },
});
