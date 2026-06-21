import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Screen, Text, TopAppBar } from '@/components';
import { useAdDraft } from '@/store/adDraft';
import { colors, space } from '@/theme/tokens';

export default function Galerija() {
  const { patch } = useAdDraft();
  const launched = useRef(false);

  useEffect(() => {
    if (launched.current) return;
    launched.current = true;
    (async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.6,
      });
      if (!result.canceled && result.assets[0]) {
        patch({ imageUri: result.assets[0].uri });
      }
      router.back();
    })();
  }, [patch]);

  return (
    <Screen padded={false}>
      <TopAppBar title="Galerija" back />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md }}>
        <ActivityIndicator color={colors.primary} />
        <Text variant="body" color="textMuted">
          Otvaranje galerije...
        </Text>
      </View>
    </Screen>
  );
}
