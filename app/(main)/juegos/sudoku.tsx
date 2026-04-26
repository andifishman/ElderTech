import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import React, { useCallback, useState } from 'react';
import {
    Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Puzzles predefinidos (fácil) ─────────────────────────────────────────────
// 0 = celda vacía
const PUZZLES: number[][][] = [
  [
    [5,3,0, 0,7,0, 0,0,0],
    [6,0,0, 1,9,5, 0,0,0],
    [0,9,8, 0,0,0, 0,6,0],
    [8,0,0, 0,6,0, 0,0,3],
    [4,0,0, 8,0,3, 0,0,1],
    [7,0,0, 0,2,0, 0,0,6],
    [0,6,0, 0,0,0, 2,8,0],
    [0,0,0, 4,1,9, 0,0,5],
    [0,0,0, 0,8,0, 0,7,9],
  ],
  [
    [0,0,0, 2,6,0, 7,0,1],
    [6,8,0, 0,7,0, 0,9,0],
    [1,9,0, 0,0,4, 5,0,0],
    [8,2,0, 1,0,0, 0,4,0],
    [0,0,4, 6,0,2, 9,0,0],
    [0,5,0, 0,0,3, 0,2,8],
    [0,0,9, 3,0,0, 0,7,4],
    [0,4,0, 0,5,0, 0,3,6],
    [7,0,3, 0,1,8, 0,0,0],
  ],
  [
    [1,0,0, 4,8,9, 0,0,6],
    [7,3,0, 0,0,0, 0,4,0],
    [0,0,0, 0,0,1, 2,9,5],
    [0,0,7, 1,2,0, 6,0,0],
    [5,0,0, 7,0,3, 0,0,8],
    [0,0,6, 0,9,5, 7,0,0],
    [9,1,4, 6,0,0, 0,0,0],
    [0,2,0, 0,0,0, 0,3,7],
    [8,0,0, 5,1,2, 0,0,4],
  ],
];

function deepCopy(board: number[][]): number[][] {
  return board.map(r => [...r]);
}

export default function SudokuScreen() {
  const insets = useSafeAreaInsets();
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [board, setBoard] = useState<number[][]>(() => deepCopy(PUZZLES[0]));
  const [original, setOriginal] = useState<number[][]>(() => deepCopy(PUZZLES[0]));
  const [selected, setSelected] = useState<[number,number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [won, setWon] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const initGame = useCallback((idx: number) => {
    const puzzle = deepCopy(PUZZLES[idx]);
    setBoard(deepCopy(puzzle));
    setOriginal(deepCopy(puzzle));
    setSelected(null);
    setErrors(new Set());
    setWon(false);
    setMistakes(0);
    setPuzzleIdx(idx);
  }, []);

  const isValid = (b: number[][], r: number, c: number, val: number) => {
    for (let i = 0; i < 9; i++) {
      if (i !== c && b[r][i] === val) return false;
      if (i !== r && b[i][c] === val) return false;
    }
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let i = br; i < br + 3; i++)
      for (let j = bc; j < bc + 3; j++)
        if ((i !== r || j !== c) && b[i][j] === val) return false;
    return true;
  };

  const handleNumber = (num: number) => {
    if (!selected || won) return;
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

    // Verificar victoria
    const complete = newBoard.every((row, ri) =>
      row.every((val, ci) => val !== 0 && !newErrors.has(`${ri},${ci}`))
    );
    if (complete && newErrors.size === 0) setWon(true);
  };

  const cellKey = (r: number, c: number) => `${r},${c}`;

  return (
    <View style={styles.container}>
      <AppHeader title="Sudoku" subtitle="Completá el tablero del 1 al 9" showBack />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        {/* Selector de puzzle */}
        <View style={styles.puzzleRow}>
          {PUZZLES.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.puzzleBtn, puzzleIdx === i && styles.puzzleBtnActive]}
              onPress={() => initGame(i)}
            >
              <Text style={[styles.puzzleBtnText, puzzleIdx === i && styles.puzzleBtnTextActive]}>
                Puzzle {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Errores */}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Errores: <Text style={{ color: Colors.danger, fontWeight: 'bold' }}>{mistakes}</Text></Text>
          <TouchableOpacity onPress={() => initGame(puzzleIdx)}>
            <Text style={styles.resetText}>🔄 Reiniciar</Text>
          </TouchableOpacity>
        </View>

        {/* Tablero */}
        <View style={styles.board}>
          {board.map((row, r) => (
            <View key={r} style={[styles.boardRow, r % 3 === 2 && r !== 8 && styles.borderBottom]}>
              {row.map((val, c) => {
                const isOrig = original[r][c] !== 0;
                const isSel = selected?.[0] === r && selected?.[1] === c;
                const isErr = errors.has(cellKey(r, c));
                const sameSel = selected && (selected[0] === r || selected[1] === c);
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.cell,
                      c % 3 === 2 && c !== 8 && styles.borderRight,
                      isSel && styles.cellSelected,
                      isErr && styles.cellError,
                      !isSel && sameSel && styles.cellHighlight,
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

        {/* Teclado numérico */}
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
          <TouchableOpacity style={[styles.numBtn, styles.numBtnClear]} onPress={() => handleNumber(0)}>
            <Text style={styles.numBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Tocá una celda y luego un número para completarla</Text>

      </ScrollView>

      <Modal visible={won} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🏆</Text>
            <Text style={styles.modalTitle}>¡Ganaste!</Text>
            <Text style={styles.modalSub}>Completaste el sudoku con {mistakes} error{mistakes !== 1 ? 'es' : ''}.</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => initGame(puzzleIdx)}>
              <Text style={styles.modalBtnText}>Jugar de nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CELL_SIZE = 38;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, alignItems: 'center', gap: Spacing.md },
  puzzleRow: { flexDirection: 'row', gap: Spacing.sm },
  puzzleBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.white,
  },
  puzzleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  puzzleBtnText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  puzzleBtnTextActive: { color: Colors.white },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: Spacing.sm },
  statText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  resetText: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '600' },
  board: {
    borderWidth: 2, borderColor: Colors.textPrimary, borderRadius: 4,
    overflow: 'hidden',
  },
  boardRow: { flexDirection: 'row' },
  borderBottom: { borderBottomWidth: 2, borderBottomColor: Colors.textPrimary },
  cell: {
    width: CELL_SIZE, height: CELL_SIZE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  borderRight: { borderRightWidth: 2, borderRightColor: Colors.textPrimary },
  cellSelected: { backgroundColor: Colors.primary },
  cellError: { backgroundColor: Colors.dangerLight },
  cellHighlight: { backgroundColor: '#E8F5E9' },
  cellText: { fontSize: FontSizes.lg, color: Colors.textSecondary },
  cellTextOrig: { color: Colors.textPrimary, fontWeight: 'bold' },
  cellTextError: { color: Colors.danger },
  cellTextSelected: { color: Colors.white, fontWeight: 'bold' },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', width: '100%' },
  numBtn: {
    width: 56, height: 56, borderRadius: Radius.md,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  numBtnClear: { borderColor: Colors.danger },
  numBtnText: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.primary },
  hint: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.xxl, width: '80%', alignItems: 'center' },
  modalIcon: { fontSize: 64, marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.sm },
  modalSub: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  modalBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: Spacing.md, width: '100%', alignItems: 'center' },
  modalBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
