import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { img } from '@/lib/images';
import { colors, radii, space, stroke } from '@/theme/tokens';

interface ListRowProps {
  title: string;
  subtitle?: string;
  imageKey?: string | null;
  imageUrl?: string | null;
  /** Use a Feather icon instead of an image thumbnail. */
  icon?: keyof typeof Feather.glyphMap;
  trailing?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** 68dp list row with 44dp thumb + chevron (figma/MEASUREMENTS.md §List Row). */
export function ListRow({
  title,
  subtitle,
  imageKey,
  imageUrl,
  icon,
  trailing,
  chevron = true,
  onPress,
  style,
}: ListRowProps) {
  const source = imageUrl ? { uri: imageUrl } : img(imageKey);
  return (
    <Pressable onPress={onPress} style={[styles.row, style]}>
      {icon ? (
        <View style={[styles.thumb, styles.iconThumb]}>
          <Feather name={icon} size={22} color={colors.primary} />
        </View>
      ) : source ? (
        <Image source={source} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.placeholder]} />
      )}

      <View style={styles.text}>
        <Text variant="body" color="text" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing}
      {chevron && !trailing ? <Feather name="chevron-right" size={20} color="#9ca3af" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: stroke.hair,
    borderBottomColor: colors.border,
  },
  thumb: { width: 44, height: 44, borderRadius: radii.thumb, backgroundColor: colors.border },
  iconThumb: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  placeholder: { backgroundColor: colors.border },
  text: { flex: 1, gap: 2 },
});
