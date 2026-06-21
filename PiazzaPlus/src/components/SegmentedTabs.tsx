import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, radii, space } from '@/theme/tokens';

interface SegmentedTabsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

/** 46dp segmented control; active segment = white fill + soft shadow (figma/MEASUREMENTS.md). */
export function SegmentedTabs({ options, value, onChange }: SegmentedTabsProps) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text variant="subhead" color={active ? 'text' : 'textMuted'} style={active ? styles.activeLabel : undefined}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 46,
    borderRadius: radii.button,
    backgroundColor: colors.border,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segmentActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  activeLabel: { fontFamily: 'Inter_600SemiBold' },
});
