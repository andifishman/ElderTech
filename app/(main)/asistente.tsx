import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { Audio } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STORAGE_KEY = 'asistente_historial';

// ─── Groq API key ─────────────────────────────────────────────────────────────
// Poné tu key en .env: EXPO_PUBLIC_GROQ_API_KEY=gsk_...
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

const SYSTEM_PROMPT = `Sos un asistente para personas mayores.
Respondé siempre en español, con frases muy cortas y simples.
Usá palabras fáciles, sin tecnicismos.
Máximo 3 oraciones por respuesta.
Si das pasos, usá números (1, 2, 3).
Sé amable y paciente.`;

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

const FAQ = [
  { q: '¿Cómo hago una videollamada?' },
  { q: '¿Cómo veo mis fotos?' },
  { q: '¿Cómo subo el volumen?' },
  { q: '¿Cómo uso WhatsApp?' },
];

async function askGroq(userMessage: string, history: Message[]): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).map((m) => ({
      role: m.isBot ? 'assistant' : 'user',
      content: m.text,
    })),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error ${res.status}: ${err}`);
  }
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? 'No pude responder. Intentá de nuevo.';
}

async function transcribeAudio(uri: string): Promise<string> {
  console.log('API KEY:', GROQ_API_KEY.slice(0, 10) + '...');
  const formData = new FormData();
  formData.append('file', { uri, name: 'audio.m4a', type: 'audio/m4a' } as any);
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('language', 'es');
  formData.append('response_format', 'json');

  const res = await (fetch as any)('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error transcripción ${res.status}: ${err}`);
  }
  const data = await res.json() as { text?: string };
  return data.text?.trim() ?? '';
}

export default function AsistenteScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: '¡Hola! Soy tu asistente. ¿En qué te puedo ayudar hoy?', isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text: text.trim(), isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const reply = await askGroq(text.trim(), [...messages, userMsg]);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: reply, isBot: true },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: `Error: ${msg}`, isBot: true },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = rec;
      setRecording(true);
    } catch (e) {
      console.error('Error al grabar:', e);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    setRecording(false);
    setTranscribing(true);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('No se obtuvo el archivo de audio');

      const transcribed = await transcribeAudio(uri);
      if (transcribed) {
        await sendMessage(transcribed);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: `Error de audio: ${msg}`, isBot: true },
      ]);
    } finally {
      setTranscribing(false);
    }
  };

  const isBusy = loading || transcribing;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader title="Asistente" subtitle="Preguntá lo que necesitás" showBack />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
            {msg.isBot && <Text style={styles.botIcon}>🤖</Text>}
            <View style={[styles.bubbleContent, msg.isBot ? styles.botContent : styles.userContent]}>
              <Text style={[styles.bubbleText, msg.isBot ? styles.botText : styles.userText]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        {(isBusy) && (
          <View style={[styles.bubble, styles.botBubble]}>
            <Text style={styles.botIcon}>🤖</Text>
            <View style={[styles.bubbleContent, styles.botContent]}>
              <ActivityIndicator color={Colors.primary} size="small" />
            </View>
          </View>
        )}

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Preguntas frecuentes:</Text>
          {FAQ.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqBtn}
              onPress={() => sendMessage(faq.q)}
              disabled={isBusy}
              activeOpacity={0.7}
            >
              <Text style={styles.faqIcon}>❓</Text>
              <Text style={styles.faqText}>{faq.q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.inputRow, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TextInput
          style={styles.input}
          placeholder="Escribí tu pregunta..."
          value={input}
          onChangeText={setInput}
          multiline
          editable={!isBusy}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
        />

        {/* Botón micrófono */}
        <TouchableOpacity
          style={[styles.micBtn, recording && styles.micBtnActive]}
          onPress={recording ? stopRecording : startRecording}
          disabled={isBusy && !recording}
          activeOpacity={0.8}
        >
          <Text style={styles.micIcon}>{recording ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>

        {/* Botón enviar */}
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isBusy) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || isBusy}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>▶</Text>
        </TouchableOpacity>
      </View>

      {recording && (
        <View style={styles.recordingBanner}>
          <Text style={styles.recordingText}>🔴  Grabando... Tocá ⏹ para terminar</Text>
        </View>
      )}
      {transcribing && (
        <View style={styles.recordingBanner}>
          <Text style={styles.recordingText}>⏳  Transcribiendo audio...</Text>
        </View>
      )}
      {/* Tutorial */}
      <Modal visible={showTutorial} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🤖</Text>
            <Text style={styles.modalTitle}>¿Cómo usar el Asistente?</Text>
            <View style={styles.tutorialList}>
              <Text style={styles.tutorialItem}>✍️ Escribí tu pregunta en el cuadro de abajo y tocá el botón enviar</Text>
              <Text style={styles.tutorialItem}>🎤 También podés grabar tu voz tocando el micrófono</Text>
              <Text style={styles.tutorialItem}>❓ O tocá una de las preguntas frecuentes para empezar</Text>
              <Text style={styles.tutorialItem}>💬 El asistente te va a responder de forma simple y clara</Text>
            </View>
            <TouchableOpacity style={styles.tutorialBtn} onPress={() => setShowTutorial(false)}>
              <Text style={styles.tutorialBtnText}>¡Entendido, empezar!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  messages: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },

  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  botBubble: { justifyContent: 'flex-start' },
  userBubble: { justifyContent: 'flex-end' },
  botIcon: { fontSize: 24, marginBottom: 4 },
  bubbleContent: { maxWidth: '80%', borderRadius: Radius.md, padding: Spacing.md },
  botContent: { backgroundColor: Colors.white, borderBottomLeftRadius: 4 },
  userContent: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: FontSizes.md, lineHeight: 24 },
  botText: { color: Colors.textPrimary },
  userText: { color: Colors.white },

  faqSection: { marginTop: Spacing.lg },
  faqTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: Spacing.sm },
  faqBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: Radius.sm,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  faqIcon: { fontSize: 16 },
  faqText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textPrimary },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, paddingHorizontal: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  input: {
    flex: 1, backgroundColor: Colors.inputBg,
    borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: FontSizes.md, maxHeight: 80,
  },
  micBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.background, borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  micBtnActive: {
    backgroundColor: Colors.danger, borderColor: Colors.danger,
  },
  micIcon: { fontSize: 20 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: Colors.white, fontSize: 16, marginLeft: 2 },
  modalOverlay: {
    flex: 1, backgroundColor: '#00000066',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.xxl, width: '88%', alignItems: 'center',
  },
  modalIcon: { fontSize: 64, marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.md, textAlign: 'center' },
  tutorialList: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.xl },
  tutorialItem: { fontSize: FontSizes.md, color: Colors.textPrimary, lineHeight: 24 },
  tutorialBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, width: '100%', alignItems: 'center',
  },
  tutorialBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },

  recordingBanner: {
    backgroundColor: Colors.dangerLight,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.danger,
  },
  recordingText: { color: Colors.danger, fontWeight: '600', fontSize: FontSizes.sm },
});
