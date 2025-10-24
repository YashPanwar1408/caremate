import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, Button, ActivityIndicator, Text } from 'react-native-paper';
import { generateAdvice } from '../api/gemini';
import { speak } from '../hooks/useSpeech';
import { useNavigation } from '@react-navigation/native';

const ACCENT = '#0ea5e9';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
};

export default function ChatScreen() {
  const nav = useNavigation<any>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'hello',
      role: 'ai',
      text:
        "I'm here to help. Tell me what's going on today—I'll do my best to support you with clear, caring guidance.",
    },
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = useCallback(async () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    const userMsg: Message = { id: String(Date.now()), role: 'user', text: content };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const aiText = await generateAdvice({ userText: content });
      const aiMsg: Message = { id: String(Date.now() + 1), role: 'ai', text: aiText };
      setMessages((m) => [...m, aiMsg]);
      speak(aiText);
    } catch (e) {
      const aiMsg: Message = {
        id: String(Date.now() + 1),
        role: 'ai',
        text: 'Sorry, I ran into a temporary issue. Please try again in a moment.',
      };
      setMessages((m) => [...m, aiMsg]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [text]);

  const VoiceButton = (
    <IconButton
      icon="microphone"
      onPress={() => {
        // Integration point: start voice input (STT); for now just hints
        const aiMsg: Message = {
          id: String(Date.now() + 2),
          role: 'ai',
          text: 'Voice input coming soon. You can type your concern, and I will respond. ',
        };
        setMessages((m) => [...m, aiMsg]);
      }}
      iconColor={ACCENT}
      accessibilityLabel="Voice input"
    />
  );

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.ai]}>
      <Text style={styles.bubbleText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={ACCENT} />
            <Text style={{ marginLeft: 8 }}>Thinking…</Text>
          </View>
        )}
        <View style={styles.inputRow}>
          {VoiceButton}
          <TextInput
            mode="outlined"
            placeholder="Describe your symptoms or concerns"
            value={text}
            onChangeText={setText}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <IconButton icon="send" onPress={send} iconColor="#fff" style={styles.sendBtn} accessibilityLabel="Send" />
        </View>
        <Button mode="text" onPress={() => nav.navigate('HealthIntakeForm' as never)} textColor={ACCENT}>
          Go to Health Intake Form
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 12 },
  listContent: { paddingHorizontal: 12, paddingBottom: 8 },
  bubble: {
    maxWidth: '85%',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  user: { alignSelf: 'flex-end', backgroundColor: ACCENT },
  ai: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0' },
  bubbleText: { color: '#111827' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  input: { flex: 1, marginHorizontal: 8 },
  sendBtn: { backgroundColor: ACCENT, marginLeft: 4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 },
});
