import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Screen, Text } from '@/components';
import { colors, space } from '@/theme/tokens';

export default function EmailSent() {
  return (
    <Screen center contentStyle={{ gap: space.lg, paddingHorizontal: space.xl }}>
      <View style={{ alignItems: 'center', gap: space.md, width: '100%' }}>
        <Feather name="check-circle" size={64} color={colors.success} />
        <Text variant="title2" color="text" center>
          Poruka poslata
        </Text>
        <Text variant="body" color="textMuted" center>
          Proverite vaš email za dalje instrukcije za promenu lozinke.
        </Text>
      </View>
      <Button label="U redu" onPress={() => router.replace('/(auth)/login')} />
    </Screen>
  );
}
