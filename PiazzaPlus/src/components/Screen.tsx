import { ReactNode } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  center?: boolean;
  /** Apply 16dp horizontal content padding (default true). */
  padded?: boolean;
  /** Respect the top safe-area inset (default false — most screens have a TopAppBar). */
  safeTop?: boolean;
  background?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Standard screen surface: background fill + bottom safe-area inset + optional
 * scroll, centering, and 16dp side padding (figma/MEASUREMENTS.md §Screen & grid).
 */
export function Screen({
  children,
  scroll,
  center,
  padded = true,
  safeTop = false,
  background = colors.bg,
  style,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const padding: ViewStyle = {
    paddingHorizontal: padded ? space.screen : 0,
    paddingTop: safeTop ? insets.top : 0,
    paddingBottom: insets.bottom,
  };

  if (scroll) {
    return (
      <View style={[styles.root, { backgroundColor: background }, style]}>
        <ScrollView
          contentContainerStyle={[
            padding,
            { paddingVertical: space.lg, flexGrow: 1 },
            center && styles.center,
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: background },
        padding,
        { paddingVertical: space.lg },
        center && styles.center,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
});
