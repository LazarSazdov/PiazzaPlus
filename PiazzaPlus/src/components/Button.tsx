import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, radii, space, stroke } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerOutline';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * 56dp-tall button, radius 12 (figma/MEASUREMENTS.md §Buttons). Pressed state uses a
 * darker shade via Pressable's `pressed`. Sentence-case labels (REVIEW W2).
 */
export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fillFor(variant, pressed, isDisabled),
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled }}
    >
      {({ pressed }) =>
        loading ? (
          <View style={styles.row}>
            <ActivityIndicator color={labelColorFor(variant, pressed, isDisabled)} />
          </View>
        ) : (
          <Text variant="button" style={{ color: labelColorFor(variant, pressed, isDisabled) }}>
            {label}
          </Text>
        )
      }
    </Pressable>
  );
}

function fillFor(variant: ButtonVariant, pressed: boolean, disabled?: boolean): ViewStyle {
  switch (variant) {
    case 'primary':
      return { backgroundColor: disabled ? colors.primaryDisabled : pressed ? colors.primaryDark : colors.primary };
    case 'secondary':
      return {
        backgroundColor: pressed ? colors.primaryLight : colors.surface,
        borderWidth: stroke.field,
        borderColor: disabled ? colors.primaryDisabled : colors.primary,
      };
    case 'danger':
      return { backgroundColor: disabled ? colors.errorLight : pressed ? colors.errorDark : colors.error };
    case 'dangerOutline':
      return {
        backgroundColor: pressed ? colors.errorLight : colors.surface,
        borderWidth: stroke.field,
        borderColor: colors.error,
      };
  }
}

function labelColorFor(variant: ButtonVariant, pressed: boolean, disabled?: boolean): string {
  switch (variant) {
    case 'primary':
      return disabled ? colors.textMuted : colors.surface;
    case 'secondary':
      return disabled ? colors.primaryDisabled : colors.primary;
    case 'danger':
      return disabled ? colors.error : colors.surface;
    case 'dangerOutline':
      return pressed ? colors.errorDark : colors.error;
  }
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radii.button,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
