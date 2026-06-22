import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { donationApi } from '@/api/sdk';
import { Button, ErrorView, Screen, Text, TopAppBar } from '@/components';
import { img } from '@/lib/images';
import { formatDate, rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space, stroke } from '@/theme/tokens';

export default function DonacijaDetalji() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error, reload } = useAsync(() => donationApi.get(id), [id]);
  const d = data?.donation;

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Detalji donacije"
        back
        notificationsHref="/(prodavac)/notifications"
        settingsHref="/(prodavac)/settings"
      />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : error || !d ? (
        <ErrorView message={error ?? 'Donacija nije pronađena.'} onRetry={reload} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <Image source={img(d.recipient?.logoKey ?? 'donation')} style={styles.image} contentFit="cover" />

          <View style={styles.card}>
            <View style={styles.headRow}>
              <Text variant="headline" color="text">
                {d.recipient?.name ?? 'Prihvatilište'}
              </Text>
              <Text variant="footnote" color="textMuted">
                {formatDate(d.createdAt)}
              </Text>
            </View>
            {d.items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <Text variant="body" color="text">
                  {it.name} {it.qty}
                </Text>
                <Text variant="body" color="textMuted">
                  {it.value != null ? `~${rsd(it.value)}` : ''}
                </Text>
              </View>
            ))}
            <View style={[styles.itemRow, styles.totalRow]}>
              <Text variant="headline" color="text">
                Procenjena vrednost
              </Text>
              <Text variant="headline" color="primary">
                {rsd(d.estValue)}
              </Text>
            </View>
          </View>

          <Button label="Preuzmi potvrdu" onPress={() => router.push('/(prodavac)/potvrda-preuzimanja')} />
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
