import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { donationApi } from '@/api/sdk';
import { Button, OsmMap, Screen, Text, TopAppBar } from '@/components';
import { img } from '@/lib/images';
import { useAsync } from '@/lib/useAsync';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

const NOVI_SAD = { lat: 45.2517, lng: 19.8369 };

export default function Donacije() {
  const { user } = useAuth();
  const { data, loading } = useAsync(() => donationApi.recipients(), []);
  const recipients = data?.recipients ?? [];

  const markers = recipients
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => ({ lat: r.lat!, lng: r.lng!, title: r.name, color: colors.error }));

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

        <OsmMap center={NOVI_SAD} zoom={13} markers={markers} style={styles.map} />

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          recipients.map((r) => (
            <Pressable
              key={r.id}
              style={styles.recipient}
              onPress={() => router.push(`/(prodavac)/chatbot?recipientId=${r.id}&name=${encodeURIComponent(r.name)}`)}
            >
              <Image source={img(r.logoKey)} style={styles.logo} contentFit="contain" />
              <View style={{ flex: 1 }}>
                <Text variant="headline" color="text">
                  {r.name}
                </Text>
                <Text variant="footnote" color="textMuted">
                  {r.note ?? r.city}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </Pressable>
          ))
        )}

        <View style={{ gap: space.md }}>
          <Button label="Doniraj višak" onPress={() => router.push('/(prodavac)/izbor-primaoca')} />
          <Button label="Generiši izveštaj" variant="secondary" onPress={() => router.push('/(prodavac)/izvestaj')} />
        </View>
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: 220, borderRadius: radii.card },
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
