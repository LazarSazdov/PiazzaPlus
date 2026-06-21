import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { profileApi } from '@/api/sdk';
import { Button, Screen, Text, Toggle, TopAppBar, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

export default function GlasPristupacnost() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const initial = (user?.settings ?? {}) as Record<string, unknown>;

  const [voice, setVoice] = useState(initial.voiceCommands !== false);
  const [largeText, setLargeText] = useState(Boolean(initial.largeText));
  const [highContrast, setHighContrast] = useState(Boolean(initial.highContrast));
  const [readback, setReadback] = useState(Boolean(initial.readback));
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      const { user: updated } = await profileApi.update({
        settings: { ...initial, voiceCommands: voice, largeText, highContrast, readback },
      });
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
      <TopAppBar title="Glas i pristupačnost" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="body" color="textMuted">
          Prilagodite aplikaciju za lakše korišćenje.
        </Text>
        <View style={styles.section}>
          <Toggle label="Glasovne komande" checked={voice} onChange={setVoice} />
          <Toggle label="Veći tekst" checked={largeText} onChange={setLargeText} />
          <Toggle label="Visok kontrast" checked={highContrast} onChange={setHighContrast} />
          <Toggle label="Čitanje sadržaja naglas" checked={readback} onChange={setReadback} />
        </View>
        <Button label="Sačuvaj" onPress={onSave} loading={saving} />
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.xs },
});
