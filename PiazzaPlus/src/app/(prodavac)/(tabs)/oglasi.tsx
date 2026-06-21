import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { listingApi } from '@/api/sdk';
import { ListRow, Screen, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { rsd } from '@/lib/format';
import { useAuth } from '@/store/auth';
import { colors, space } from '@/theme/tokens';

export default function MojiOglasi() {
  const { user } = useAuth();
  const { data, loading, reload } = useAsync(() => listingApi.list(), []);
  const listings = data?.listings ?? [];

  // Refresh when returning from create/edit/delete.
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Moji oglasi"
        avatarKey={user?.avatarKey ?? 'prodavac'}
        profileHref="/(prodavac)/profile"
        notificationsHref="/(prodavac)/notifications"
        settingsHref="/(prodavac)/settings"
      />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : listings.length === 0 ? (
        <Text variant="body" color="textMuted" center style={{ marginTop: space.xl }}>
          Još uvek nemate oglasa.
        </Text>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ paddingTop: space.sm, paddingBottom: space.xl }}
          renderItem={({ item }) => {
            const discounted = item.discount > 0;
            return (
              <ListRow
                title={item.title}
                subtitle={
                  discounted
                    ? `${rsd(item.finalPrice)} (-${item.discount}%) · ${item.quantity}`
                    : `${rsd(item.price)} · ${item.quantity}`
                }
                imageKey={item.imageKey}
                imageUrl={item.imageUrl}
                onPress={() => router.push(`/(prodavac)/oglas?id=${item.id}`)}
              />
            );
          }}
        />
      )}
    </Screen>
  );
}
