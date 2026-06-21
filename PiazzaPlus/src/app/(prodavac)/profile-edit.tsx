import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import { profileApi } from '@/api/sdk';
import { Avatar, Button, Screen, TextInput, TopAppBar, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { space } from '@/theme/tokens';

export default function ProdavacProfileEdit() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!name.trim()) {
      toast.show('Ime je obavezno.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { user: updated } = await profileApi.update({ name: name.trim(), phone: phone.trim(), bio: bio.trim() });
      setUser(updated);
      setTimeout(() => {
        toast.show('Sačuvano', 'success');
        router.back();
      }, 300);
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška pri čuvanju.', 'error');
      setSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Izmena podataka" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <View style={{ alignItems: 'center' }}>
          <Avatar imageKey={user?.avatarKey ?? 'prodavac'} size={88} />
        </View>
        <TextInput label="Ime" required value={name} onChangeText={setName} placeholder="Ime i prezime" />
        <TextInput label="Telefon" value={phone} onChangeText={setPhone} placeholder="+381 6_ ___ ____" keyboardType="phone-pad" />
        <TextInput label="O meni" value={bio} onChangeText={setBio} placeholder="Kratak opis" multiline />
        <View style={{ gap: space.md }}>
          <Button label={saving ? 'Čuvanje...' : 'Sačuvaj izmene'} onPress={onSave} loading={saving} />
          <Button label="Otkaži" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    </Screen>
  );
}
