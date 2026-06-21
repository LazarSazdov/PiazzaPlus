import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Screen, Text, TopAppBar } from '@/components';
import { images } from '@/lib/images';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

export default function HeatMap() {
  const { user } = useAuth();
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
        <Image source={images.map_heatmap} style={styles.map} contentFit="cover" />
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
  map: { flex: 1, width: '100%', borderRadius: radii.card, backgroundColor: colors.border },
  legend: { flexDirection: 'row', gap: space.lg, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 4 },
});
