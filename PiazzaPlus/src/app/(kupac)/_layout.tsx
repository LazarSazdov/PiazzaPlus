import { Stack } from 'expo-router';
import { colors } from '@/theme/tokens';

/** Kupac stack: the (tabs) group holds the 5 bottom-nav screens; everything else
 * here is a detail screen pushed over the tabs. */
export default function KupacLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
