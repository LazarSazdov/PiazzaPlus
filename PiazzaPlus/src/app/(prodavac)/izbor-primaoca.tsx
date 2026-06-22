import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { donationApi } from '@/api/sdk';
import { ListRow, Screen, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { colors, space } from '@/theme/tokens';

export default function IzborPrimaoca() {
  const { data, loading } = useAsync(() => donationApi.recipients(), []);
  const recipients = data?.recipients ?? [];

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Izaberite primaoca"
        back
        notificationsHref="/(prodavac)/notifications"
        settingsHref="/(prodavac)/settings"
      />
      <Screen scroll padded contentStyle={{ gap: space.md }}>
        <Text variant="subhead" color="textMuted">
          Kome želite da donirate višak hrane?
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          recipients.map((r) => (
            <ListRow
              key={r.id}
              title={r.name}
              subtitle={r.note ?? r.city}
              imageKey={r.logoKey}
              onPress={() => router.push(`/(prodavac)/chatbot?recipientId=${r.id}&name=${encodeURIComponent(r.name)}`)}
            />
          ))
        )}
      </Screen>
    </Screen>
  );
}
