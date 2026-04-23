import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

const CATEGORIES = ['Todo', 'WhatsApp', 'Fotos', 'Salir'];

const articles = [
  { id: '1', title: 'Cómo usar WhatsApp', type: 'Video', duration: '5 min', category: 'WhatsApp', icon: '▶️' },
  { id: '2', title: 'Videollamadas paso a paso', type: 'Video', duration: '8 min', category: 'WhatsApp', icon: '▶️' },
  { id: '3', title: 'Enviar fotos por email', type: 'Fotos', duration: 'Guía', category: 'Fotos', icon: '📷' },
  { id: '4', title: 'Cómo cerrar una aplicación', type: 'Video', duration: '3 min', category: 'Salir', icon: '▶️' },
  { id: '5', title: 'Enviar fotos por WhatsApp', type: 'Fotos', duration: 'Guía', category: 'WhatsApp', icon: '📷' },
];

export default function ArticulosScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('Todo');
  const [search, setSearch] = useState('');

  const filtered = articles.filter((a) => {
    const matchCat = category === 'Todo' || a.category === category;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <View style={styles.container}>
      <AppHeader title="Artículos" subtitle="Aprendé a usar la tecnología" showBack />

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

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => router.push({ pathname: '/(main)/articulos/[id]', params: { id: article.id } } as any)}
          >
            <View style={styles.thumbnailBox}>
              <Text style={styles.thumbnailIcon}>{article.icon}</Text>
            </View>
            <View style={styles.articleInfo}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleMeta}>{article.type} · {article.duration}</Text>
            </View>
            <Text style={styles.articleArrow}>›</Text>
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
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
    shadowRadius: 3, elevation: 2,
  },
  thumbnailBox: {
    width: 64, height: 64, borderRadius: Radius.sm,
    backgroundColor: Colors.background, alignItems: 'center',
    justifyContent: 'center', marginRight: Spacing.md,
  },
  thumbnailIcon: { fontSize: 32 },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.textPrimary },
  articleMeta: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  articleArrow: { fontSize: 24, color: Colors.textLight },
});
