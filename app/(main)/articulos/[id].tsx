import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

const articlesData: Record<string, {
  title: string; type: string; duration: string;
  description: string; steps: string[];
}> = {
  '1': {
    title: 'Cómo usar WhatsApp',
    type: 'Video', duration: '5 min',
    description: 'En este video vas a aprender cómo enviar mensajes de texto a tus familiares usando WhatsApp.',
    steps: [
      '1. Cómo abrir la aplicación',
      '2. Cómo buscar un contacto',
      '3. Cómo escribir y enviar un mensaje',
      '4. Cómo saber si lo recibieron',
    ],
  },
  '2': {
    title: 'Videollamadas paso a paso',
    type: 'Video', duration: '8 min',
    description: 'Aprendé a hacer videollamadas con tus seres queridos desde tu celular.',
    steps: [
      '1. Abrí WhatsApp',
      '2. Buscá el contacto',
      '3. Tocá el ícono de cámara',
      '4. Esperá que atiendan',
    ],
  },
  '3': {
    title: 'Enviar fotos por email',
    type: 'Fotos', duration: 'Guía',
    description: 'Aprendé a enviar fotos por correo electrónico de forma simple.',
    steps: [
      '1. Abrí la galería de fotos',
      '2. Seleccioná la foto',
      '3. Tocá "Compartir"',
      '4. Elegí "Correo electrónico"',
    ],
  },
  '4': {
    title: 'Cómo cerrar una aplicación',
    type: 'Video', duration: '3 min',
    description: 'Aprendé a cerrar aplicaciones en tu celular para ahorrar batería.',
    steps: [
      '1. Tocá el botón de aplicaciones recientes',
      '2. Deslizá la app hacia arriba',
      '3. La app se cierra',
    ],
  },
  '5': {
    title: 'Enviar fotos por WhatsApp',
    type: 'Fotos', duration: 'Guía',
    description: 'Aprendé a compartir fotos con tus familiares por WhatsApp.',
    steps: [
      '1. Abrí WhatsApp',
      '2. Entrá al chat del contacto',
      '3. Tocá el ícono de clip',
      '4. Seleccioná "Galería"',
      '5. Elegí la foto y enviá',
    ],
  },
};

export default function ArticuloDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = articlesData[id ?? '1'];

  if (!article) return null;

  return (
    <View style={styles.container}>
      <AppHeader title="Artículos" subtitle={article.title} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Video placeholder */}
        <View style={styles.videoBox}>
          <TouchableOpacity style={styles.playBtn}>
            <Text style={styles.playIcon}>▶</Text>
          </TouchableOpacity>
          <Text style={styles.videoLabel}>VIDEO</Text>
        </View>

        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>{article.type} · {article.duration}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Descripción</Text>
          <Text style={styles.sectionText}>{article.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Pasos</Text>
          {article.steps.map((step, i) => (
            <Text key={i} style={styles.step}>{step}</Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  videoBox: {
    backgroundColor: Colors.primaryDark, borderRadius: Radius.md,
    height: 180, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  playBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.white + '33', alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { color: Colors.white, fontSize: 28, marginLeft: 4 },
  videoLabel: { color: Colors.white, fontSize: FontSizes.sm, marginTop: Spacing.sm, fontWeight: '600' },
  title: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  meta: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.primary, marginBottom: Spacing.sm },
  sectionText: { fontSize: FontSizes.md, color: Colors.textPrimary, lineHeight: 24 },
  step: { fontSize: FontSizes.md, color: Colors.textPrimary, lineHeight: 28, paddingLeft: Spacing.sm },
});
