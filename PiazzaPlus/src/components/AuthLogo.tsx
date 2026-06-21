import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, space } from '@/theme/tokens';

/** Logo block used on the auth screens (leaf mark + title + subtitle). */
export function AuthLogo({ subtitle }: { subtitle: string }) {
  return (
    <View style={styles.wrap}>
      <Feather name="shopping-bag" size={48} color={colors.primary} />
      <Text variant="title1" color="primary">
        Pijaca Plus
      </Text>
      <Text variant="body" color="textMuted" center>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm, width: '100%' },
});
