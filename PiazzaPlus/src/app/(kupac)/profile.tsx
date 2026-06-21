import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { Avatar, Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAuth } from '@/store/auth';
import { allergyLabel, dietLabel } from '@/lib/format';
import { colors, radii, space } from '@/theme/tokens';

export default function KupacProfile() {
  const { user, becomeSeller, logout } = useAuth();
  const toast = useToast();
  const [switching, setSwitching] = useState(false);

  const onBecomeSeller = async () => {
    setSwitching(true);
    try {
      await becomeSeller();
      toast.show('Prešli ste na nalog prodavca.', 'success');
      router.replace('/(prodavac)/pocetna');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
      setSwitching(false);
    }
  };

  const onLogout = async () => {
    await logout();
    router.replace('/splash');
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Moj profil" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <View style={styles.header}>
          <Avatar imageKey={user?.avatarKey ?? 'kupac'} size={120} />
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

        {(user?.dietary?.length || user?.allergies?.length) ? (
          <View style={styles.card}>
            {user.dietary.length ? (
              <Text variant="subhead" color="text">
                Ishrana: {user.dietary.map(dietLabel).join(', ')}
              </Text>
            ) : null}
            {user.allergies.length ? (
              <Text variant="subhead" color="text">
                Alergije: {user.allergies.map(allergyLabel).join(', ')}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={{ gap: space.md }}>
          <Button label="Izmeni podatke" onPress={() => router.push('/(kupac)/profile-edit')} />
          <Button label="Filter ishrane" variant="secondary" onPress={() => router.push('/(kupac)/diet-filter')} />
          <Button label="Postani prodavac" variant="secondary" onPress={onBecomeSeller} loading={switching} />
          <Button label="Odjavi se" variant="dangerOutline" onPress={onLogout} />
        </View>
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 6 },
  card: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.sm },
});
