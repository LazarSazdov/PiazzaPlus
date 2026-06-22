import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Button } from './Button';
import { Text } from './Text';
import { colors, space } from '@/theme/tokens';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

/** Centered error state with an optional retry button, for failed/empty data loads. */
export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl }}>
      <Feather name="alert-circle" size={40} color={colors.textMuted} />
      <Text variant="body" color="textMuted" center>
        {message || 'Nije moguće učitati podatke.'}
      </Text>
      {onRetry ? (
        <View style={{ width: '60%' }}>
          <Button label="Pokušaj ponovo" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
