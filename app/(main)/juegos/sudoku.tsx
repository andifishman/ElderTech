import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFF_LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Normal',
  hard: 'Difícil',
};

function deepCopy(board: number[][]): number[][] {
  return board.map(r => [...r]);
}

async function fetchSudoku(difficulty: Difficulty): Promise<number[][]> {
  const query = `{newboard(limit:1){grids{value,difficulty}}}`;
  const url = `https://sudoku-api.vercel.app/api/dosuku?query=${encodeURIComponent(query)}`;
  
  // Intentamos hasta 5 veces para conseguir la dificultad pedida
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json() as {
      newboard: { grids: { value: number[][]; difficulty: string }[] }
    };
    const grid = data.newboard.grids[0];
    const diffMap: Record<string, Difficulty> = { Easy: 'easy', Medium: 'medium', Hard: 'hard' };
    const gotDiff = diffMap[grid.difficulty] ?? 'easy';
    if (gotDiff === difficulty || attempt === 4) return grid.value;
  }
  throw new Error('No se pudo obtener el puzzle');
}

function isValid(board: number[][], r: number, c: number, val: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== c && board[r][i] === val) return false;
    if (i !== r && board[i][c] === val) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++)
    for (let j = bc; j < bc + 3; j++)
      if ((i !== r || j !== c) && board[i][j] === val) return false;
  return true;
}

export default function SudokuScreen() {
  const insets = useSafeAreaInsets();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<number[][]>([]);
  const [original, setOriginal] = useState<number[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [won, setWon] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);

  const loadGame = useCallback(async (diff: Difficulty) => {
    setLoading(true);
    setLoadError('');
    setSelected(null);
    setErrors(new Set());
    setWon(false);
    setMistakes(0);
    try {
      const puzzle = await fetchSudoku(diff);
      setBoard(deepCopy(puzzle));
      setOriginal(deepCopy(puzzle));
    } catch {
      setLoadError('No se pudo cargar el sudoku. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGame('easy'); }, []);

  const handleDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    loadGame(diff);
  };

  const handleNumber = (num: number) => {
    if (!selected || won || loading) return;
    const [r, c] = selected;
    if (original[r][c] !== 0) return;

    const newBoard = deepCopy(board);
    newBoard[r][c] = num;
    const newErrors = new Set(errors);
    const key = `${r},${c}`;

    if (num !== 0 && !isValid(newBoard, r, c, num)) {
      newErrors.add(key);
      setMistakes(m => m + 1);
    } else {
      newErrors.delete(key);
    }

    setBoard(newBoard);
    setErrors(newErrors);

    const complete = newBoard.every((row, ri) =>
      row.every((val, ci) => val !== 0 && !newErrors.has(`${ri},${ci}`))
    );
    if (complete && newErrors.size === 0) setWon(true);
  };

  const CELL_SIZE = 38;

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Sudoku" subtitle="Completá el tablero del 1 al 9" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando sudoku...</Text>
        </View>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <AppHeader title="Sudoku" subtitle="Completá el tablero del 1 al 9" showBack />
        <View style={styles.center}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadGame(difficulty)}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <AppHeader title="Sudoku" subtitle="Completá el tablero del 1 al 9" showBack />

      {/* Dificultad */}
      <View style={styles.diffRow}>
        {(Object.keys(DIFF_LABELS) as Difficulty[]).map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
            onPress={() => handleDifficulty(d)}
          >
            <Text style={[styles.diffBtnText, difficulty === d && styles.diffBtnTextActive]}>
              {DIFF_LABELS[d]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          Errores: <Text style={{ color: Colors.danger, fontWeight: 'bold' }}>{mistakes}</Text>
        </Text>
        <TouchableOpacity onPress={() => loadGame(difficulty)}>
          <Text style={styles.resetText}>🔄 Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Tablero */}
      <View style={styles.boardWrapper}>
        <View style={styles.board}>
          {board.map((row, r) => (
            <View key={r} style={[styles.boardRow, r % 3 === 2 && r !== 8 && styles.borderBottom]}>
              {row.map((val, c) => {
                const isOrig = original[r][c] !== 0;
                const isSel = selected?.[0] === r && selected?.[1] === c;
                const isErr = errors.has(`${r},${c}`);
                const sameLine = selected && (selected[0] === r || selected[1] === c);
                const sameBox = selected && (
                  Math.floor(selected[0] / 3) === Math.floor(r / 3) &&
                  Math.floor(selected[1] / 3) === Math.floor(c / 3)
                );
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.cell,
                      { width: CELL_SIZE, height: CELL_SIZE },
                      c % 3 === 2 && c !== 8 && styles.borderRight,
                      isSel && styles.cellSelected,
                      isErr && !isSel && styles.cellError,
                      !isSel && (sameLine || sameBox) && styles.cellHighlight,
                    ]}
                    onPress={() => setSelected([r, c])}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.cellText,
                      isOrig && styles.cellTextOrig,
                      isErr && styles.cellTextError,
                      isSel && styles.cellTextSelected,
                    ]}>
                      {val !== 0 ? val : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Teclado */}
      <View style={styles.numpad}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <TouchableOpacity
            key={n}
            style={styles.numBtn}
            onPress={() => handleNumber(n)}
            activeOpacity={0.7}
          >
            <Text style={styles.numBtnText}>{n}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.numBtn, styles.numBtnClear]}
          onPress={() => handleNumber(0)}
        >
          <Text style={[styles.numBtnText, { color: Colors.danger }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Tocá una celda y luego un número</Text>

      {/* Tutorial */}
      <Modal visible={showTutorial} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🔢</Text>
            <Text style={styles.modalTitle}>¿Cómo se juega?</Text>
            <Text style={styles.modalSub}>
              Completá el tablero con números del 1 al 9.{'\n\n'}
              Cada fila, columna y cuadrado de 3x3 debe tener todos los números del 1 al 9 sin repetir.{'\n\n'}
              Tocá una celda vacía y luego un número del teclado para completarla. Los números en rojo son incorrectos.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowTutorial(false)}>
              <Text style={styles.modalBtnText}>¡Entendido, a jugar!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal victoria */}
      <Modal visible={won} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🏆</Text>
            <Text style={styles.modalTitle}>¡Ganaste!</Text>
            <Text style={styles.modalSub}>
              Completaste el sudoku {DIFF_LABELS[difficulty]} con {mistakes} error{mistakes !== 1 ? 'es' : ''}.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => loadGame(difficulty)}>
              <Text style={styles.modalBtnText}>Nuevo sudoku</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  errorIcon: { fontSize: 48 },
  errorText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  retryBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.md },
  diffRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', padding: Spacing.md },
  diffBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, backgroundColor: Colors.white,
  },
  diffBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  diffBtnText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  diffBtnTextActive: { color: Colors.white },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  statText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  resetText: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '600' },
  boardWrapper: { alignItems: 'center', marginBottom: Spacing.md },
  board: { borderWidth: 2, borderColor: Colors.textPrimary, borderRadius: 4, overflow: 'hidden' },
  boardRow: { flexDirection: 'row' },
  borderBottom: { borderBottomWidth: 2, borderBottomColor: Colors.textPrimary },
  cell: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  borderRight: { borderRightWidth: 2, borderRightColor: Colors.textPrimary },
  cellSelected: { backgroundColor: Colors.primary },
  cellError: { backgroundColor: Colors.dangerLight },
  cellHighlight: { backgroundColor: '#E8F5E9' },
  cellText: { fontSize: FontSizes.lg, color: Colors.textSecondary },
  cellTextOrig: { color: Colors.textPrimary, fontWeight: 'bold' },
  cellTextError: { color: Colors.danger },
  cellTextSelected: { color: Colors.white, fontWeight: 'bold' },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', paddingHorizontal: Spacing.md },
  numBtn: {
    width: 52, height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  numBtnClear: { borderColor: Colors.danger },
  numBtnText: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.primary },
  hint: { textAlign: 'center', fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.xxl, width: '80%', alignItems: 'center' },
  modalIcon: { fontSize: 64, marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.sm },
  modalSub: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  modalBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: Spacing.md, width: '100%', alignItems: 'center' },
  modalBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
