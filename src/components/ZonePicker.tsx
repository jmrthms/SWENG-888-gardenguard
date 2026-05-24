import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Dialog, Portal, RadioButton, TextInput } from 'react-native-paper';
import { ZONES } from '../data/zones';

/** Outlined-field-styled selector that opens a scrollable USDA zone list. */
export function ZonePicker({
  value,
  onChange,
  label = 'Region / Zone',
}: {
  value: string;
  onChange: (zone: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={`Zone ${value}`}
            editable={false}
            right={<TextInput.Icon icon="menu-down" />}
          />
        </View>
      </Pressable>
      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>Select your hardiness zone</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 380, paddingHorizontal: 0 }}>
            <ScrollView>
              <RadioButton.Group
                value={value}
                onValueChange={(v) => {
                  onChange(v);
                  setOpen(false);
                }}
              >
                {ZONES.map((z) => (
                  <RadioButton.Item key={z.value} label={z.label} value={z.value} />
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
