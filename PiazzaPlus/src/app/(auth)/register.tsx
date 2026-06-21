import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import { AuthLogo } from '@/components/AuthLogo';
import { Button, Screen, Text, TextInput, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { space } from '@/theme/tokens';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Unesite ime.';
    if (!form.email.trim()) next.email = 'Unesite email.';
    if (form.password.length < 4) next.password = 'Šifra mora imati bar 4 znaka.';
    if (form.confirm !== form.password) next.confirm = 'Šifre se ne poklapaju.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() || undefined });
      router.replace('/(kupac)/home');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška pri registraciji.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingHorizontal: space.xl }}>
      <AuthLogo subtitle="Napravite novi nalog" />

      <Text variant="footnote" color="textMuted" style={{ alignSelf: 'flex-start' }}>
        * Obavezno polje
      </Text>

      <TextInput label="Ime" required value={form.name} onChangeText={set('name')} placeholder="Ime i prezime" state={errors.name ? 'error' : 'default'} error={errors.name} />
      <TextInput label="Email" required value={form.email} onChangeText={set('email')} placeholder="ime@primer.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} state={errors.email ? 'error' : 'default'} error={errors.email} />
      <TextInput label="Šifra" required value={form.password} onChangeText={set('password')} placeholder="••••••••" secureTextEntry state={errors.password ? 'error' : 'default'} error={errors.password} />
      <TextInput label="Potvrdi šifru" required value={form.confirm} onChangeText={set('confirm')} placeholder="••••••••" secureTextEntry state={errors.confirm ? 'error' : 'default'} error={errors.confirm} />
      <TextInput label="Telefon" value={form.phone} onChangeText={set('phone')} placeholder="+381 6_ ___ ____" keyboardType="phone-pad" />

      <View style={{ gap: space.md, width: '100%' }}>
        <Button label="Registruj se" onPress={onSubmit} loading={loading} />
        <Button label="Otkaži" variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
