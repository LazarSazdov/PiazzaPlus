import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { donationApi } from '@/api/sdk';
import { Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { img } from '@/lib/images';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space, stroke } from '@/theme/tokens';

export default function Izvestaj() {
  const toast = useToast();
  const { data, loading } = useAsync(() => donationApi.report(), []);
  const report = data?.report;

  return (
    <Screen padded={false}>
      <TopAppBar title="Izveštaj za donacije" back />
      {loading || !report ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <View style={styles.summary}>
            <Text variant="footnote" color="textMuted">
              Period: {report.period}
            </Text>
            <View style={styles.summaryRow}>
              <Summary value={String(report.count)} label="Donacija" />
              <Summary value={rsd(report.totalValue)} label="Procenjena vrednost" />
            </View>
          </View>

          <Text variant="headline" color="text">
            Stavke
          </Text>
          {report.donations.length === 0 ? (
            <Text variant="body" color="textMuted">
              Još uvek nemate evidentiranih donacija.
            </Text>
          ) : (
            report.donations.map((d) => (
              <Pressable key={d.id} style={styles.row} onPress={() => router.push(`/(prodavac)/donacija-detalji?id=${d.id}`)}>
                <Image source={img(d.recipient?.logoKey)} style={styles.logo} contentFit="contain" />
                <View style={{ flex: 1 }}>
                  <Text variant="body" color="text">
                    {d.recipient?.name ?? 'Prihvatilište'}
                  </Text>
                  <Text variant="footnote" color="textMuted">
                    {d.items.map((it) => `${it.name} (${it.qty})`).join(', ')}
                  </Text>
                </View>
                <Text variant="subhead" color="primary">
                  {rsd(d.estValue)}
                </Text>
              </Pressable>
            ))
          )}

          <View style={{ gap: space.md }}>
            <Button label="Preuzmi PDF" onPress={() => router.push('/(prodavac)/potvrda-preuzimanja')} />
            <Button label="Pošalji poreskoj upravi" variant="secondary" onPress={() => toast.show('Izveštaj poslat poreskoj upravi.', 'success')} />
          </View>
        </Screen>
      )}
    </Screen>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text variant="title3" color="primary">
        {value}
      </Text>
      <Text variant="footnote" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.md },
  summaryRow: { flexDirection: 'row', gap: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: stroke.hair,
    borderColor: colors.border,
    padding: space.md,
  },
  logo: { width: 40, height: 40, borderRadius: radii.thumb },
});
