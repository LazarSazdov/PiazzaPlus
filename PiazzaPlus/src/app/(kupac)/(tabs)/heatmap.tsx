import { StyleSheet, View } from 'react-native';
import { catalogApi } from '@/api/sdk';
import { OsmMap, Screen, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { useAuth } from '@/store/auth';
import { chartRamp, colors, radii, space } from '@/theme/tokens';

const NOVI_SAD = { lat: 45.2517, lng: 19.8369 };

export default function HeatMap() {
  const { user } = useAuth();
  const { data } = useAsync(() => catalogApi.markets(), []);
  const markets = (data?.markets ?? []).filter((m) => m.lat != null && m.lng != null);

  // Pseudo-heat: a coloured circle per market, intensity ramped green (more saved = darker).
  const circles = markets.map((m, i) => ({
    lat: m.lat!,
    lng: m.lng!,
    radius: 500 + i * 180,
    color: chartRamp[Math.min(chartRamp.length - 1, i + 1)],
  }));
  const markers = markets.map((m) => ({ lat: m.lat!, lng: m.lng!, title: m.name, color: colors.primary }));

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Mapa spasene hrane"
        avatarKey={user?.avatarKey ?? 'kupac'}
        profileHref="/(kupac)/profile"
        notificationsHref="/(kupac)/notifications"
        settingsHref="/(kupac)/settings"
      />
      <View style={styles.body}>
        <Text variant="body" color="textMuted">
          Toplotna mapa prikazuje gde je najviše hrane spaseno od bacanja.
        </Text>
        <OsmMap center={NOVI_SAD} zoom={13} circles={circles} markers={markers} style={styles.map} />
        <View style={styles.legend}>
          <Legend color="#a5d6a7" label="Manje" />
          <Legend color="#43a047" label="Srednje" />
          <Legend color="#1b5e20" label="Najviše" />
        </View>
      </View>
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="footnote" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: space.lg, gap: space.md },
  map: { flex: 1, width: '100%', borderRadius: radii.card },
  legend: { flexDirection: 'row', gap: space.lg, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 4 },
});
