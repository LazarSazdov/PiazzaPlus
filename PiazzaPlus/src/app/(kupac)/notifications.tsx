import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { notificationApi } from '@/api/sdk';
import { Button, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space } from '@/theme/tokens';

export default function KupacNotifications() {
  const toast = useToast();
  const { data, loading, setData } = useAsync(() => notificationApi.list('KUPAC'), []);
  const notifications = data?.notifications ?? [];

  const clearAll = async () => {
    try {
      await notificationApi.clear('KUPAC');
      setData({ notifications: [] });
      toast.show('Obaveštenja obrisana.', 'info');
      router.back();
    } catch {
      toast.show('Greška pri brisanju obaveštenja.', 'error');
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Obaveštenja" back />
      <Screen scroll padded contentStyle={{ gap: space.md }}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : notifications.length === 0 ? (
          <Text variant="body" color="textMuted" center style={{ marginTop: space.xl }}>
            Nemate novih obaveštenja.
          </Text>
        ) : (
          notifications.map((n) => (
            <Pressable key={n.id} style={styles.card} onPress={() => router.push('/(kupac)/home')}>
              <View style={styles.icon}>
                <Feather name="bell" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="headline" color="text">
                  {n.title}
                </Text>
                <Text variant="footnote" color="textMuted">
                  {n.body}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        {notifications.length > 0 ? (
          <Button label="Obriši notifikacije" variant="dangerOutline" onPress={clearAll} />
        ) : null}
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
  },
  icon: { width: 36, height: 36, borderRadius: 999, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
});
