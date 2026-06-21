import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import { listingApi } from '@/api/sdk';
import { Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { colors, space } from '@/theme/tokens';

export default function Brisanje() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    setLoading(true);
    try {
      await listingApi.remove(id);
      toast.show('Oglas je obrisan.', 'info');
      router.replace('/(prodavac)/oglasi');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Brisanje oglasa" back />
      <Screen center contentStyle={{ gap: space.lg }}>
        <Feather name="trash-2" size={56} color={colors.error} />
        <Text variant="title3" color="text" center>
          Obrisati oglas?
        </Text>
        <Text variant="body" color="textMuted" center>
          Ova radnja je trajna i ne može se opozvati.
        </Text>
        <View style={{ gap: space.md, width: '100%' }}>
          <Button label="Da, obriši" variant="danger" onPress={onDelete} loading={loading} />
          <Button label="Ne, otkaži" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    </Screen>
  );
}
