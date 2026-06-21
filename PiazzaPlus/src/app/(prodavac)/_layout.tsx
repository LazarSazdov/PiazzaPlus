import { Stack } from 'expo-router';
import { AdDraftProvider } from '@/store/adDraft';
import { colors } from '@/theme/tokens';

/** Prodavac stack; the (tabs) group holds the 4 bottom-nav screens. The AdDraft
 * provider carries the in-progress ad across the create/edit flow. */
export default function ProdavacLayout() {
  return (
    <AdDraftProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AdDraftProvider>
  );
}
