/**
 * Inter font wiring. We load four weights and map a numeric weight token
 * (from `type`) to the matching loaded font family. RN on Android does not
 * synthesize weights reliably, so we always pick an explicit family.
 */
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export const interFontMap = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

export function fontFamilyForWeight(weight: '400' | '500' | '600' | '700'): string {
  switch (weight) {
    case '700':
      return 'Inter_700Bold';
    case '600':
      return 'Inter_600SemiBold';
    case '500':
      return 'Inter_500Medium';
    default:
      return 'Inter_400Regular';
  }
}
