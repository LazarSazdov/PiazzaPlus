import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { donationApi } from '@/api/sdk';
import { Screen, Text, TopAppBar } from '@/components';
import { colors, radii, space, stroke, type as typeTokens } from '@/theme/tokens';

interface Bubble {
  from: 'me' | 'bot';
  text: string;
}

export default function Chatbot() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const recipient = name || 'Narodna kuhinja Novi Sad';
  const [messages, setMessages] = useState<Bubble[]>([
    { from: 'bot', text: `Zdravo! Ovde ${recipient}. Kako možemo da pomognemo oko vaše donacije?` },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((m) => [...m, { from: 'me', text }]);
    setSending(true);
    try {
      const { reply } = await donationApi.chatbot(text);
      setMessages((m) => [...m, { from: 'bot', text: reply }]);
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: 'Izvinite, došlo je do greške. Pokušajte ponovo.' }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title={recipient} back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubble, m.from === 'me' ? styles.me : styles.bot]}>
              <Text variant="body" color={m.from === 'me' ? 'surface' : 'text'}>
                {m.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <RNTextInput
            value={input}
            onChangeText={setInput}
            placeholder="Napišite poruku..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable onPress={send} style={styles.sendBtn} accessibilityLabel="Pošalji">
            <Feather name="send" size={20} color={colors.surface} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  thread: { padding: space.lg, gap: space.md },
  bubble: { maxWidth: '82%', paddingVertical: space.md, paddingHorizontal: space.lg, borderRadius: radii.cardLg },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: stroke.hair, borderColor: colors.border, borderBottomLeftRadius: 4 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderTopWidth: stroke.hair,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: stroke.field,
    borderColor: colors.border,
    paddingHorizontal: space.lg,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: typeTokens.body.fontSize,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
