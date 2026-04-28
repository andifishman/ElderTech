import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── API ──────────────────────────────────────────────────────────────────────

const GUTENDEX = 'https://gutendex.com/books';

interface GutBook {
  id: number;
  title: string;
  authors: { name: string }[];
  formats: Record<string, string>;
  subjects: string[];
  languages: string[];
  download_count: number;
}

interface GutResponse {
  count: number;
  next: string | null;
  results: GutBook[];
}

// ─── Categorías curadas ───────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'todo',       label: 'Todo',        emoji: '📚', query: '' },
  { key: 'cuentos',    label: 'Cuentos',     emoji: '🧚', query: 'subject=short+stories' },
  { key: 'novelas',    label: 'Novelas',     emoji: '📖', query: 'topic=novel' },
  { key: 'aventura',   label: 'Aventura',    emoji: '⚔️',  query: 'topic=adventure' },
  { key: 'amor',       label: 'Romance',     emoji: '💕', query: 'topic=love+stories' },
  { key: 'misterio',   label: 'Misterio',    emoji: '🔍', query: 'topic=detective' },
  { key: 'poesia',     label: 'Poesía',      emoji: '🌸', query: 'topic=poetry' },
  { key: 'humor',      label: 'Humor',       emoji: '😄', query: 'topic=humor' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTextUrl(book: GutBook): string | null {
  // Preferir texto plano UTF-8, luego ASCII, luego HTML
  return (
    book.formats['text/plain; charset=utf-8'] ||
    book.formats['text/plain; charset=us-ascii'] ||
    book.formats['text/plain'] ||
    null
  );
}

function getCoverUrl(book: GutBook): string | null {
  return book.formats['image/jpeg'] ?? null;
}

function getAuthor(book: GutBook): string {
  if (!book.authors.length) return 'Autor desconocido';
  const raw = book.authors[0].name;
  // Gutenberg guarda "Apellido, Nombre" → invertir
  const parts = raw.split(',');
  return parts.length === 2 ? `${parts[1].trim()} ${parts[0].trim()}` : raw;
}

async function fetchBooks(query: string, page = 1): Promise<GutResponse> {
  const lang = 'languages=es';
  const pageParam = `page=${page}`;
  const q = query ? `&${query}` : '';
  const url = `${GUTENDEX}?${lang}${q}&${pageParam}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar libros');
  return res.json() as Promise<GutResponse>;
}

async function searchBooks(text: string, page = 1): Promise<GutResponse> {
  const url = `${GUTENDEX}?languages=es&search=${encodeURIComponent(text)}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al buscar');
  return res.json() as Promise<GutResponse>;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function BibliotecaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [catKey, setCatKey] = useState('todo');
  const [books, setBooks] = useState<GutBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const load = useCallback(async (key: string, page = 1, append = false) => {
    if (page === 1) setLoading(true); else setLoadingMore(true);
    try {
      const cat = CATEGORIES.find(c => c.key === key)!;
      const data = await fetchBooks(cat.query, page);
      setBooks(prev => append ? [...prev, ...data.results] : data.results);
      setNextPage(data.next ? page + 1 : null);
    } catch { /* ignorar */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  const doSearch = useCallback(async (text: string, page = 1, append = false) => {
    if (!text.trim()) { setSearchActive(false); load(catKey); return; }
    if (page === 1) setLoading(true); else setLoadingMore(true);
    setSearchActive(true);
    try {
      const data = await searchBooks(text, page);
      setBooks(prev => append ? [...prev, ...data.results] : data.results);
      setNextPage(data.next ? page + 1 : null);
    } catch { /* ignorar */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, [catKey, load]);

  useEffect(() => { load('todo'); }, []);

  const handleCat = (key: string) => {
    setCatKey(key);
    setSearch('');
    setSearchActive(false);
    load(key);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.length === 0) { setSearchActive(false); load(catKey); }
    else if (text.length >= 3) doSearch(text);
  };

  const handleLoadMore = () => {
    if (!nextPage || loadingMore) return;
    if (searchActive) doSearch(search, nextPage, true);
    else load(catKey, nextPage, true);
  };

  const openBook = (book: GutBook) => {
    const textUrl = getTextUrl(book);
    if (!textUrl) return;
    router.push({
      pathname: '/(main)/lector',
      params: {
        id: book.id,
        title: book.title,
        author: getAuthor(book),
        url: textUrl,
        cover: getCoverUrl(book) ?? '',
      },
    } as any);
  };

  const renderBook = ({ item }: { item: GutBook }) => {
    const cover = getCoverUrl(item);
    const hasText = !!getTextUrl(item);
    return (
      <TouchableOpacity
        style={[styles.bookCard, !hasText && styles.bookCardDisabled]}
        activeOpacity={hasText ? 0.8 : 1}
        onPress={() => hasText && openBook(item)}
      >
        <View style={styles.coverBox}>
          {cover ? (
            <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>📖</Text>
            </View>
          )}
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{getAuthor(item)}</Text>
          {!hasText && <Text style={styles.noText}>Sin texto disponible</Text>}
        </View>
        {hasText && <Text style={styles.bookArrow}>›</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Biblioteca" subtitle="Libros y cuentos para leer" showBack />

      {/* Buscador */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar libro o autor..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
          onSubmitEditing={() => doSearch(search)}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categorías */}
      {!searchActive && (
        <View style={styles.catWrapper}>
          <FlatList
            data={CATEGORIES}
            horizontal
            keyExtractor={c => c.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catList}
            renderItem={({ item: cat }) => (
              <TouchableOpacity
                style={[styles.catBtn, catKey === cat.key && styles.catBtnActive]}
                onPress={() => handleCat(cat.key)}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, catKey === cat.key && styles.catLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Lista de libros */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando libros...</Text>
        </View>
      ) : books.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>No se encontraron libros</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={b => String(b.id)}
          renderItem={renderBook}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  searchIcon: { fontSize: 18 },
  searchInput: {
    flex: 1, fontSize: FontSizes.md, color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  clearBtn: { fontSize: 16, color: Colors.textLight, paddingHorizontal: 4 },

  catWrapper: {
    height: 52,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  catList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  catLabelActive: { color: Colors.white },

  list: { padding: Spacing.md, gap: Spacing.sm },
  bookCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  bookCardDisabled: { opacity: 0.5 },
  coverBox: { marginRight: Spacing.md },
  cover: { width: 60, height: 84, borderRadius: Radius.sm },
  coverPlaceholder: {
    width: 60, height: 84, borderRadius: Radius.sm,
    backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center',
  },
  coverPlaceholderText: { fontSize: 28 },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.textPrimary, lineHeight: 22 },
  bookAuthor: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  noText: { fontSize: FontSizes.xs, color: Colors.textLight, marginTop: 4 },
  bookArrow: { fontSize: 28, color: Colors.textLight, fontWeight: 'bold', paddingLeft: Spacing.sm },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: FontSizes.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: Colors.textSecondary, fontSize: FontSizes.lg },
});
