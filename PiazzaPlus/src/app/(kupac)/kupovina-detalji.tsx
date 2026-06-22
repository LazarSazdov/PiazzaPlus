import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { receiptApi } from '@/api/sdk';
import { Button, ErrorView, Screen, Text, TopAppBar } from '@/components';
import { img } from '@/lib/images';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space, stroke } from '@/theme/tokens';

export default function KupovinaDetalji() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error, reload } = useAsync(() => receiptApi.get(id), [id]);
  const r = data?.receipt;

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Detalji kupovine"
        back
        notificationsHref="/(kupac)/notifications"
        settingsHref="/(kupac)/settings"
      />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : error || !r ? (
        <ErrorView message={error ?? 'Račun nije pronađen.'} onRetry={reload} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <Image source={img(r.imageKey ?? 'racun')} style={styles.image} contentFit="cover" />

          <View style={styles.card}>
            <View style={styles.headRow}>
              <Text variant="headline" color="text">
                {r.store}
              </Text>
              <Text variant="footnote" color="textMuted">
                {r.date}
              </Text>
            </View>
            {r.items.map((it, i) => (
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
                {rsd(r.total)}
              </Text>
            </View>
          </View>

          <Button label="Kupi ponovo" onPress={() => router.push('/(kupac)/(tabs)/home')} />
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
