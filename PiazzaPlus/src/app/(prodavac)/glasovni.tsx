import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { listingApi } from '@/api/sdk';
import { Button, MicButton, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAdDraft } from '@/store/adDraft';
import { colors, radii, space } from '@/theme/tokens';

export default function Glasovni() {
  const { patch } = useAdDraft();
  const toast = useToast();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);

  const toggle = async () => {
    if (recording) {
      try {
        await recorder.stop();
      } catch {
        // ignore
      }
      setRecording(false);
      // Send the recording for (server-side, mocked) transcription, then prefill the draft.
      setProcessing(true);
      try {
        const { transcript: text, fields } = await listingApi.voiceDraft();
        setTranscript(text);
        patch({ title: fields.title, category: fields.category, quantity: fields.quantity, price: String(fields.price) });
      } catch {
        toast.show('Obrada snimka nije uspela.', 'error');
      } finally {
        setProcessing(false);
      }
      return;
    }

    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (!perm.granted) {
      toast.show('Potrebna je dozvola za mikrofon.', 'error');
      return;
    }
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
      setTranscript('');
    } catch {
      toast.show('Snimanje nije uspelo.', 'error');
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Glasovni unos" back />
      <Screen scroll padded contentStyle={{ gap: space.lg, alignItems: 'center' }}>
        <Text variant="body" color="textMuted" center>
          {processing
            ? 'Obrada snimka...'
            : recording
              ? 'Snimanje u toku... pritisnite da zaustavite.'
              : 'Pritisnite mikrofon i izdiktirajte oglas.'}
        </Text>

        <MicButton recording={recording} onPress={processing ? undefined : toggle} />

        <View style={styles.transcript}>
          <Text variant="subhead" color="textMuted">
            Transkript
          </Text>
          <Text variant="body" color={transcript ? 'text' : 'textMuted'}>
            {processing ? 'Prepoznavanje govora...' : transcript || 'Ovde će se prikazati prepoznati tekst...'}
          </Text>
        </View>

        <View style={{ gap: space.md, width: '100%' }}>
          <Button label="Postavi oglas" onPress={() => router.push('/(prodavac)/potvrda-oglasa')} disabled={!transcript} />
          <Button label="Dodaj sliku" variant="secondary" onPress={() => router.push('/(prodavac)/dodavanje-slike')} disabled={!transcript} />
          <Button label="Ponovi" variant="secondary" onPress={() => { setTranscript(''); }} />
        </View>
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  transcript: {
    width: '100%',
    minHeight: 90,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.sm,
  },
});
