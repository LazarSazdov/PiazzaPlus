import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { colors, radii, stroke } from '@/theme/tokens';

export interface TabConfig {
  name: string; // route name
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

// Minimal structural type for the bits of the tab bar props we use (avoids a
// direct @react-navigation/bottom-tabs type import that expo-router re-wraps).
interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

/**
 * Custom bottom nav (figma/MEASUREMENTS.md §Bottom Nav): full-width 76dp, top border,
 * active tab = SemiBold green label + a light-green square highlight behind the icon
 * (so the active state isn't conveyed by colour alone — REVIEW accessibility note).
 */
export function makeTabBar(config: TabConfig[]) {
  return function AppTabBar({ state, navigation }: TabBarProps) {
    const insets = useSafeAreaInsets();
    return (
      <View style={[styles.bar, { paddingBottom: insets.bottom + 10, height: 76 + insets.bottom }]}>
        {state.routes.map((route, index) => {
          const cfg = config.find((c) => c.name === route.name);
          if (!cfg) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab} accessibilityRole="button" accessibilityState={{ selected: focused }}>
              <View style={[styles.iconbox, focused && styles.iconboxActive]}>
                <Feather name={cfg.icon} size={22} color={focused ? colors.primary : colors.textMuted} />
              </View>
              <Text
                variant="caption1"
                color={focused ? 'primary' : 'textMuted'}
                numberOfLines={1}
                style={focused ? styles.activeLabel : undefined}
              >
                {cfg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: stroke.hair,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  iconbox: {
    width: 50,
    height: 32,
    borderRadius: radii.iconbox,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconboxActive: { backgroundColor: colors.primaryLight },
  activeLabel: { fontFamily: 'Inter_600SemiBold' },
});
