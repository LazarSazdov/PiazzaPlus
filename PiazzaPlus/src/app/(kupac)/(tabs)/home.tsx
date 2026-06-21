import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { catalogApi } from '@/api/sdk';
import { Product } from '@/api/types';
import { ListRow, Screen, SearchField, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { rsd } from '@/lib/format';
import { useAuth } from '@/store/auth';
import { colors, space } from '@/theme/tokens';

export default function KupacHome() {
  const { user } = useAuth();
  const { data, loading, error } = useAsync(() => catalogApi.products(), []);
  const products = data?.products ?? [];

  return (
    <Screen padded={false} background={colors.bg}>
      <TopAppBar
        title="Pijaca Plus"
        avatarKey={user?.avatarKey ?? 'kupac'}
        profileHref="/(kupac)/profile"
        notificationsHref="/(kupac)/notifications"
        settingsHref="/(kupac)/settings"
      />

      <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.md }}>
        <Text variant="title3" color="text">
          Dobrodošli{user ? `, ${user.name.split(' ')[0]}` : ''}
        </Text>
        <Pressable onPress={() => router.push('/(kupac)/pretraga')}>
          <View pointerEvents="none">
            <SearchField placeholder="Pretražite proizvode i pijace..." editable={false} />
          </View>
        </Pressable>
        <Text variant="headline" color="text">
          Sveže na pijaci
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : error ? (
        <Text variant="body" color="error" style={{ padding: space.lg }}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingBottom: space.xl }}
          renderItem={({ item }: { item: Product }) => (
            <ListRow
              title={item.name}
              subtitle={`${rsd(item.price)} / ${item.unit} · ${item.sellerName ?? 'Pijaca'}`}
              imageKey={item.imageKey}
              onPress={() => router.push(`/(kupac)/product?id=${item.id}`)}
            />
          )}
        />
      )}
    </Screen>
  );
}
