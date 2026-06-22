import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { AuthLogo } from '@/components/AuthLogo';
import { Button, Screen, Text, TextInput, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setFormError(null);
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Unesite email.';
    if (!password) next.password = 'Unesite šifru.';
    setErrors(next);
    if (Object.keys(next).length) {
      setFormError('Popunite obavezna polja.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(kupac)/home');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Greška pri prijavi.';
      setFormError(msg);
      toast.show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll center contentStyle={{ gap: space.lg, paddingHorizontal: space.xl }}>
      <AuthLogo subtitle="Prijavite se na svoj nalog" />

      {formError ? (
        <View style={styles.banner}>
          <Feather name="alert-circle" size={18} color={colors.error} />
          <Text variant="footnote" color="error" style={{ flex: 1 }}>
            {formError}
          </Text>
        </View>
      ) : null}

      <Text variant="footnote" color="textMuted" style={{ alignSelf: 'flex-start' }}>
        * Obavezno polje
      </Text>

      <TextInput
        label="Email"
        required
        value={email}
        onChangeText={setEmail}
        placeholder="ime@primer.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        state={errors.email ? 'error' : 'default'}
        error={errors.email}
      />
      <TextInput
        label="Šifra"
        required
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        state={errors.password ? 'error' : 'default'}
        error={errors.password}
      />

      <View style={{ gap: space.md, width: '100%' }}>
        <Button label="Prijavi se" onPress={onSubmit} loading={loading} />
        <Button label="Registracija" variant="secondary" onPress={() => router.push('/(auth)/register')} />
      </View>

      <Text
        variant="footnote"
        color="primary"
        onPress={() => router.push('/(auth)/forgot-password')}
      >
        Zaboravili ste lozinku?
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    width: '100%',
    backgroundColor: colors.errorLight,
    borderRadius: radii.input,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
  },
});
