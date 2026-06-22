import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { img } from '@/lib/images';
import { colors, space, stroke } from '@/theme/tokens';

interface TopAppBarProps {
  title: string;
  /** Show a back chevron as the leading element (default true unless avatarKey set). */
  back?: boolean;
  /** Show a round avatar as the leading element; tapping routes to profileHref. */
  avatarKey?: string | null;
  profileHref?: Href;
  notificationsHref?: Href;
  settingsHref?: Href;
  /** Optional custom trailing action (e.g. a save/heart toggle). */
  action?: { icon: keyof typeof Feather.glyphMap; onPress: () => void; color?: string; label?: string };
}

/** Full-width 96dp app bar with bottom divider (figma/MEASUREMENTS.md §Top App Bar). */
export function TopAppBar({
  title,
  back,
  avatarKey,
  profileHref,
  notificationsHref,
  settingsHref,
  action,
}: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const showBack = back ?? !avatarKey;

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 12, height: 96 + insets.top }]}>
      <View style={styles.leading}>
        {showBack ? (
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.hit} accessibilityLabel="Nazad">
            <Feather name="chevron-left" size={24} color={colors.text} />
          </Pressable>
        ) : avatarKey ? (
          <Pressable
            onPress={() => profileHref && router.push(profileHref)}
            style={styles.hit}
            accessibilityLabel="Profil"
          >
            <Image source={img(avatarKey)} style={styles.avatar} contentFit="cover" />
          </Pressable>
        ) : (
          <View style={styles.hit} />
        )}
      </View>

      <Text variant="title2" color="text" numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={styles.actions}>
        {action ? (
          <Pressable onPress={action.onPress} style={styles.hit} accessibilityLabel={action.label ?? 'Akcija'}>
            <Feather name={action.icon} size={24} color={action.color ?? colors.text} />
          </Pressable>
        ) : null}
        {notificationsHref ? (
          <Pressable
            onPress={() => router.push(notificationsHref)}
            style={styles.hit}
            accessibilityLabel="Obaveštenja"
          >
            <Feather name="bell" size={24} color={colors.text} />
          </Pressable>
        ) : null}
        {settingsHref ? (
          <Pressable
            onPress={() => router.push(settingsHref)}
            style={styles.hit}
            accessibilityLabel="Podešavanja"
          >
            <Feather name="settings" size={24} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: space.lg,
    gap: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: stroke.hair,
    borderBottomColor: colors.border,
  },
  leading: { justifyContent: 'center' },
  hit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 999, backgroundColor: colors.border },
  title: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
