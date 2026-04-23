import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
} from 'react-native';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';
import { useRouter } from 'expo-router';

const EMOJIS = ['🌸', '🦋', '🎵', '⭐', '🐶', '🌈'];

function shuffle<T>(arr: T[]): T[] {
  return [...arr, ...arr]
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export default function MemotestScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairs, setPairs] = useState(0);
  const [won, setWon] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const initGame = () => {
    const shuffled = shuffle(EMOJIS).map((emoji, id) => ({
      id, emoji, flipped: false, matched: false,
    }));
    setCards(shuffled);
    setSelected([]);
    setMoves(0);
    setPairs(0);
    setWon(false);
    setDisabled(false);
  };

  useEffect(() => { initGame(); }, []);

  const handlePress = (id: number) => {
    if (disabled) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    if (selected.length === 1 && selected[0] === id) return;

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);

    if (selected.length === 0) {
      setSelected([id]);
    } else {
      const firstId = selected[0];
      setSelected([]);
      setMoves((m) => m + 1);
      setDisabled(true);

      if (newCards[firstId].emoji === newCards[id].emoji) {
        // Match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => c.id === firstId || c.id === id ? { ...c, matched: true } : c)
          );
          const newPairs = pairs + 1;
          setPairs(newPairs);
          setDisabled(false);
          if (newPairs === EMOJIS.length) setWon(true);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => c.id === firstId || c.id === id ? { ...c, flipped: false } : c)
          );
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Memotest" subtitle="Encontrá los pares de cartas" showBack />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Movimientos</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Pares encontrados</Text>
          <Text style={styles.statValue}>{pairs} / {EMOJIS.length}</Text>
        </View>
      </View>

      <Text style={styles.hint}>Tocá las cartas para darles vuelta</Text>

      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.flipped || card.matched ? styles.cardFlipped : styles.cardHidden,
              card.matched && styles.cardMatched,
            ]}
            onPress={() => handlePress(card.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardEmoji}>
              {card.flipped || card.matched ? card.emoji : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.newGameBtn} onPress={initGame}>
        <Text style={styles.newGameBtnText}>🔄 Nuevo juego</Text>
      </TouchableOpacity>

      {/* Win modal */}
      <Modal visible={won} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.winIcon}>🎉</Text>
            <Text style={styles.winTitle}>¡Ganaste!</Text>
            <Text style={styles.winSub}>¡Muy bien! Encontraste todos los pares.</Text>
            <TouchableOpacity style={styles.winBtn} onPress={() => router.back()}>
              <Text style={styles.winBtnText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: Colors.white, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  statValue: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary },
  hint: {
    textAlign: 'center', fontSize: FontSizes.sm,
    color: Colors.textSecondary, paddingVertical: Spacing.md,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', paddingHorizontal: Spacing.lg, gap: Spacing.sm,
  },
  card: {
    width: 72, height: 72, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  cardHidden: { backgroundColor: Colors.primary },
  cardFlipped: { backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.primary },
  cardMatched: { backgroundColor: Colors.successLight, borderWidth: 2, borderColor: Colors.success },
  cardEmoji: { fontSize: 36 },
  newGameBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center',
    marginHorizontal: Spacing.xl, marginTop: Spacing.xl,
  },
  newGameBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, backgroundColor: '#00000066',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.xxl, width: '80%', alignItems: 'center',
  },
  winIcon: { fontSize: 64, marginBottom: Spacing.md },
  winTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.sm },
  winSub: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  winBtn: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxl,
  },
  winBtnText: { color: Colors.primary, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
