import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { donationApi } from '@/api/sdk';
import { Button, Screen, Text, TopAppBar } from '@/components';
import { images, img } from '@/lib/images';
import { useAsync } from '@/lib/useAsync';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

export default function Donacije() {
  const { user } = useAuth();
  const { data, loading } = useAsync(() => donationApi.recipients(), []);
  const recipients = data?.recipients ?? [];

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Donacije"
        avatarKey={user?.avatarKey ?? 'prodavac'}
        profileHref="/(prodavac)/profile"
        notificationsHref="/(prodavac)/notifications"
        settingsHref="/(prodavac)/settings"
      />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="body" color="textMuted">
          Donirajte višak proizvoda lokalnim prihvatilištima i smanjite bacanje hrane.
        </Text>

        <Image source={images.map_prihvatilista} style={styles.map} contentFit="cover" />

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          recipients.map((r) => (
            <View key={r.id} style={styles.recipient}>
              <Image source={img(r.logoKey)} style={styles.logo} contentFit="contain" />
              <View style={{ flex: 1 }}>
                <Text variant="headline" color="text">
                  {r.name}
                </Text>
                <Text variant="footnote" color="textMuted">
                  {r.city}
                </Text>
              </View>
              <Feather name="heart" size={20} color={colors.error} />
            </View>
          ))
        )}

        <View style={{ gap: space.md }}>
          <Button label="Doniraj višak" onPress={() => router.push('/(prodavac)/chatbot')} />
          <Button label="Generiši izveštaj" variant="secondary" onPress={() => router.push('/(prodavac)/izvestaj')} />
        </View>
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: 200, borderRadius: radii.card, backgroundColor: colors.border },
  recipient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
  },
  logo: { width: 44, height: 44, borderRadius: radii.thumb, backgroundColor: colors.surface },
});
