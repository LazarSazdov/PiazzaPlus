import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { listingApi } from '@/api/sdk';
import { Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { rsd } from '@/lib/format';
import { colors, radii, space } from '@/theme/tokens';

export default function PotvrdaSnizenja() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const { data, loading } = useAsync(() => listingApi.discountSuggestion(id), [id]);
  const [saving, setSaving] = useState(false);

  const onActivate = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await listingApi.setDiscount(id, data.recommendedPct, 'DYNAMIC');
      router.replace('/(prodavac)/prikaz-potvrde?msg=Dinamičko%20sniženje%20je%20aktivirano');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Automatsko sniženje" back />
      {loading || !data ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <View style={styles.banner}>
            <Feather name="zap" size={24} color={colors.primary} />
            <Text variant="body" color="primaryDark" style={{ flex: 1 }}>
              {data.reason}
            </Text>
          </View>

          <View style={styles.prices}>
            <View>
              <Text variant="footnote" color="textMuted">
                Trenutna cena
              </Text>
              <Text variant="headline" color="textMuted" style={{ textDecorationLine: 'line-through' }}>
                {rsd(data.currentPrice)}
              </Text>
            </View>
            <Feather name="arrow-right" size={20} color={colors.textMuted} />
            <View>
              <Text variant="footnote" color="textMuted">
                Nova cena
              </Text>
              <Text variant="title3" color="primary">
                {rsd(data.newPrice)}
              </Text>
            </View>
          </View>

          <View style={{ gap: space.md }}>
            <Button label={`Aktiviraj sniženje (-${data.recommendedPct}%)`} onPress={onActivate} loading={saving} />
            <Button label="Otkaži" variant="secondary" onPress={() => router.back()} />
          </View>
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: space.md, backgroundColor: colors.primaryLight, borderRadius: radii.card, padding: space.lg },
  prices: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg },
});
