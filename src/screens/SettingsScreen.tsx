import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Divider,
  List,
  Portal,
  SegmentedButtons,
  Snackbar,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { ZonePicker } from '../components/ZonePicker';
import { applySeasonalNotifications, sendPreviewTip } from '../storage/notifications';
import type { ThemeMode, Units } from '../models/types';
import { TAGLINE } from '../theme/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { preferences, update } = usePreferences();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [snack, setSnack] = useState('');

  const onToggleNotifications = async (value: boolean) => {
    void update({ notifications: value });
    const res = await applySeasonalNotifications(preferences.zone, value);
    if (value && !res.ok) {
      void update({ notifications: false }); // revert if we couldn't actually enable them
      setSnack(
        res.reason === 'denied'
          ? 'Allow notifications in system settings to get seasonal tips.'
          : 'Could not enable notifications on this device.',
      );
    } else if (value && res.ok) {
      setSnack('Seasonal tips on — a monthly reminder is scheduled.');
    }
  };

  const onPreviewTip = async () => {
    const res = await sendPreviewTip(preferences.zone);
    setSnack(res.ok ? 'Preview tip scheduled — watch for the notification.' : 'Could not send a preview here.');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.scroll}>
      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.section}>
          <Text variant="titleSmall" style={styles.heading}>
            Region
          </Text>
          <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Your hardiness zone drives every recommendation.
          </Text>
          <ZonePicker value={preferences.zone} onChange={(zone) => update({ zone })} />
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.section}>
          <Text variant="titleSmall" style={styles.heading}>
            Units
          </Text>
          <SegmentedButtons
            value={preferences.units}
            onValueChange={(v) => update({ units: v as Units })}
            buttons={[
              { value: 'imperial', label: 'Imperial', icon: 'temperature-fahrenheit' },
              { value: 'metric', label: 'Metric', icon: 'temperature-celsius' },
            ]}
          />

          <Text variant="titleSmall" style={[styles.heading, styles.spaced]}>
            Theme
          </Text>
          <SegmentedButtons
            value={preferences.themeMode}
            onValueChange={(v) => update({ themeMode: v as ThemeMode })}
            buttons={[
              { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
              { value: 'dark', label: 'Dark', icon: 'weather-night' },
              { value: 'system', label: 'System', icon: 'cellphone' },
            ]}
          />
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <List.Item
          title="Seasonal notifications"
          description="Zone-based pest-season tips"
          left={(props) => <List.Icon {...props} icon="bell-outline" />}
          right={() => (
            <Switch
              value={preferences.notifications}
              onValueChange={onToggleNotifications}
              accessibilityLabel="Seasonal notifications"
            />
          )}
        />
        {preferences.notifications && (
          <View style={styles.previewWrap}>
            <Button mode="text" icon="bell-ring-outline" onPress={onPreviewTip}>
              Send a preview tip
            </Button>
          </View>
        )}
      </Card>

      <Card mode="contained" style={styles.card}>
        <List.Item
          title={user?.name ?? 'Gardener'}
          description={user?.email ?? ''}
          left={(props) => <List.Icon {...props} icon="account-circle-outline" />}
        />
        <Divider />
        <View style={styles.logoutWrap}>
          <Button
            mode="outlined"
            icon="logout"
            textColor={theme.colors.error}
            onPress={() => setConfirmLogout(true)}
          >
            Log Out
          </Button>
        </View>
      </Card>

      <View style={styles.about}>
        <Text variant="bodySmall" style={[styles.aboutText, { color: theme.colors.onSurfaceVariant }]}>
          GardenGuard · {TAGLINE}
        </Text>
        <Text variant="bodySmall" style={[styles.aboutText, { color: theme.colors.onSurfaceVariant }]}>
          Version 1.0.0 (MVP)
        </Text>
        <Text variant="bodySmall" style={[styles.disclaimer, { color: theme.colors.onSurfaceVariant }]}>
          Recommendations are organic-gardening guidance, not certified agronomic advice.
        </Text>
      </View>

      <Portal>
        <Dialog visible={confirmLogout} onDismiss={() => setConfirmLogout(false)}>
          <Dialog.Title>Log out?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">You can sign back in anytime. Your garden stays saved on this device.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmLogout(false)}>Cancel</Button>
            <Button
              textColor={theme.colors.error}
              onPress={() => {
                setConfirmLogout(false);
                void signOut();
              }}
            >
              Log Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3500}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  flex: { flex: 1 },
  previewWrap: { alignItems: 'flex-start', paddingHorizontal: 8, paddingBottom: 8 },
  card: { borderRadius: 16 },
  section: { gap: 8 },
  heading: { fontWeight: '700' },
  spaced: { marginTop: 16 },
  hint: { marginTop: -4 },
  logoutWrap: { padding: 12 },
  about: { alignItems: 'center', gap: 2, marginTop: 8 },
  aboutText: { textAlign: 'center' },
  disclaimer: { textAlign: 'center', fontStyle: 'italic', marginTop: 6, paddingHorizontal: 24 },
});
