import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Screen, Text, TopAppBar } from '@/components';
import { colors, space } from '@/theme/tokens';

export default function PotvrdaPreuzimanja() {
  return (
    <Screen padded={false}>
      <TopAppBar title="Preuzimanje" back />
      <Screen center contentStyle={{ gap: space.lg }}>
        <Feather name="check-circle" size={72} color={colors.success} />
        <Text variant="title2" color="text" center>
          Izveštaj preuzet!
        </Text>
        <Text variant="body" color="textMuted" center>
          PDF izveštaj je sačuvan u folderu Preuzimanja.
        </Text>
        <Button label="U redu" onPress={() => router.replace('/(prodavac)/izvestaj')} />
      </Screen>
    </Screen>
  );
}
