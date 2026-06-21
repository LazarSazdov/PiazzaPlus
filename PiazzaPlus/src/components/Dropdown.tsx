import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, radii, space, stroke } from '@/theme/tokens';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Select with a popover menu. Field height 52, radius 10 (figma/MEASUREMENTS.md §Dropdown). */
export function Dropdown({
  label,
  placeholder = 'Izaberite',
  value,
  options,
  onChange,
  required,
  error,
  containerStyle,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <Text variant="subhead" color="text">
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { borderColor: error ? colors.error : open ? colors.primary : colors.border, borderWidth: open || error ? stroke.focus : stroke.field }]}
      >
        <Text variant="body" color={selected ? 'text' : 'textMuted'} style={styles.value}>
          {selected ? selected.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.textMuted} />
      </Pressable>

      {error ? (
        <Text variant="footnote" color="error">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {options.map((opt) => {
              const isSel = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  style={[styles.row, isSel && { backgroundColor: colors.primaryLight }]}
                >
                  <Text variant="body" color={isSel ? 'primary' : 'text'}>
                    {opt.label}
                  </Text>
                  {isSel ? <Feather name="check" size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
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
    justifyContent: 'space-between',
  },
  value: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: space.xl },
  menu: { backgroundColor: colors.surface, borderRadius: radii.card, overflow: 'hidden', paddingVertical: space.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
});
