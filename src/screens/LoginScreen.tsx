import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card, HelperText, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import type { AuthScreenNav } from '../navigation/types';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList } from '../navigation/types';

export default function LoginScreen() {
  const theme = useTheme();
  const nav = useNavigation<AuthScreenNav>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState(route.params?.registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(route.params?.registeredEmail ? 'Account created — please log in.' : '');

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      // On success the AuthProvider updates `user`, and RootNavigator swaps to
      // the main app automatically — no manual navigation needed.
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in.');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Logo />
        </View>

        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.cardContent}>
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
              onSubmitEditing={submit}
            />
            {error && (
              <HelperText type="error" visible style={styles.error}>
                {error}
              </HelperText>
            )}
            <Button
              mode="contained"
              onPress={submit}
              loading={busy}
              disabled={busy || !email || !password}
              style={styles.button}
            >
              Log In
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text variant="bodyMedium">New here? </Text>
          <Button compact mode="text" onPress={() => nav.navigate('Register')}>
            Create an account
          </Button>
        </View>
      </ScrollView>

      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={4000}>
        {notice}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 8 },
  logo: { marginBottom: 16 },
  card: { borderRadius: 16 },
  cardContent: { gap: 12, paddingVertical: 8 },
  error: { paddingHorizontal: 0 },
  button: { marginTop: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});
