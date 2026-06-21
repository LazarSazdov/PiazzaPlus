import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { profileApi } from '@/api/sdk';
import { Button, Checkbox, Radio, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

export default function ProdavacSettings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const initial = (user?.settings ?? {}) as Record<string, unknown>;

  const [orderNotif, setOrderNotif] = useState(initial.orderNotif !== false);
  const [donationNotif, setDonationNotif] = useState(initial.donationNotif !== false);
  const [predictionNotif, setPredictionNotif] = useState(Boolean(initial.predictionNotif));
  const [language, setLanguage] = useState<string>((initial.language as string) || 'sr');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      const { user: updated } = await profileApi.update({
        settings: { ...initial, orderNotif, donationNotif, predictionNotif, language },
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
      <TopAppBar title="Podešavanja" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <View style={styles.section}>
          <Text variant="headline" color="text">
            Obaveštenja
          </Text>
          <Checkbox label="Nove porudžbine" checked={orderNotif} onChange={setOrderNotif} />
          <Checkbox label="Donacije" checked={donationNotif} onChange={setDonationNotif} />
          <Checkbox label="AI predikcije viška" checked={predictionNotif} onChange={setPredictionNotif} />
        </View>
        <View style={styles.section}>
          <Text variant="headline" color="text">
            Jezik
          </Text>
          <Radio label="Srpski" checked={language === 'sr'} onChange={() => setLanguage('sr')} />
          <Radio label="English" checked={language === 'en'} onChange={() => setLanguage('en')} />
        </View>
        <View style={{ gap: space.md }}>
          <Button label="Sačuvaj" onPress={onSave} loading={saving} />
          <Button label="Otkaži" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.xs },
});
