import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { reservationApi } from '@/api/sdk';
import { ReservationStatus } from '@/api/types';
import { Button, Screen, Text, TopAppBar } from '@/components';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space } from '@/theme/tokens';

const STATUS_META: Record<ReservationStatus, { label: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  NA_CEKANJU: { label: 'Na čekanju - čeka potvrdu prodavca', color: colors.warning, icon: 'clock' },
  POTVRDJENA: { label: 'Potvrđena od strane prodavca', color: colors.success, icon: 'check-circle' },
  OTKAZANA: { label: 'Otkazana', color: colors.error, icon: 'x-circle' },
};

export default function ReservationStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useAsync(() => reservationApi.list(), [id]);
  const reservation = data?.reservations.find((r) => r.id === id);

  return (
    <Screen padded={false}>
      <TopAppBar title="Status rezervacije" back />
      {loading || !reservation ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <View style={[styles.badge, { borderColor: STATUS_META[reservation.status].color }]}>
            <Feather name={STATUS_META[reservation.status].icon} size={24} color={STATUS_META[reservation.status].color} />
            <Text variant="headline" style={{ color: STATUS_META[reservation.status].color, flex: 1 }}>
              {STATUS_META[reservation.status].label}
            </Text>
          </View>

          <View style={styles.card}>
            <Row label="Proizvod" value={reservation.product?.name ?? '-'} />
            <Row label="Količina" value={`${reservation.quantity} ${reservation.product?.unit ?? ''}`} />
            <Row label="Ukupno" value={rsd(reservation.total)} />
          </View>

          <View style={{ gap: space.md }}>
            <Button label="Nazad na početnu" onPress={() => router.replace('/(kupac)/home')} />
            {reservation.status !== 'OTKAZANA' ? (
              <Button
                label="Otkaži rezervaciju"
                variant="dangerOutline"
                onPress={() => router.push(`/(kupac)/reservation-cancel?id=${reservation.id}`)}
              />
            ) : null}
          </View>
        </Screen>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="subhead" color="textMuted">
        {label}
      </Text>
      <Text variant="body" color="text">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1.5,
    borderRadius: radii.card,
    padding: space.lg,
    backgroundColor: colors.surface,
  },
  card: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
