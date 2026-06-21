import { Feather } from '@expo/vector-icons';
import { StyleProp, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { colors, radii, space, stroke, type as typeTokens } from '@/theme/tokens';

interface SearchFieldProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** 52dp search field, radius 12, magnify icon left (figma/MEASUREMENTS.md §Search field). */
export function SearchField({
  placeholder = 'Pretraži...',
  value,
  onChangeText,
  onSubmitEditing,
  editable = true,
  autoFocus,
  style,
}: SearchFieldProps) {
  return (
    <View style={[styles.field, style]}>
      <Feather name="search" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 52,
    borderRadius: radii.button,
    borderWidth: stroke.field,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: typeTokens.body.fontSize,
    padding: 0,
  },
});
