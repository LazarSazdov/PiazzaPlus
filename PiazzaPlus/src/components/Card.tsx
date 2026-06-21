import { Image } from 'expo-image';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { img } from '@/lib/images';
import { colors, radii, stroke } from '@/theme/tokens';

interface CardProps {
  title: string;
  subtitle?: string;
  imageKey?: string | null;
  imageUrl?: string | null;
  onPress?: () => void;
  /** When true the card fills its parent width; otherwise a fixed 165 grid item. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Product/recipe card: radius 16, image on top, info below (figma/MEASUREMENTS.md §Card). */
export function Card({ title, subtitle, imageKey, imageUrl, onPress, fill, style }: CardProps) {
  const source = imageUrl ? { uri: imageUrl } : img(imageKey);
  return (
    <Pressable onPress={onPress} style={[styles.card, fill ? styles.fill : styles.fixed, style]}>
      <Image source={source} style={styles.image} contentFit="cover" transition={120} />
      <View style={styles.info}>
        <Text variant="body" color="text" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.cardLg,
    borderWidth: stroke.hair,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  fixed: { width: 165 },
  fill: { flex: 1 },
  image: { width: '100%', height: 110, backgroundColor: colors.border },
  info: { paddingHorizontal: 10, paddingVertical: 8, gap: 2 },
});
