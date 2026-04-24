import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const articlesData: Record<string, {
  title: string;
  type: string;
  duration: string;
  description: string;
  steps: string[];
  youtubeId: string;
  youtubeUrl: string;
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
    youtubeId: 'YSbNOCdEFEQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=YSbNOCdEFEQ',
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
    youtubeId: 'hMEMBBHBFKA',
    youtubeUrl: 'https://www.youtube.com/watch?v=hMEMBBHBFKA',
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
    youtubeId: 'WMon9bMX_3Y',
    youtubeUrl: 'https://www.youtube.com/watch?v=WMon9bMX_3Y',
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
    youtubeId: 'a9MSGSgSCBs',
    youtubeUrl: 'https://www.youtube.com/watch?v=a9MSGSgSCBs',
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
    youtubeId: 'Wd5xECBBsYQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=Wd5xECBBsYQ',
  },
};

// Thumbnail de YouTube via URL pública
function YoutubeThumbnail({ videoId, onPress }: { videoId: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.thumbnailContainer} onPress={onPress} activeOpacity={0.85}>
      {/* Imagen del thumbnail via img tag en web, o placeholder en nativo */}
      {Platform.OS === 'web' ? (
        // @ts-ignore
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Video thumbnail"
        />
      ) : (
        <View style={styles.thumbnailNative}>
          <Text style={styles.thumbnailEmoji}>🎬</Text>
        </View>
      )}
      {/* Botón play superpuesto */}
      <View style={styles.playOverlay}>
        <View style={styles.playCircle}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <Text style={styles.playLabel}>Ver en YouTube</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ArticuloDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = articlesData[id ?? '1'];

  if (!article) return null;

  const openYoutube = () => {
    Linking.openURL(article.youtubeUrl);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Artículos" subtitle={article.title} showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Video thumbnail con botón para abrir YouTube */}
        <YoutubeThumbnail videoId={article.youtubeId} onPress={openYoutube} />

        {/* Botón secundario */}
        <TouchableOpacity style={styles.watchBtn} onPress={openYoutube}>
          <Text style={styles.watchBtnText}>▶  Ver video completo en YouTube</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>{article.type} · {article.duration}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Descripción</Text>
          <Text style={styles.sectionText}>{article.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Pasos</Text>
          {article.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepBullet}>•</Text>
              <Text style={styles.step}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },

  thumbnailContainer: {
    width: '100%',
    height: 210,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.primaryDark,
    marginBottom: Spacing.sm,
  },
  thumbnailNative: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: {
    fontSize: 64,
  },
  playOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  playIcon: {
    fontSize: 28,
    color: Colors.primaryDark,
    marginLeft: 4,
  },
  playLabel: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  watchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  watchBtnText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },

  title: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  meta: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.primary, marginBottom: Spacing.sm },
  sectionText: { fontSize: FontSizes.md, color: Colors.textPrimary, lineHeight: 24 },
  stepRow: { flexDirection: 'row', marginBottom: 6 },
  stepBullet: { fontSize: FontSizes.md, color: Colors.primary, marginRight: Spacing.sm, lineHeight: 28 },
  step: { fontSize: FontSizes.md, color: Colors.textPrimary, lineHeight: 28, flex: 1 },
});
