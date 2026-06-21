import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { profileApi } from '@/api/sdk';
import { Button, Chip, Dropdown, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { allergyLabel } from '@/lib/format';
import { space } from '@/theme/tokens';

const ALLERGENS = [
  { value: 'mleko', label: 'Mleko' },
  { value: 'jaja', label: 'Jaja' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'orasi', label: 'Orašasti plodovi' },
  { value: 'soja', label: 'Soja' },
];

export default function Allergies() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>(user?.allergies ?? []);
  const [picker, setPicker] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const add = (value: string) => {
    setPicker(value);
    setSelected((s) => (s.includes(value) ? s : [...s, value]));
  };
  const remove = (value: string) => setSelected((s) => s.filter((v) => v !== value));

  const onSave = async () => {
    setSaving(true);
    try {
      const { user: updated } = await profileApi.update({ allergies: selected });
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
      <TopAppBar title="Alergije" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="body" color="textMuted">
          Dodajte alergene koje želite da izbegavamo u predlozima.
        </Text>

        <Dropdown label="Dodaj alergen" placeholder="Izaberite alergen" value={picker} options={ALLERGENS} onChange={add} />

        {selected.length ? (
          <View style={styles.chips}>
            {selected.map((a) => (
              <Chip key={a} label={`${allergyLabel(a)}  ✕`} selected onPress={() => remove(a)} />
            ))}
          </View>
        ) : (
          <Text variant="footnote" color="textMuted">
            Nema dodatih alergena.
          </Text>
        )}

        <Button label="Sačuvaj" onPress={onSave} loading={saving} />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
