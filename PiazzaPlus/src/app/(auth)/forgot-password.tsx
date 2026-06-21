import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AuthLogo } from '@/components/AuthLogo';
import { Button, Screen, Text, TextInput } from '@/components';
import { space } from '@/theme/tokens';

export default function ForgotPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const onSubmit = () => {
    const next: typeof errors = {};
    if (password.length < 4) next.password = 'Šifra mora imati bar 4 znaka.';
    if (confirm !== password) next.confirm = 'Šifre se ne poklapaju.';
    setErrors(next);
    if (Object.keys(next).length) return;
    router.replace('/(auth)/email-sent');
  };

  return (
    <Screen scroll center contentStyle={{ gap: space.lg, paddingHorizontal: space.xl }}>
      <AuthLogo subtitle="Postavite novu lozinku" />

      <Text variant="footnote" color="textMuted" style={{ alignSelf: 'flex-start' }}>
        * Obavezno polje
      </Text>

      <TextInput label="Nova šifra" required value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry state={errors.password ? 'error' : 'default'} error={errors.password} />
      <TextInput label="Potvrda nove šifre" required value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry state={errors.confirm ? 'error' : 'default'} error={errors.confirm} />

      <View style={{ gap: space.md, width: '100%' }}>
        <Button label="Promeni lozinku" onPress={onSubmit} />
        <Button label="Otkaži" variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
