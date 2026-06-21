import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, ImagePlaceholder, Screen, Text, TopAppBar } from '@/components';
import { useAdDraft } from '@/store/adDraft';
import { space } from '@/theme/tokens';

export default function DodavanjeSlike() {
  const { draft } = useAdDraft();

  return (
    <Screen padded={false}>
      <TopAppBar title="Dodavanje slike" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="body" color="textMuted">
          Dodajte fotografiju proizvoda da privučete više kupaca.
        </Text>

        {draft.imageUri ? (
          <Image source={{ uri: draft.imageUri }} style={styles.hero} contentFit="cover" />
        ) : (
          <ImagePlaceholder label="[Nema slike]" height={300} />
        )}

        <View style={{ gap: space.md }}>
          <Button label="Uslikaj" onPress={() => router.push('/(prodavac)/slikanje')} />
          <Button label="Izaberi iz galerije" variant="secondary" onPress={() => router.push('/(prodavac)/galerija')} />
        </View>

        <View style={{ gap: space.md }}>
          <Button label="Sačuvaj i nastavi" onPress={() => router.back()} disabled={!draft.imageUri} />
          <Button label="Preskoči" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#e5e7eb' },
});
