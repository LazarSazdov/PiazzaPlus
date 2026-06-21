import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { statsApi } from '@/api/sdk';
import { BarChart, Dropdown, ListRow, Screen, Text, TopAppBar } from '@/components';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space } from '@/theme/tokens';

const PERIODS = [
  { value: 'week', label: 'Ova nedelja' },
  { value: 'month', label: 'Poslednje 4 nedelje' },
  { value: 'year', label: 'Ova godina' },
] as const;

type Period = (typeof PERIODS)[number]['value'];

export default function Statistika() {
  const [period, setPeriod] = useState<Period>('week');
  const { data, loading } = useAsync(() => statsApi.get(period), [period]);
  const stats = data?.stats;

  return (
    <Screen padded={false}>
      <TopAppBar title="Statistika prodaje" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Dropdown
          label="Period"
          value={period}
          options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
          onChange={(v) => setPeriod(v as Period)}
        />

        {loading || !stats ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
        ) : (
          <>
            <View style={styles.total}>
              <Text variant="footnote" color="textMuted">
                Ukupan promet (potvrđene porudžbine)
              </Text>
              <Text variant="title2" color="primary">
                {rsd(stats.totalValue)}
              </Text>
            </View>

            <BarChart title="Promet po periodu (RSD)" data={stats.series} labels={stats.labels} />

            <Text variant="headline" color="text">
              Najprodavaniji proizvodi
            </Text>
            {stats.top.length === 0 ? (
              <Text variant="body" color="textMuted">
                Još uvek nema potvrđenih prodaja u ovom periodu.
              </Text>
            ) : (
              <View style={styles.list}>
                {stats.top.map((t, i) => (
                  <ListRow key={t.name} title={`${i + 1}. ${t.name}`} subtitle={rsd(t.value)} icon="trending-up" chevron={false} />
                ))}
              </View>
            )}
          </>
        )}
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: 2 },
  list: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
});
