import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { fontFamilyForWeight } from '@/theme/fonts';
import { colors, ColorToken, type, TypeVariant } from '@/theme/tokens';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  color?: ColorToken | string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
}

/**
 * Typed text wrapper. `variant` pulls size/line/weight from the design tokens and
 * maps the weight to the correct loaded Inter family. `color` accepts a token key
 * (e.g. "primary") or a raw color string.
 */
export function Text({ variant = 'body', color = 'text', center, style, ...rest }: TextProps) {
  const t = type[variant];
  const resolvedColor = (color in colors ? colors[color as ColorToken] : color) as string;

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: fontFamilyForWeight(t.fontWeight),
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          color: resolvedColor,
        },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}
