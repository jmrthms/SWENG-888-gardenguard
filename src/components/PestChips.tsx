import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { PESTS, getPest, pestIcon, pestLabel } from '../data/pests';

/** Multi-select pest/critter/disease chips for the Add/Edit form. */
export function PestSelector({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      {PESTS.map((pest) => {
        const isOn = selected.includes(pest.id);
        return (
          <Chip
            key={pest.id}
            selected={isOn}
            showSelectedCheck
            mode={isOn ? 'flat' : 'outlined'}
            onPress={() => onToggle(pest.id)}
            style={styles.chip}
            icon={pestIcon(pest.type)}
          >
            {pest.label}
          </Chip>
        );
      })}
    </View>
  );
}

/** Read-only row of the pests associated with a plant. */
export function PestRow({ pests, max }: { pests: string[]; max?: number }) {
  if (pests.length === 0) {
    return (
      <Text variant="bodySmall" style={styles.muted}>
        No pests tagged yet
      </Text>
    );
  }
  const shown = max ? pests.slice(0, max) : pests;
  const extra = max && pests.length > max ? pests.length - max : 0;
  return (
    <View style={styles.wrap}>
      {shown.map((id) => (
        <Chip key={id} compact mode="outlined" style={styles.chip} icon={pestIcon(getPest(id)?.type ?? 'insect')}>
          {pestLabel(id)}
        </Chip>
      ))}
      {extra > 0 && (
        <Chip compact mode="outlined" style={styles.chip}>
          +{extra}
        </Chip>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginVertical: 2 },
  muted: { opacity: 0.6, fontStyle: 'italic' },
});
