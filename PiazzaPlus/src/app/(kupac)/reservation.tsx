import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { reservationApi } from '@/api/sdk';
import { Button, Screen, Text, TopAppBar } from '@/components';
import { img } from '@/lib/images';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space } from '@/theme/tokens';

export default function ReservationConfirmed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useAsync(() => reservationApi.list(), [id]);
  const reservation = data?.reservations.find((r) => r.id === id);

  return (
    <Screen padded={false}>
      <TopAppBar title="Rezervacija" back />
      {loading || !reservation ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded center contentStyle={{ gap: space.lg }}>
          <Feather name="check-circle" size={64} color={colors.success} />
          <Text variant="title2" color="text" center>
            Rezervacija uspešna!
          </Text>
          <Text variant="body" color="textMuted" center>
            Vaša porudžbina je poslata prodavcu na potvrdu.
          </Text>

          <View style={styles.card}>
            <Image source={img(reservation.product?.imageKey)} style={styles.image} contentFit="cover" />
            <View style={styles.meta}>
              <Text variant="headline" color="text">
                {reservation.product?.name}
              </Text>
              <Text variant="subhead" color="textMuted">
                Količina: {reservation.quantity} {reservation.product?.unit}
              </Text>
              <Text variant="title3" color="primary">
                {rsd(reservation.total)}
              </Text>
            </View>
          </View>

          <View style={{ gap: space.md, width: '100%' }}>
            <Button label="U redu" onPress={() => router.replace(`/(kupac)/reservation-status?id=${reservation.id}`)} />
            <Button
              label="Otkaži rezervaciju"
              variant="dangerOutline"
              onPress={() => router.push(`/(kupac)/reservation-cancel?id=${reservation.id}`)}
            />
          </View>
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.cardLg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 180, backgroundColor: colors.border },
  meta: { padding: space.lg, gap: 4 },
});
