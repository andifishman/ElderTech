import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

export default function MasScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppHeader title="Más" subtitle="Ver más opciones de la aplicación" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Clima */}
        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: Colors.cyanLight }]}>
            <Text style={styles.icon}>🌤️</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Clima</Text>
            <Text style={styles.cardSub}>Consultá el clima del día</Text>
            <Text style={styles.weatherText}>27°C, Soleado</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>

        {/* Radio */}
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
          <View style={[styles.iconBox, { backgroundColor: Colors.orangeLight }]}>
            <Text style={styles.icon}>📻</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Radio</Text>
            <Text style={styles.cardSub}>Escuchá la radio</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

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
            <Text style={styles.cardSub}>Divertite con ElderTech</Text>
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
    padding: Spacing.lg, shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 2,
  },
  iconBox: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  icon: { fontSize: 28 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary },
  cardSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  weatherText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.primary, marginTop: 4 },
  arrow: { fontSize: 28, color: Colors.textLight, fontWeight: 'bold' },
  backBtn: {
    backgroundColor: Colors.primaryDark, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.lg,
  },
  backBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
