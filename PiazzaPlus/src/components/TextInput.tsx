import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { colors, radii, space, stroke, type as typeTokens } from '@/theme/tokens';

export type FieldState = 'default' | 'focused' | 'error' | 'valid';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  required?: boolean;
  state?: FieldState;
  helper?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Text field: label above, 52dp field, radius 10, border colors per state
 * (figma/MEASUREMENTS.md §Text Input). Focus is tracked internally; an explicit
 * `state` ("error" | "valid") overrides focus styling.
 */
export function TextInput({
  label,
  required,
  state = 'default',
  helper,
  error,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const effective: FieldState = state !== 'default' ? state : focused ? 'focused' : 'default';

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <Text variant="subhead" color="text">
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}

      <View style={[styles.field, borderFor(effective)]}>
        <RNTextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        {effective === 'valid' ? (
          <Feather name="check" size={20} color={colors.success} />
        ) : null}
      </View>

      {error ? (
        <Text variant="footnote" color="error">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="footnote" color="textMuted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

function borderFor(state: FieldState): ViewStyle {
  switch (state) {
    case 'focused':
      return { borderWidth: stroke.focus, borderColor: colors.primary };
    case 'error':
      return { borderWidth: stroke.focus, borderColor: colors.error };
    case 'valid':
      return { borderWidth: stroke.field, borderColor: colors.success };
    default:
      return { borderWidth: stroke.field, borderColor: colors.border };
  }
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, width: '100%' },
  field: {
    height: 52,
    borderRadius: radii.input,
    paddingHorizontal: space.lg,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: typeTokens.body.fontSize,
    padding: 0,
  },
});
