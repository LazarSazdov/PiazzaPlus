import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import { reservationApi } from '@/api/sdk';
import { Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { colors, space } from '@/theme/tokens';

export default function ReservationCancel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const confirmCancel = async () => {
    setLoading(true);
    try {
      await reservationApi.setStatus(id, 'OTKAZANA');
      toast.show('Rezervacija je otkazana.', 'info');
      router.replace('/(kupac)/home');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Otkazivanje rezervacije" back />
      <Screen center contentStyle={{ gap: space.lg }}>
        <Feather name="alert-triangle" size={56} color={colors.error} />
        <Text variant="title3" color="text" center>
          Da li ste sigurni?
        </Text>
        <Text variant="body" color="textMuted" center>
          Ova radnja će trajno otkazati vašu rezervaciju.
        </Text>
        <View style={{ gap: space.md, width: '100%' }}>
          <Button label="Da, otkaži" variant="danger" onPress={confirmCancel} loading={loading} />
          <Button label="Ne, zadrži" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    </Screen>
  );
}
