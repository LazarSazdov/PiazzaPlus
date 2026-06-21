import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { listingApi, reservationApi } from '@/api/sdk';
import { Button, Screen, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { useAdDraft } from '@/store/adDraft';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

export default function ProdavacPocetna() {
  const { user } = useAuth();
  const { reset } = useAdDraft();
  const { data: listings } = useAsync(() => listingApi.list(), []);
  const { data: orders } = useAsync(() => reservationApi.incoming(), []);

  const activeCount = listings?.listings.filter((l) => l.active).length ?? 0;
  const pendingCount = orders?.reservations.filter((r) => r.status === 'NA_CEKANJU').length ?? 0;

  const startNewAd = () => {
    reset();
    router.push('/(prodavac)/postavljanje');
  };

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Pijaca Plus"
        avatarKey={user?.avatarKey ?? 'prodavac'}
        profileHref="/(prodavac)/profile"
        notificationsHref="/(prodavac)/notifications"
        settingsHref="/(prodavac)/settings"
      />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="title3" color="text">
          Dobrodošli{user ? `, ${user.name.split(' ')[0]}` : ''}
        </Text>
        <Text variant="body" color="textMuted">
          Ovde upravljate svojim oglasima, pratite porudžbine i donirate višak. Drago nam je da radite sa nama.
        </Text>

        <View style={styles.statsRow}>
          <Stat icon="tag" value={activeCount} label="Aktivnih oglasa" />
          <Stat icon="shopping-bag" value={pendingCount} label="Novih porudžbina" onPress={() => router.push('/(prodavac)/porudzbine')} />
        </View>

        <Button label="Postavi novi oglas +" onPress={startNewAd} />
        <Button label="Porudžbine" variant="secondary" onPress={() => router.push('/(prodavac)/porudzbine')} />
      </Screen>
    </Screen>
  );
}

function Stat({ icon, value, label, onPress }: { icon: keyof typeof Feather.glyphMap; value: number; label: string; onPress?: () => void }) {
  return (
    <View style={styles.stat} onTouchEnd={onPress}>
      <Feather name={icon} size={22} color={colors.primary} />
      <Text variant="title2" color="text">
        {value}
      </Text>
      <Text variant="footnote" color="textMuted" center>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: space.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    alignItems: 'center',
    gap: 4,
  },
});
