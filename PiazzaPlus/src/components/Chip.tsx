import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors, radii, stroke } from '@/theme/tokens';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/** Pill chip, radius 999, border 1.5 (figma/MEASUREMENTS.md §Selection controls). */
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primaryLight : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text variant="subhead" color={selected ? 'primary' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: stroke.field,
  },
});
