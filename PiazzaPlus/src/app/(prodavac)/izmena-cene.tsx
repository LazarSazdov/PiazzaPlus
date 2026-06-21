import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { listingApi } from '@/api/sdk';
import { Button, Chip, Screen, Text, TextInput, TopAppBar, useToast } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { rsd } from '@/lib/format';
import { colors, radii, space } from '@/theme/tokens';

const PRESETS = [10, 15, 20, 30];

export default function IzmenaCene() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const { data, loading } = useAsync(() => listingApi.get(id), [id]);
  const listing = data?.listing;

  const [discount, setDiscount] = useState('');
  const [saving, setSaving] = useState(false);

  const pct = Math.min(90, Math.max(0, Number(discount) || 0));
  const newPrice = listing ? Math.round(listing.price * (1 - pct / 100)) : 0;

  const onSave = async () => {
    setSaving(true);
    try {
      await listingApi.setDiscount(id, pct, 'MANUAL');
      router.replace('/(prodavac)/prikaz-potvrde?msg=Nova%20cena%20je%20sačuvana');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Izmena cene" back />
      {loading || !listing ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <Text variant="headline" color="text">
            {listing.title}
          </Text>
          <Text variant="subhead" color="textMuted">
            Trenutna cena: {rsd(listing.price)}
          </Text>

          <TextInput label="Procenat sniženja (%)" value={discount} onChangeText={setDiscount} keyboardType="numeric" placeholder="0" />
          <View style={styles.chips}>
            {PRESETS.map((p) => (
              <Chip key={p} label={`-${p}%`} selected={pct === p} onPress={() => setDiscount(String(p))} />
            ))}
          </View>

          <View style={styles.preview}>
            <Text variant="subhead" color="textMuted">
              Nova cena
            </Text>
            <Text variant="title2" color="primary">
              {rsd(newPrice)}
            </Text>
          </View>

          <View style={{ gap: space.md }}>
            <Button label="Sačuvaj cenu" onPress={onSave} loading={saving} />
            <Button label="Otkaži" variant="secondary" onPress={() => router.back()} />
          </View>
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  preview: { backgroundColor: colors.primaryLight, borderRadius: radii.card, padding: space.lg, gap: 2 },
});
