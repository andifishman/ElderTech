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

const games = [
  {
    id: 'memotest',
    icon: '🃏',
    title: 'Memotest',
    subtitle: 'Encontrá los pares de cartas',
    color: Colors.cyanLight,
    iconBg: Colors.cyan,
  },
  {
    id: 'palabras',
    icon: '🔤',
    title: 'Ahorcado',
    subtitle: 'Encontrá la letra que falta',
    color: Colors.purpleLight,
    iconBg: Colors.purple,
  },
  {
    id: 'simon',
    icon: '🟢',
    title: 'Simon Dice',
    subtitle: 'Repetí la secuencia de colores',
    color: Colors.successLight,
    iconBg: Colors.success,
  },
  {
    id: 'conexiones',
    icon: '🔗',
    title: 'Conexiones',
    subtitle: 'Agrupá las palabras por categoría',
    color: Colors.infoLight,
    iconBg: Colors.info,
  },
  {
    id: 'sopa',
    icon: '🔤',
    title: 'Sopa de letras',
    subtitle: 'Encontrá las palabras escondidas',
    color: Colors.orangeLight,
    iconBg: Colors.orange,
  },
  {
    id: 'sudoku',
    icon: '🔢',
    title: 'Sudoku',
    subtitle: 'Completá el tablero del 1 al 9',
    color: Colors.purpleLight,
    iconBg: Colors.purple,
  },
  {
    id: 'laberinto',
    icon: '🌀',
    title: 'Laberinto',
    subtitle: 'Llegá a la salida desde el inicio',
    color: Colors.successLight,
    iconBg: Colors.success,
  },
];

export default function JuegosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <AppHeader title="Juegos" subtitle="Divertite con ElderTech" showBack />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Elegí un juego</Text>
        {games.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.card, { backgroundColor: game.color }]}
            onPress={() => {
              if (game.id === 'memotest') {
                router.push('/(main)/juegos/memotest' as any);
              } else if (game.id === 'palabras') {
                router.push('/(main)/juegos/ahorcado' as any);
              } else if (game.id === 'simon') {
                router.push('/(main)/juegos/simon' as any);
              } else if (game.id === 'conexiones') {
                router.push('/(main)/juegos/conexiones' as any);
              } else if (game.id === 'sopa') {
                router.push('/(main)/juegos/sopa' as any);
              } else if (game.id === 'sudoku') {
                router.push('/(main)/juegos/sudoku' as any);
              } else if (game.id === 'laberinto') {
                router.push('/(main)/juegos/laberinto' as any);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: game.iconBg }]}>
              <Text style={styles.icon}>{game.icon}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{game.title}</Text>
              <Text style={styles.cardSub}>{game.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md },
  heading: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg, padding: Spacing.lg,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  icon: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary },
  cardSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 28, color: Colors.textLight, fontWeight: 'bold' },
});
