import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ApiError, uploadImage } from '@/api/client';
import { listingApi } from '@/api/sdk';
import { Button, Dropdown, Screen, Text, TextInput, TopAppBar, useToast } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { useAdDraft } from '@/store/adDraft';
import { colors, radii, space } from '@/theme/tokens';

const CATEGORIES = [
  { value: 'Voće', label: 'Voće' },
  { value: 'Povrće', label: 'Povrće' },
  { value: 'Ostalo', label: 'Ostalo' },
];

export default function FormaIzmenu() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const { draft, patch } = useAdDraft();
  const { data, loading } = useAsync(() => listingApi.get(id), [id]);

  const [form, setForm] = useState({ title: '', category: 'Povrće', quantity: '', price: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.listing) {
      const l = data.listing;
      setForm({ title: l.title, category: l.category, quantity: l.quantity, price: String(l.price), description: l.description });
    }
  }, [data]);

  // Start with no pending new image (avoid a leftover from another flow).
  useEffect(() => {
    patch({ imageUri: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSave = async () => {
    if (!form.title.trim()) {
      toast.show('Unesite naziv.', 'error');
      return;
    }
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (draft.imageUri) imageUrl = await uploadImage(draft.imageUri);
      await listingApi.update(id, {
        title: form.title.trim(),
        category: form.category,
        quantity: form.quantity.trim(),
        price: Number(form.price) || 0,
        description: form.description.trim(),
        ...(imageUrl ? { imageUrl } : {}),
      });
      patch({ imageUri: undefined });
      router.replace('/(prodavac)/prikaz-potvrde?msg=Izmene%20su%20sačuvane');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Izmena oglasa" back />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <Text variant="footnote" color="textMuted">
            * Obavezno polje
          </Text>
          <Dropdown label="Kategorija" required value={form.category} options={CATEGORIES} onChange={set('category')} />
          <TextInput label="Naziv" required value={form.title} onChangeText={set('title')} placeholder="Naziv proizvoda" />
          <TextInput label="Količina" value={form.quantity} onChangeText={set('quantity')} placeholder="npr. 20 kg" />
          <TextInput label="Cena (RSD)" required value={form.price} onChangeText={set('price')} placeholder="0" keyboardType="numeric" />
          <TextInput label="Opis" value={form.description} onChangeText={set('description')} placeholder="Kratak opis" multiline />

          {draft.imageUri ? (
            <View style={{ gap: space.sm }}>
              <Text variant="subhead" color="text">
                Nova slika
              </Text>
              <Image source={{ uri: draft.imageUri }} style={{ width: '100%', height: 180, borderRadius: radii.card, backgroundColor: colors.border }} contentFit="cover" />
            </View>
          ) : null}

          <View style={{ gap: space.md }}>
            <Button label={saving ? 'Čuvanje...' : 'Sačuvaj izmene'} onPress={onSave} loading={saving} />
            <Button label={draft.imageUri ? 'Promeni sliku' : 'Dodaj sliku'} variant="secondary" onPress={() => router.push('/(prodavac)/dodavanje-slike')} />
            <Button label="Otkaži" variant="secondary" onPress={() => router.back()} />
          </View>
        </Screen>
      )}
    </Screen>
  );
}
