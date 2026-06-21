import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Text, TopAppBar } from '@/components';
import { colors, radii, space } from '@/theme/tokens';

export default function PodesiSnizenje() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen padded={false}>
      <TopAppBar title="Podesi sniženje" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="body" color="textMuted">
          Izaberite kako želite da snizite cenu da biste brže prodali višak.
        </Text>

        <Option
          icon="edit-3"
          title="Ručno sniženje"
          subtitle="Sami odredite procenat sniženja."
          onPress={() => router.push(`/(prodavac)/izmena-cene?id=${id}`)}
        />
        <Option
          icon="zap"
          title="Automatsko (dinamičko)"
          subtitle="Aplikacija predlaže optimalno sniženje."
          onPress={() => router.push(`/(prodavac)/potvrda-snizenja?id=${id}`)}
        />
      </Screen>
    </Screen>
  );
}

function Option({ icon, title, subtitle, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable style={styles.option} onPress={onPress}>
      <View style={styles.iconbox}>
        <Feather name={icon} size={26} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline" color="text">
          {title}
        </Text>
        <Text variant="footnote" color="textMuted">
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: space.lg, backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg },
  iconbox: { width: 52, height: 52, borderRadius: radii.card, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
});
