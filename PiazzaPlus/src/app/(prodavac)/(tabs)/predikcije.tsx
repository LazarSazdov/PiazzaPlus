import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { predictionApi } from '@/api/sdk';
import { BarChart, Button, Dropdown, Screen, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

const DAYS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

export default function Predikcije() {
  const { user } = useAuth();
  const { data, loading } = useAsync(() => predictionApi.list(), []);
  const predictions = data?.predictions ?? [];
  const [selectedId, setSelectedId] = useState<string>('');

  const current = useMemo(
    () => predictions.find((p) => p.id === selectedId) ?? predictions[0],
    [predictions, selectedId]
  );

  return (
    <Screen padded={false}>
      <TopAppBar
        title="AI predikcija viška"
        avatarKey={user?.avatarKey ?? 'prodavac'}
        profileHref="/(prodavac)/profile"
        notificationsHref="/(prodavac)/notifications"
        settingsHref="/(prodavac)/settings"
      />
      {loading || !current ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <Text variant="body" color="textMuted">
            Procena viška proizvoda po danima na osnovu istorije prodaje.
          </Text>

          <Dropdown
            label="Izaberite proizvod"
            value={current.id}
            options={predictions.map((p) => ({ value: p.id, label: p.productName }))}
            onChange={setSelectedId}
          />

          <BarChart title={`Procena viška - ${current.productName} (kg)`} data={current.series} labels={DAYS} />

          <View style={{ backgroundColor: colors.primaryLight, borderRadius: radii.card, padding: space.lg }}>
            <Text variant="subhead" color="primaryDark">
              {current.recommended}
            </Text>
          </View>

          <Button label="Otvori detalje po proizvodu" onPress={() => router.push(`/(prodavac)/predikcija-detalji?id=${current.id}`)} />
        </Screen>
      )}
    </Screen>
  );
}
