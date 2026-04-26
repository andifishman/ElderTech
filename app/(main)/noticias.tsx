import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── GNews API ────────────────────────────────────────────────────────────────
// Gratis en: https://gnews.io  (100 requests/día, sin tarjeta)
// Registrate, copiá tu API key y pegala acá:
const GNEWS_API_KEY = '5df81563f66c3668645c95b6f5cf3ba5';

const NEWS_URL = `https://gnews.io/api/v4/top-headlines?lang=es&country=ar&max=20&apikey=${GNEWS_API_KEY}`;

interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: { name: string };
  description: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

export default function NoticiasScreen() {
  const insets = useSafeAreaInsets();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchNews = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(NEWS_URL);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json() as { articles?: NewsItem[] };
      if (!data.articles) throw new Error('Sin noticias');
      setNews(data.articles);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Error: ${msg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const openNews = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Noticias" subtitle="Las noticias más importantes del día" showBack />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando noticias...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchNews}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        >
          <Text style={styles.hint}>Tocá una noticia para leerla completa</Text>
          {news.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.card}
              onPress={() => openNews(item.url)}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <Text style={styles.newsNumber}>{i + 1}</Text>
                <Text style={styles.title}>{item.title}</Text>
              </View>
              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <View style={styles.cardBottom}>
                <Text style={styles.source}>📰 {item.source.name}</Text>
                <Text style={styles.time}>{timeAgo(item.publishedAt)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, fontSize: FontSizes.md, color: Colors.textSecondary },
  errorIcon: { fontSize: 48, marginBottom: Spacing.md },
  errorText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  retryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
  },
  retryBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.md },
  list: { padding: Spacing.lg, gap: Spacing.md },
  hint: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xs },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, gap: Spacing.sm,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  cardTop: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  newsNumber: {
    fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.primary,
    minWidth: 28,
  },
  title: { flex: 1, fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, lineHeight: 22 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  source: { fontSize: FontSizes.sm, color: Colors.textSecondary, flex: 1 },
  time: { fontSize: FontSizes.sm, color: Colors.textLight },
  description: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, paddingLeft: 28 + Spacing.md },
});
