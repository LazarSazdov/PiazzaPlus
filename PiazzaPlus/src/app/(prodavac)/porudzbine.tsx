import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { reservationApi } from '@/api/sdk';
import { Reservation, ReservationStatus } from '@/api/types';
import { Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space } from '@/theme/tokens';

const STATUS_LABEL: Record<ReservationStatus, string> = {
  NA_CEKANJU: 'Na čekanju',
  POTVRDJENA: 'Potvrđena',
  OTKAZANA: 'Odbijena',
};
const STATUS_COLOR: Record<ReservationStatus, string> = {
  NA_CEKANJU: colors.warning,
  POTVRDJENA: colors.success,
  OTKAZANA: colors.error,
};

export default function Porudzbine() {
  const toast = useToast();
  const { data, loading, setData } = useAsync(() => reservationApi.incoming(), []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const reservations = data?.reservations ?? [];

  const setStatus = async (r: Reservation, status: ReservationStatus) => {
    setBusyId(r.id);
    try {
      const { reservation } = await reservationApi.setStatus(r.id, status);
      setData({ reservations: reservations.map((x) => (x.id === r.id ? { ...x, status: reservation.status } : x)) });
      toast.show(status === 'POTVRDJENA' ? 'Porudžbina potvrđena.' : 'Porudžbina odbijena.', status === 'POTVRDJENA' ? 'success' : 'info');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Porudžbine" back />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : reservations.length === 0 ? (
        <Text variant="body" color="textMuted" center style={{ marginTop: space.xl }}>
          Nema novih porudžbina.
        </Text>
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.md }}>
          {reservations.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.headRow}>
                <Text variant="headline" color="text">
                  {r.product?.name ?? 'Proizvod'}
                </Text>
                <Text variant="footnote" style={{ color: STATUS_COLOR[r.status] }}>
                  {STATUS_LABEL[r.status]}
                </Text>
              </View>
              <Text variant="subhead" color="textMuted">
                {r.buyer?.name ?? 'Kupac'} · {r.quantity} {r.product?.unit} · {rsd(r.total)}
              </Text>
              {r.status === 'NA_CEKANJU' ? (
                <View style={styles.actions}>
                  <View style={{ flex: 1 }}>
                    <Button label="Potvrdi" onPress={() => setStatus(r, 'POTVRDJENA')} loading={busyId === r.id} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Odbij" variant="dangerOutline" onPress={() => setStatus(r, 'OTKAZANA')} />
                  </View>
                </View>
              ) : null}
            </View>
          ))}
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.sm },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.xs },
});
