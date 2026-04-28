import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <AppHeader title="Más" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Juegos */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/(main)/juegos' as any)}
        >
          <View style={[styles.iconBox, { backgroundColor: Colors.purpleLight }]}>
            <Text style={styles.icon}>🎲</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Juegos</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Noticias */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/(main)/noticias' as any)}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.icon}>📰</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Noticias</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Clima */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/(main)/clima' as any)}
        >
          <View style={[styles.iconBox, { backgroundColor: Colors.cyanLight }]}>
            <Text style={styles.icon}>🌤️</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Clima</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Radio */}
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => router.push('/(main)/radio' as any)}>
          <View style={[styles.iconBox, { backgroundColor: Colors.orangeLight }]}>
            <Text style={styles.icon}>📻</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Radio</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Utilidades */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/(main)/utilidades' as any)}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FFF9C4' }]}>
            <Text style={styles.icon}>🔦</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Linterna</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.xl, shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 2,
    minHeight: 90,
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg,
  },
  icon: { fontSize: 38 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 30, fontWeight: 'bold', color: Colors.textPrimary },
  cardSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 36, color: Colors.textLight, fontWeight: 'bold' },
  backBtn: {
    backgroundColor: Colors.primaryDark, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.lg,
  },
  backBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
