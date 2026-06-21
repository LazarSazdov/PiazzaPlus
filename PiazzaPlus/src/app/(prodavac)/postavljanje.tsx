import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Text, TopAppBar } from '@/components';
import { colors, radii, space } from '@/theme/tokens';

export default function Postavljanje() {
  return (
    <Screen padded={false}>
      <TopAppBar title="Postavi oglas" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <Text variant="body" color="textMuted">
          Izaberite kako želite da kreirate oglas. Glasovni unos je brži i lakši.
        </Text>

        <Option
          icon="mic"
          title="Glasovni unos"
          subtitle="Izdiktirajte oglas, mi ćemo ga popuniti."
          onPress={() => router.push('/(prodavac)/glasovni')}
        />
        <Option
          icon="edit-3"
          title="Tekstualni unos"
          subtitle="Ručno popunite podatke o proizvodu."
          onPress={() => router.push('/(prodavac)/forma-unos')}
        />
      </Screen>
    </Screen>
  );
}

function Option({ icon, title, subtitle, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable style={styles.option} onPress={onPress}>
      <View style={styles.iconbox}>
        <Feather name={icon} size={28} color={colors.primary} />
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
  },
  iconbox: { width: 56, height: 56, borderRadius: radii.card, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
});
