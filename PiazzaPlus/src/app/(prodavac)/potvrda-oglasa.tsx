import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiError, uploadImage } from '@/api/client';
import { listingApi } from '@/api/sdk';
import { Button, ImagePlaceholder, Screen, Text, TopAppBar, useToast } from '@/components';
import { rsd } from '@/lib/format';
import { useAdDraft } from '@/store/adDraft';
import { colors, radii, space } from '@/theme/tokens';

export default function PotvrdaOglasa() {
  const { draft, reset } = useAdDraft();
  const toast = useToast();
  const [publishing, setPublishing] = useState(false);

  const price = Number(draft.price) || 0;

  const onPublish = async () => {
    setPublishing(true);
    try {
      let imageUrl: string | undefined;
      if (draft.imageUri) {
        imageUrl = await uploadImage(draft.imageUri);
      }
      await listingApi.create({
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        quantity: draft.quantity.trim(),
        price,
        imageUrl,
      });
      reset();
      toast.show('Oglas je objavljen.', 'success');
      router.replace('/(prodavac)/oglasi');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška pri objavljivanju.', 'error');
      setPublishing(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Potvrda oglasa" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        {draft.imageUri ? (
          <Image source={{ uri: draft.imageUri }} style={styles.hero} contentFit="cover" />
        ) : (
          <ImagePlaceholder label="[Nema slike]" height={240} />
        )}

        <View style={styles.card}>
          <Text variant="title3" color="text">
            {draft.title || 'Bez naziva'}
          </Text>
          <Row label="Kategorija" value={draft.category} />
          <Row label="Količina" value={draft.quantity || '-'} />
          <Row label="Cena" value={rsd(price)} />
          {draft.discountEnabled ? <Row label="Dinamičko sniženje" value="Uključeno" /> : null}
          {draft.description ? (
            <Text variant="body" color="textMuted">
              {draft.description}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: space.md }}>
          <Button label="Potvrdi i objavi" onPress={onPublish} loading={publishing} />
          <Button label="Izmeni" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="subhead" color="textMuted">
        {label}
      </Text>
      <Text variant="body" color="text">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 240, borderRadius: radii.card, backgroundColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
