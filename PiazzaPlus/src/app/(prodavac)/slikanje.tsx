import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Screen, Text, TopAppBar } from '@/components';
import { useAdDraft } from '@/store/adDraft';
import { colors, space } from '@/theme/tokens';

export default function Slikanje() {
  const { patch } = useAdDraft();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  const shutter = async () => {
    setBusy(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
      if (photo?.uri) patch({ imageUri: photo.uri });
    } catch {
      // ignore
    } finally {
      setBusy(false);
      router.back();
    }
  };

  return (
    <Screen padded={false} background="#000">
      <TopAppBar title="Uslikaj proizvod" back />
      <View style={styles.body}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        ) : (
          <View style={styles.permission}>
            <Feather name="camera-off" size={32} color={colors.surface} />
            <Text variant="body" color="surface" center>
              Potrebna je dozvola za kameru.
            </Text>
            <Button label="Dozvoli kameru" variant="secondary" onPress={requestPermission} />
          </View>
        )}

        {permission?.granted ? (
          <View style={styles.controls}>
            <Pressable onPress={shutter} disabled={busy} style={styles.shutter} accessibilityLabel="Uslikaj">
              <View style={styles.shutterInner} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: '#000' },
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  controls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 999, backgroundColor: colors.surface },
});
