import { Feather } from '@expo/vector-icons';
import { Image, type ImageStyle } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { img } from '@/lib/images';
import { colors, radii } from '@/theme/tokens';

interface AvatarProps {
  imageKey?: string | null;
  imageUrl?: string | null;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/** Round avatar (figma/MEASUREMENTS.md §Avatars). Default 96dp. */
export function Avatar({ imageKey, imageUrl, size = 96, style }: AvatarProps) {
  const source = imageUrl ? { uri: imageUrl } : img(imageKey);
  return (
    <Image
      source={source}
      style={[{ width: size, height: size, borderRadius: 999, backgroundColor: colors.border }, style]}
      contentFit="cover"
    />
  );
}

interface ImagePlaceholderProps {
  imageKey?: string | null;
  imageUrl?: string | null;
  label?: string;
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Image with a grey fallback box + centered label when no source is set. */
export function ImagePlaceholder({
  imageKey,
  imageUrl,
  label = '[Slika]',
  width = '100%',
  height = 200,
  radius = radii.card,
  style,
}: ImagePlaceholderProps) {
  const source = imageUrl ? { uri: imageUrl } : img(imageKey);
  if (source) {
    return (
      <Image
        source={source}
        style={
          [{ width, height, borderRadius: radius, backgroundColor: colors.border }, style] as StyleProp<ImageStyle>
        }
        contentFit="cover"
        transition={120}
      />
    );
  }
  return (
    <View style={[styles.box, { width, height, borderRadius: radius }, style]}>
      <Feather name="image" size={28} color={colors.textMuted} />
      <Text variant="footnote" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 6 },
});
