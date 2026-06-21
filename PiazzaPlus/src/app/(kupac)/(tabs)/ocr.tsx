import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Screen, Text, TopAppBar } from '@/components';
import { useAuth } from '@/store/auth';
import { colors, radii, space } from '@/theme/tokens';

export default function OcrScan() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);

  const onShutter = async () => {
    setCapturing(true);
    try {
      // Real capture; the OCR parsing itself is mocked server-side.
      await cameraRef.current?.takePictureAsync({ quality: 0.6 });
    } catch {
      // ignore capture errors in the demo
    } finally {
      setCapturing(false);
      router.push('/(kupac)/receipt?scan=1');
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar
        title="OCR Scan"
        avatarKey={user?.avatarKey ?? 'kupac'}
        profileHref="/(kupac)/profile"
        notificationsHref="/(kupac)/notifications"
        settingsHref="/(kupac)/settings"
      />
      <View style={styles.body}>
        <Text variant="body" color="textMuted">
          Uslikajte račun da biste ga digitalizovali i sačuvali u istoriju.
        </Text>

        <View style={styles.viewfinder}>
          {permission?.granted ? (
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
          ) : (
            <View style={styles.permissionBox}>
              <Feather name="camera-off" size={32} color={colors.textMuted} />
              <Text variant="footnote" color="textMuted" center>
                Potrebna je dozvola za kameru.
              </Text>
              <Button label="Dozvoli kameru" variant="secondary" onPress={requestPermission} />
            </View>
          )}
          <View style={styles.frame} pointerEvents="none" />
        </View>

        <Button
          label={capturing ? 'Skeniranje...' : 'Skeniraj račun'}
          onPress={onShutter}
          loading={capturing}
          disabled={!permission?.granted}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: space.lg, gap: space.md },
  viewfinder: { flex: 1, borderRadius: radii.card, overflow: 'hidden', backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  permissionBox: { alignItems: 'center', gap: space.md, padding: space.lg },
  frame: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: radii.card,
  },
});
