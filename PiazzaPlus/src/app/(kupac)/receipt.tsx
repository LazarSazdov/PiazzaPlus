import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { receiptApi } from '@/api/sdk';
import { ReceiptItem } from '@/api/types';
import { Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { img } from '@/lib/images';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space, stroke } from '@/theme/tokens';

interface ReceiptData {
  store: string;
  date: string;
  items: ReceiptItem[];
  total: number;
  imageKey: string;
}

export default function ReceiptDetails() {
  const { id, scan } = useLocalSearchParams<{ id?: string; scan?: string }>();
  const isScan = scan === '1';
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const { data, loading } = useAsync<ReceiptData>(async () => {
    if (isScan) {
      const { parsed } = await receiptApi.scan();
      return parsed;
    }
    const { receipt } = await receiptApi.get(id!);
    return { store: receipt.store, date: receipt.date, items: receipt.items, total: receipt.total, imageKey: receipt.imageKey ?? 'racun' };
  }, [id, isScan]);

  const onSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await receiptApi.save(data);
      toast.show('Račun sačuvan u istoriju.', 'success');
      router.replace('/(kupac)/history');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Detalji računa" back />
      {loading || !data ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <Image source={img(data.imageKey)} style={styles.image} contentFit="cover" />

          <View style={styles.card}>
            <View style={styles.headRow}>
              <Text variant="headline" color="text">
                {data.store}
              </Text>
              <Text variant="footnote" color="textMuted">
                {data.date}
              </Text>
            </View>
            {data.items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <Text variant="body" color="text">
                  {it.name}
                </Text>
                <Text variant="body" color="textMuted">
                  {rsd(it.price)}
                </Text>
              </View>
            ))}
            <View style={[styles.itemRow, styles.totalRow]}>
              <Text variant="headline" color="text">
                Ukupno
              </Text>
              <Text variant="headline" color="primary">
                {rsd(data.total)}
              </Text>
            </View>
          </View>

          {isScan ? <Button label="Sačuvaj u istoriju" onPress={onSave} loading={saving} /> : null}
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 170, borderRadius: radii.card, backgroundColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.sm },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRow: { borderTopWidth: stroke.hair, borderTopColor: colors.border, paddingTop: space.sm, marginTop: space.xs },
});
