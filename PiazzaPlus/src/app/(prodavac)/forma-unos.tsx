import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Dropdown, Screen, Text, TextInput, Toggle, TopAppBar, useToast } from '@/components';
import { useAdDraft } from '@/store/adDraft';
import { colors, radii, space } from '@/theme/tokens';

const CATEGORIES = [
  { value: 'Voće', label: 'Voće' },
  { value: 'Povrće', label: 'Povrće' },
  { value: 'Ostalo', label: 'Ostalo' },
];

export default function FormaUnos() {
  const { draft, patch } = useAdDraft();
  const toast = useToast();

  const onPostavi = () => {
    if (!draft.title.trim()) {
      toast.show('Unesite naziv proizvoda.', 'error');
      return;
    }
    if (!draft.price.trim() || Number(draft.price) <= 0) {
      toast.show('Unesite cenu.', 'error');
      return;
    }
    router.push('/(prodavac)/potvrda-oglasa');
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Tekstualni unos" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="footnote" color="textMuted">
          * Obavezno polje
        </Text>

        <Dropdown label="Kategorija" required value={draft.category} options={CATEGORIES} onChange={(v) => patch({ category: v })} />
        <TextInput label="Naziv" required value={draft.title} onChangeText={(v) => patch({ title: v })} placeholder="npr. Paradajz domaći" maxLength={30} helper={`${draft.title.length}/30`} />
        <TextInput label="Količina" value={draft.quantity} onChangeText={(v) => patch({ quantity: v })} placeholder="npr. 20 kg" maxLength={10} helper={`${draft.quantity.length}/10`} />
        <TextInput label="Opis" value={draft.description} onChangeText={(v) => patch({ description: v })} placeholder="Kratak opis proizvoda" multiline />

        <Toggle label="Omogući dinamičko sniženje" checked={draft.discountEnabled} onChange={(v) => patch({ discountEnabled: v })} />

        <TextInput label="Cena (RSD)" required value={draft.price} onChangeText={(v) => patch({ price: v })} placeholder="0" keyboardType="numeric" />

        {draft.imageUri ? (
          <View style={{ gap: space.sm }}>
            <Text variant="subhead" color="text">
              Slika proizvoda
            </Text>
            <Image source={{ uri: draft.imageUri }} style={{ width: '100%', height: 180, borderRadius: radii.card, backgroundColor: colors.border }} contentFit="cover" />
          </View>
        ) : null}

        <View style={{ gap: space.md }}>
          <Button label="Postavi oglas" onPress={onPostavi} />
          <Button label={draft.imageUri ? 'Promeni sliku' : 'Dodaj sliku'} variant="secondary" onPress={() => router.push('/(prodavac)/dodavanje-slike')} />
        </View>
      </Screen>
    </Screen>
  );
}
