import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { RegionPicker } from '../components/RegionPicker';
import { DEFAULT_REGION, regionMeta } from '../data/regions';
import type { AuthScreenNav } from '../navigation/types';
import type { RegionId } from '../models/types';

export default function RegisterScreen() {
  const theme = useTheme();
  const nav = useNavigation<AuthScreenNav>();
  const { signUp } = useAuth();
  const { update } = usePreferences();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [region, setRegion] = useState<RegionId>(DEFAULT_REGION);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUp(name, email, password);
      // Capturing the region now makes the first Home screen useful (US-1 rationale).
      await update({ region, zone: regionMeta(region).defaultZone });
      // US-1: account created → redirect to Login to sign in.
      nav.navigate('Login', { registeredEmail: email.trim().toLowerCase() });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction color={theme.colors.onPrimary} onPress={() => nav.goBack()} />
        <Appbar.Content title="Create account" color={theme.colors.onPrimary} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
          Pick your growing region now — it powers your region-specific plant catalog and pest recommendations.
        </Text>

        <TextInput
          mode="outlined"
          label="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          left={<TextInput.Icon icon="account-outline" />}
        />
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          left={<TextInput.Icon icon="email-outline" />}
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((s) => !s)}
            />
          }
        />
        <HelperText type="info" visible style={styles.helper}>
          At least 6 characters.
        </HelperText>

        <RegionPicker value={region} onChange={setRegion} />

        {error && (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={submit}
          loading={busy}
          disabled={busy || !name || !email || !password}
          style={styles.button}
        >
          Sign Up
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 24, gap: 12 },
  intro: { marginBottom: 4, lineHeight: 20 },
  helper: { paddingHorizontal: 0, marginTop: -8 },
  button: { marginTop: 8 },
});
