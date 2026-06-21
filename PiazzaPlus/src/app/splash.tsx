import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components';
import { colors } from '@/theme/tokens';

/** Brand splash. Auto-advances to Login after ~1.4s (figma/screens-built.md). */
export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/(auth)/login'), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.logo}>
        <Feather name="shopping-bag" size={56} color={colors.surface} />
        <Text variant="title1" color="surface">
          Pijaca Plus
        </Text>
        <Text variant="body" color="primaryLight">
          Sveže sa pijace, na dohvat ruke
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logo: { alignItems: 'center', gap: 8 },
});
