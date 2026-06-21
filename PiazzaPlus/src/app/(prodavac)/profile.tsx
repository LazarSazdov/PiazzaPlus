import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Avatar, Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

export default function ProdavacProfile() {
  const { user, switchRole, logout } = useAuth();
  const toast = useToast();
  const [switching, setSwitching] = useState(false);

  const onLogout = async () => {
    await logout();
    router.replace('/splash');
  };

  const onSwitchToBuyer = async () => {
    setSwitching(true);
    try {
      await switchRole();
      router.replace('/(kupac)/home');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setSwitching(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Moj profil" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <View style={styles.header}>
          <Avatar imageKey={user?.avatarKey ?? 'prodavac'} size={120} />
          <Text variant="title3" color="text">
            {user?.name}
          </Text>
          <Text variant="subhead" color="textMuted">
            {user?.email}
          </Text>
          {user?.phone ? (
            <Text variant="subhead" color="textMuted">
              {user.phone}
            </Text>
          ) : null}
        </View>

        {user?.bio ? (
          <View style={styles.card}>
            <Text variant="body" color="textMuted">
              {user.bio}
            </Text>
          </View>
        ) : null}

        <View style={{ gap: space.md }}>
          <Button label="Izmeni podatke" onPress={() => router.push('/(prodavac)/profile-edit')} />
          <Button label="Statistika prodaje" variant="secondary" onPress={() => router.push('/(prodavac)/statistika')} />
          <Button label="Glas i pristupačnost" variant="secondary" onPress={() => router.push('/(prodavac)/glas-pristupacnost')} />
          <Button label="Pređi na nalog kupca" variant="secondary" onPress={onSwitchToBuyer} loading={switching} />
          <Button label="Odjavi se" variant="dangerOutline" onPress={onLogout} />
        </View>
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 6 },
  card: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg },
});
