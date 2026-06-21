import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import { receiptApi } from '@/api/sdk';
import { ListRow, Screen, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { rsd } from '@/lib/format';
import { useAuth } from '@/store/auth';
import { colors, space } from '@/theme/tokens';

export default function History() {
  const { user } = useAuth();
  const { data, loading } = useAsync(() => receiptApi.list(), []);
  const receipts = data?.receipts ?? [];

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Istorija"
        avatarKey={user?.avatarKey ?? 'kupac'}
        profileHref="/(kupac)/profile"
        notificationsHref="/(kupac)/notifications"
        settingsHref="/(kupac)/settings"
      />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : receipts.length === 0 ? (
        <Text variant="body" color="textMuted" center style={{ marginTop: space.xl }}>
          Još uvek nemate sačuvanih računa.
        </Text>
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ paddingTop: space.sm, paddingBottom: space.xl }}
          renderItem={({ item }) => (
            <ListRow
              title={item.store}
              subtitle={`${item.date} · ${rsd(item.total)}`}
              imageKey={item.imageKey}
              onPress={() => router.push(`/(kupac)/receipt?id=${item.id}`)}
            />
          )}
        />
      )}
    </Screen>
  );
}
