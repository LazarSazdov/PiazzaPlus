import { Feather } from '@expo/vector-icons';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { colors, radii, space } from '@/theme/tokens';

type ToastTone = 'success' | 'error' | 'info';

interface ToastApi {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE_ICON: Record<ToastTone, keyof typeof Feather.glyphMap> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info',
};
const TONE_COLOR: Record<ToastTone, string> = {
  success: colors.success,
  error: colors.error,
  info: colors.text,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, tone });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() =>
          setToast(null)
        );
      }, 2200);
    },
    [opacity]
  );

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrap, { opacity, bottom: insets.bottom + 88 }]}
        >
          <View style={styles.toast}>
            <Feather name={TONE_ICON[toast.tone]} size={20} color={TONE_COLOR[toast.tone]} />
            <Text variant="subhead" color="surface" style={styles.label}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: '#111827',
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radii.button,
    maxWidth: '100%',
  },
  label: { flexShrink: 1 },
});
