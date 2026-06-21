import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { profileApi } from '@/api/sdk';
import { Button, Checkbox, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { allergyLabel } from '@/lib/format';
import { colors, radii, space } from '@/theme/tokens';

const DIETS = [
  { key: 'vegetarijanska', label: 'Vegetarijanska' },
  { key: 'veganska', label: 'Veganska' },
  { key: 'bezglutenska', label: 'Bez glutena' },
  { key: 'bezlaktozna', label: 'Bez laktoze' },
];

export default function DietFilter() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>(user?.dietary ?? []);
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) =>
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const onSave = async () => {
    setSaving(true);
    try {
      const { user: updated } = await profileApi.update({ dietary: selected });
      setUser(updated);
      toast.show('Sačuvano', 'success');
      router.back();
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Filter ishrane" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="body" color="textMuted">
          Izaberite tip ishrane da prilagodimo predloge recepata i ponude.
        </Text>

        <View style={styles.section}>
          {DIETS.map((d) => (
            <Checkbox key={d.key} label={d.label} checked={selected.includes(d.key)} onChange={() => toggle(d.key)} />
          ))}
        </View>

        <Pressable style={styles.linkRow} onPress={() => router.push('/(kupac)/allergies')}>
          <Feather name="alert-circle" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="body" color="text">
              Alergije
            </Text>
            {user?.allergies?.length ? (
              <Text variant="footnote" color="textMuted">
                {user.allergies.map(allergyLabel).join(', ')}
              </Text>
            ) : null}
          </View>
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </Pressable>

        <Button label="Sačuvaj" onPress={onSave} loading={saving} />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.xs },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
  },
});
