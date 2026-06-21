import { Feather } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, space, stroke } from '@/theme/tokens';

interface ToggleableProps {
  label?: string;
  checked: boolean;
  onChange?: (next: boolean) => void;
}

/** 26dp checkbox, radius 6, white check on primary when selected. */
export function Checkbox({ label, checked, onChange }: ToggleableProps) {
  return (
    <Pressable onPress={() => onChange?.(!checked)} style={styles.row} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <View style={[styles.box, checked ? styles.boxOn : styles.boxOff]}>
        {checked ? <Feather name="check" size={18} color={colors.surface} /> : null}
      </View>
      {label ? (
        <Text variant="body" color="text" style={styles.label}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** 26dp radio ring; selected = 2dp primary ring + 12dp dot. */
export function Radio({ label, checked, onChange }: ToggleableProps) {
  return (
    <Pressable onPress={() => onChange?.(true)} style={styles.row} accessibilityRole="radio" accessibilityState={{ selected: checked }}>
      <View style={[styles.ring, { borderColor: checked ? colors.primary : colors.border }]}>
        {checked ? <View style={styles.dot} /> : null}
      </View>
      {label ? (
        <Text variant="body" color="text" style={styles.label}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** 52×30 toggle, radius 999, 24dp knob (figma/MEASUREMENTS.md §Selection controls). */
export function Toggle({ label, checked, onChange }: ToggleableProps) {
  const anim = useRef(new Animated.Value(checked ? 1 : 0)).current;
  Animated.timing(anim, { toValue: checked ? 1 : 0, duration: 150, useNativeDriver: false }).start();
  const left = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 25] });

  return (
    <Pressable onPress={() => onChange?.(!checked)} style={styles.toggleRow} accessibilityRole="switch" accessibilityState={{ checked }}>
      {label ? (
        <Text variant="body" color="text" style={styles.toggleLabel}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.track, { backgroundColor: checked ? colors.primary : colors.border }]}>
        <Animated.View style={[styles.knob, { left }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  label: { flex: 1 },
  box: { width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.primary },
  boxOff: { borderWidth: stroke.field, borderColor: colors.border, backgroundColor: colors.surface },
  ring: { width: 26, height: 26, borderRadius: 999, borderWidth: stroke.focus, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 999, backgroundColor: colors.primary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  toggleLabel: { flex: 1 },
  track: { width: 52, height: 30, borderRadius: 999, justifyContent: 'center' },
  knob: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
});
