import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';

// Pool completo de emojis tecnológicos + algunos clásicos
const ALL_EMOJIS = [
  '💻', '📱', '😁', '🖥️', '❤️', '😎', '📷', '📸',
  '📺', '🍕', '🎧', '🔋', '🍔', '💿', '🍟', '🌭',
  // '🚗', '✈️', '☎️', '🚀', '🐬', '🐯', '🦆', '🐧','🦁','🐭','🐴','🐼','🐔',
];

// Dificultades
const DIFFICULTIES = [
  { label: 'Fácil',   pairs: 4,  icon: '😊', color: Colors.success,  colorLight: Colors.successLight },
  { label: 'Normal',  pairs: 6,  icon: '🙂', color: Colors.info,     colorLight: Colors.infoLight    },
  { label: 'Difícil', pairs: 10, icon: '🚨', color: Colors.warning,  colorLight: '#FFF3E0'            },
  { label: 'Experto', pairs: 12, icon: '🔥', color: Colors.danger,   colorLight: Colors.dangerLight  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr]
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

function getEmojis(count: number): string[] {
  return shuffle(ALL_EMOJIS).slice(0, count);
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

type Screen = 'difficulty' | 'game';

export default function MemotestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>('difficulty');
  const [selectedDiff, setSelectedDiff] = useState(DIFFICULTIES[1]); // Normal por defecto
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairs, setPairs] = useState(0);
  const [won, setWon] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const initGame = (diff = selectedDiff) => {
    const emojis = getEmojis(diff.pairs);
    const shuffled = shuffle([...emojis, ...emojis]).map((emoji, id) => ({
      id, emoji, flipped: false, matched: false,
    }));
    setCards(shuffled);
    setSelected([]);
    setMoves(0);
    setPairs(0);
    setWon(false);
    setDisabled(false);
    setScreen('game');
  };

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
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => c.id === firstId || c.id === id ? { ...c, matched: true } : c)
          );
          const newPairs = pairs + 1;
          setPairs(newPairs);
          setDisabled(false);
          if (newPairs === selectedDiff.pairs) setWon(true);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => c.id === firstId || c.id === id ? { ...c, flipped: false } : c)
          );
          setDisabled(false);
        }, 1000);
      }
    }
  };

  // Tamaño de carta según cantidad de pares
  const cardSize = selectedDiff.pairs <= 6 ? 80 : selectedDiff.pairs <= 10 ? 66 : 58;
  const emojiSize = selectedDiff.pairs <= 6 ? 38 : selectedDiff.pairs <= 10 ? 30 : 26;

  // ── Pantalla de selección de dificultad ──────────────────────────────────
  if (screen === 'difficulty') {
    return (
      <View style={styles.container}>
        <AppHeader title="Memotest" subtitle="Encontrá los pares de cartas" showBack />
        <ScrollView contentContainerStyle={[styles.diffContent, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.diffTitle}>Elegí la dificultad</Text>
          <Text style={styles.diffSubtitle}>¿Cuántos pares querés encontrar?</Text>

          {DIFFICULTIES.map((diff) => (
            <TouchableOpacity
              key={diff.label}
              style={[
                styles.diffCard,
                { backgroundColor: diff.colorLight, borderColor: diff.color },
                selectedDiff.label === diff.label && { borderWidth: 3 },
              ]}
              onPress={() => setSelectedDiff(diff)}
              activeOpacity={0.8}
            >
              <Text style={styles.diffIcon}>{diff.icon}</Text>
              <View style={styles.diffInfo}>
                <Text style={[styles.diffLabel, { color: diff.color }]}>{diff.label}</Text>
                <Text style={styles.diffPairs}>{diff.pairs} pares · {diff.pairs * 2} cartas</Text>
              </View>
              {selectedDiff.label === diff.label && (
                <View style={[styles.diffCheck, { backgroundColor: diff.color }]}>
                  <Text style={styles.diffCheckText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: selectedDiff.color }]}
            onPress={() => initGame(selectedDiff)}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>▶  Empezar juego</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Pantalla de juego ────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <AppHeader title="Memotest" subtitle={`Dificultad: ${selectedDiff.label}`} showBack />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Movimientos</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Pares encontrados</Text>
          <Text style={styles.statValue}>{pairs} / {selectedDiff.pairs}</Text>
        </View>
      </View>

      <Text style={styles.hint}>Tocá las cartas para darles vuelta</Text>

      <ScrollView contentContainerStyle={styles.gridWrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                { width: cardSize, height: cardSize },
                card.flipped || card.matched ? styles.cardFlipped : styles.cardHidden,
                card.matched && styles.cardMatched,
              ]}
              onPress={() => handlePress(card.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardEmoji, { fontSize: emojiSize }]}>
                {card.flipped || card.matched ? card.emoji : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomRow, { marginBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.changeDiffBtn} onPress={() => setScreen('difficulty')} activeOpacity={0.8}>
          <Text style={styles.changeDiffText}>⚙️ Dificultad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newGameBtn} onPress={() => initGame(selectedDiff)} activeOpacity={0.8}>
          <Text style={styles.newGameBtnText}>🔄 Nuevo juego</Text>
        </TouchableOpacity>
      </View>

      {/* Win modal */}
      <Modal visible={won} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.winIcon}>🎉</Text>
            <Text style={styles.winTitle}>¡Ganaste!</Text>
            <Text style={styles.winSub}>
              ¡Muy bien! Encontraste los {selectedDiff.pairs} pares en {moves} movimientos.
            </Text>
            <TouchableOpacity style={[styles.winBtnPrimary, { backgroundColor: selectedDiff.color }]} onPress={() => initGame(selectedDiff)}>
              <Text style={styles.winBtnPrimaryText}>Jugar de nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.winBtnSecondary} onPress={() => setScreen('difficulty')}>
              <Text style={[styles.winBtnSecondaryText, { color: selectedDiff.color }]}>Cambiar dificultad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.winBtnBack} onPress={() => router.back()}>
              <Text style={styles.winBtnBackText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ── Dificultad ──
  diffContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 32,
  },
  diffTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  diffSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  diffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diffIcon: { fontSize: 36, marginRight: Spacing.md },
  diffInfo: { flex: 1 },
  diffLabel: { fontSize: FontSizes.xl, fontWeight: 'bold' },
  diffPairs: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  diffCheck: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  diffCheckText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.md },
  startBtn: {
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  startBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },

  // ── Juego ──
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
  gridWrapper: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: Spacing.sm,
  },
  card: {
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  cardHidden: { backgroundColor: Colors.primary },
  cardFlipped: { backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.primary },
  cardMatched: { backgroundColor: Colors.successLight, borderWidth: 2, borderColor: Colors.success },
  cardEmoji: {},

  // Botones inferiores
  bottomRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  changeDiffBtn: {
    flex: 1,
    borderWidth: 2, borderColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  changeDiffText: { color: Colors.primary, fontSize: FontSizes.md, fontWeight: 'bold' },
  newGameBtn: {
    flex: 2,
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  newGameBtnText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: 'bold' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: '#00000066',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.xxl, width: '85%', alignItems: 'center',
  },
  winIcon: { fontSize: 64, marginBottom: Spacing.md },
  winTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.sm },
  winSub: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  winBtnPrimary: {
    borderRadius: Radius.sm, paddingVertical: Spacing.md,
    width: '100%', alignItems: 'center', marginBottom: Spacing.sm,
  },
  winBtnPrimaryText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.lg },
  winBtnSecondary: {
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: Radius.sm, paddingVertical: Spacing.md,
    width: '100%', alignItems: 'center', marginBottom: Spacing.sm,
  },
  winBtnSecondaryText: { fontWeight: 'bold', fontSize: FontSizes.md },
  winBtnBack: {
    paddingVertical: Spacing.sm,
  },
  winBtnBackText: { color: Colors.textSecondary, fontSize: FontSizes.md },
});
