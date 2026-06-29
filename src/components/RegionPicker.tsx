import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import type { RegionId } from '../models/types';
import { REGIONS, regionLabel } from '../data/regions';

/** Outlined-field-styled selector that opens the six growing regions. */
export function RegionPicker({
  value,
  onChange,
  label = 'Growing region',
}: {
  value: RegionId;
  onChange: (region: RegionId) => void;
  label?: string;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Growing region, ${regionLabel(value)}. Opens a picker.`}
      >
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={regionLabel(value)}
            editable={false}
            left={<TextInput.Icon icon="map-marker-radius" />}
            right={<TextInput.Icon icon="menu-down" />}
          />
        </View>
      </Pressable>
      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>Select your region</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView>
              <RadioButton.Group
                value={value}
                onValueChange={(v) => {
                  onChange(v as RegionId);
                  setOpen(false);
                }}
              >
                {REGIONS.map((r) => (
                  <Pressable key={r.id} onPress={() => { onChange(r.id); setOpen(false); }}>
                    <View style={styles.row}>
                      <RadioButton value={r.id} />
                      <View style={styles.rowText}>
                        <Text variant="titleSmall">{r.label}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {r.blurb}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {r.states}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollArea: { maxHeight: 420, paddingHorizontal: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 16, paddingVertical: 4 },
  rowText: { flex: 1, gap: 1, paddingTop: 6 },
});
