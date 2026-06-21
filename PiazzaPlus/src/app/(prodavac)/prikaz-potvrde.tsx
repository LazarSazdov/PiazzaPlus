import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Screen, Text } from '@/components';
import { colors, space } from '@/theme/tokens';

export default function PrikazPotvrde() {
  const { msg } = useLocalSearchParams<{ msg?: string }>();

  return (
    <Screen center contentStyle={{ gap: space.lg }}>
      <Feather name="check-circle" size={72} color={colors.success} />
      <Text variant="title2" color="text" center>
        Uspešno!
      </Text>
      <Text variant="body" color="textMuted" center>
        {msg || 'Izmene su sačuvane.'}
      </Text>
      <Button label="U redu" onPress={() => router.replace('/(prodavac)/oglasi')} />
    </Screen>
  );
}
