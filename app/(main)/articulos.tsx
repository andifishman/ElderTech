import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = ['Todo', 'WhatsApp', 'Fotos', 'Salir'];

const articles = [
  { id: '1', title: 'Cómo usar WhatsApp', type: 'Video', duration: '5 min', category: 'WhatsApp', icon: '▶️',
    description: 'Aprendé a enviar mensajes de texto a tus familiares usando WhatsApp paso a paso.' },
  { id: '2', title: 'Videollamadas paso a paso', type: 'Video', duration: '8 min', category: 'WhatsApp', icon: '▶️',
    description: 'Aprendé a hacer videollamadas con tus seres queridos desde tu celular.' },
  { id: '3', title: 'Enviar fotos por email', type: 'Fotos', duration: 'Guía', category: 'Fotos', icon: '📷',
    description: 'Aprendé a enviar fotos por correo electrónico de forma simple y rápida.' },
  { id: '4', title: 'Cómo cerrar una aplicación', type: 'Video', duration: '3 min', category: 'Salir', icon: '▶️',
    description: 'Aprendé a cerrar aplicaciones en tu celular para ahorrar batería.' },
  { id: '5', title: 'Enviar fotos por WhatsApp', type: 'Fotos', duration: 'Guía', category: 'WhatsApp', icon: '📷',
    description: 'Aprendé a compartir fotos con tus familiares directamente por WhatsApp.' },
];

export default function ArticulosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('Todo');
  const [search, setSearch] = useState('');

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'es-AR', rate: 0.9 });
  };

  const filtered = articles.filter((a) => {
    const matchCat = category === 'Todo' || a.category === category;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <View style={styles.container}>
      <AppHeader title="Tutoriales" subtitle="Aprendé a usar la tecnología" showBack />

      {/* Category tabs */}
      <View style={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, category === cat && styles.tabActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.tabText, category === cat && styles.tabTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar artículo..."
          value={search}
          onChangeText={setSearch}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {filtered.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => router.push({ pathname: '/(main)/articulos/[id]', params: { id: article.id } } as any)}
            activeOpacity={0.8}
          >
            {/* Fila superior: icono + info */}
            <View style={styles.cardTop}>
              <View style={styles.thumbnailBox}>
                <Text style={styles.thumbnailIcon}>{article.icon}</Text>
              </View>
              <View style={styles.articleInfo}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleDesc}>{article.description}</Text>
                <Text style={styles.articleMeta}>{article.type} · {article.duration}</Text>
              </View>
            </View>
            {/* Botón escuchar abajo */}
            <TouchableOpacity
              style={styles.audioBtn}
              onPress={() => speak(`${article.title}. ${article.description}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.audioBtnText}>🔊  Escuchar descripción</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, paddingVertical: Spacing.md, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.primary },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSizes.md, paddingVertical: Spacing.xs },
  searchIcon: { fontSize: 18 },
  list: { padding: Spacing.lg, gap: Spacing.md },
  articleCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
    shadowRadius: 3, elevation: 2, gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'flex-start',
  },
  thumbnailBox: {
    width: 64, height: 64, borderRadius: Radius.sm,
    backgroundColor: Colors.background, alignItems: 'center',
    justifyContent: 'center', marginRight: Spacing.md,
  },
  thumbnailIcon: { fontSize: 32 },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.textPrimary },
  articleDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  articleMeta: { fontSize: FontSizes.sm, color: Colors.textLight, marginTop: 4 },
  audioBtn: {
    backgroundColor: Colors.successLight,
    borderWidth: 1.5, borderColor: Colors.success,
    borderRadius: Radius.sm, paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  audioBtnText: { color: Colors.success, fontSize: FontSizes.sm, fontWeight: '700' },
});
