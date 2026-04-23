import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

const FAQ = [
  { q: '¿Cómo hago una videollamada?', a: 'Para hacer una videollamada:\n1. Abrí WhatsApp\n2. Tocá el contacto\n3. Tocá el ícono de cámara\n4. Esperá que atiendan' },
  { q: '¿Cómo veo mis fotos?', a: 'Para ver tus fotos:\n1. Buscá la app "Galería" o "Fotos"\n2. Tocá para abrirla\n3. Ahí vas a ver todas tus fotos' },
  { q: '¿Cómo uso el correo electrónico?', a: 'Para usar el correo:\n1. Abrí la app de correo\n2. Tocá "Redactar" o el ícono de lápiz\n3. Escribí el destinatario y el mensaje\n4. Tocá "Enviar"' },
  { q: '¿Cómo subo el volumen?', a: 'Para subir el volumen:\n1. Buscá los botones en el costado del celular\n2. El botón de arriba sube el volumen\n3. El de abajo lo baja' },
];

const botResponses: Record<string, string> = {
  'hola': '¡Hola! Soy tu asistente. ¿En qué te puedo ayudar?',
  'gracias': '¡De nada! Estoy aquí para ayudarte 😊',
  'whatsapp': 'Para usar WhatsApp:\n1. Abrí WhatsApp\n2. Tocá el contacto\n3. Escribí tu mensaje\n4. Tocá para enviar',
};

function getBotResponse(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(botResponses)) {
    if (lower.includes(key)) return val;
  }
  for (const faq of FAQ) {
    if (lower.includes(faq.q.toLowerCase().slice(0, 10))) return faq.a;
  }
  return 'Entendí tu pregunta. Te recomiendo revisar la sección de Artículos donde encontrarás guías paso a paso. ¿Hay algo más en lo que pueda ayudarte?';
}

export default function AsistenteScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: '¡Hola! Soy tu asistente. ¿En qué te puedo ayudar?', isBot: true },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text, isBot: false };
    const botMsg: Message = { id: (Date.now() + 1).toString(), text: getBotResponse(text), isBot: true };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Asistente" subtitle="Preguntá lo que necesitás" showBack />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.bubble, msg.isBot ? styles.botBubble : styles.userBubble]}
          >
            {msg.isBot && <Text style={styles.botIcon}>🤖</Text>}
            <View style={[styles.bubbleContent, msg.isBot ? styles.botContent : styles.userContent]}>
              <Text style={[styles.bubbleText, msg.isBot ? styles.botText : styles.userText]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        {/* FAQ section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Preguntas frecuentes:</Text>
          {FAQ.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqBtn}
              onPress={() => sendMessage(faq.q)}
            >
              <Text style={styles.faqIcon}>❓</Text>
              <Text style={styles.faqText}>{faq.q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribí tu pregunta..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.micBtn}>
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage(input)}>
          <Text style={styles.sendIcon}>▶</Text>
        </TouchableOpacity>
      </View>
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
  bubbleText: { fontSize: FontSizes.md, lineHeight: 22 },
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
    backgroundColor: Colors.white, padding: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  input: {
    flex: 1, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: FontSizes.md, maxHeight: 80,
  },
  micBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  micIcon: { fontSize: 20 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendIcon: { color: Colors.white, fontSize: 16, marginLeft: 2 },
});
