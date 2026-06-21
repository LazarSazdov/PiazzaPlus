import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';

interface MicButtonProps {
  recording: boolean;
  onPress?: () => void;
}

/** 132dp circular mic; idle green, recording red with a pulsing ring (figma/MEASUREMENTS.md). */
export function MicButton({ recording, onPress }: MicButtonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (recording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(0);
  }, [recording, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <Pressable onPress={onPress} style={styles.wrap} accessibilityLabel={recording ? 'Zaustavi snimanje' : 'Započni snimanje'}>
      {recording ? (
        <Animated.View style={[styles.ring, { backgroundColor: colors.error, transform: [{ scale }], opacity }]} />
      ) : null}
      <View style={[styles.button, { backgroundColor: recording ? colors.error : colors.primary }]}>
        <Feather name={recording ? 'square' : 'mic'} size={48} color={colors.surface} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 132, height: 132, borderRadius: 999 },
  button: { width: 132, height: 132, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
