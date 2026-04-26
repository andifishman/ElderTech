import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import React, { useCallback, useState } from 'react';
import {
    Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Generador de laberinto (algoritmo DFS) ───────────────────────────────────
// Cada celda tiene paredes: N, S, E, W
type Cell = { n: boolean; s: boolean; e: boolean; w: boolean; visited: boolean };

function generateMaze(rows: number, cols: number): Cell[][] {
  const maze: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ n: true, s: true, e: true, w: true, visited: false }))
  );

  const stack: [number, number][] = [];
  const start: [number, number] = [0, 0];
  maze[0][0].visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const neighbors: [number, number, string, string][] = [];
    if (r > 0 && !maze[r-1][c].visited) neighbors.push([r-1, c, 'n', 's']);
    if (r < rows-1 && !maze[r+1][c].visited) neighbors.push([r+1, c, 's', 'n']);
    if (c > 0 && !maze[r][c-1].visited) neighbors.push([r, c-1, 'w', 'e']);
    if (c < cols-1 && !maze[r][c+1].visited) neighbors.push([r, c+1, 'e', 'w']);

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const [nr, nc, d1, d2] = neighbors[Math.floor(Math.random() * neighbors.length)];
      (maze[r][c] as any)[d1] = false;
      (maze[nr][nc] as any)[d2] = false;
      maze[nr][nc].visited = true;
      stack.push([nr, nc]);
    }
  }
  return maze;
}

const DIFFICULTIES = [
  { label: 'Fácil', rows: 7, cols: 7 },
  { label: 'Normal', rows: 10, cols: 10 },
  { label: 'Difícil', rows: 13, cols: 13 },
];

export default function LaberintoScreen() {
  const insets = useSafeAreaInsets();
  const [diffIdx, setDiffIdx] = useState(0);
  const [maze, setMaze] = useState<Cell[][]>(() => generateMaze(7, 7));
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const diff = DIFFICULTIES[diffIdx];

  const initGame = useCallback((idx: number) => {
    const d = DIFFICULTIES[idx];
    setMaze(generateMaze(d.rows, d.cols));
    setPos([0, 0]);
    setMoves(0);
    setWon(false);
    setDiffIdx(idx);
  }, []);

  const move = (dr: number, dc: number) => {
    if (won) return;
    const [r, c] = pos;
    const cell = maze[r][c];
    if (dr === -1 && cell.n) return;
    if (dr === 1 && cell.s) return;
    if (dc === -1 && cell.w) return;
    if (dc === 1 && cell.e) return;
    const nr = r + dr, nc = c + dc;
    setPos([nr, nc]);
    setMoves(m => m + 1);
    if (nr === diff.rows - 1 && nc === diff.cols - 1) setWon(true);
  };

  const CELL_SIZE = Math.min(36, Math.floor(300 / diff.cols));

  return (
    <View style={styles.container}>
      <AppHeader title="Laberinto" subtitle="Llegá a la salida" showBack />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        {/* Dificultad */}
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d, i) => (
            <TouchableOpacity
              key={d.label}
              style={[styles.diffBtn, diffIdx === i && styles.diffBtnActive]}
              onPress={() => initGame(i)}
            >
              <Text style={[styles.diffBtnText, diffIdx === i && styles.diffBtnTextActive]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Movimientos: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{moves}</Text></Text>
          <TouchableOpacity onPress={() => initGame(diffIdx)}>
            <Text style={styles.resetText}>🔄 Nuevo</Text>
          </TouchableOpacity>
        </View>

        {/* Leyenda */}
        <View style={styles.legend}>
          <Text style={styles.legendItem}>🟢 Inicio</Text>
          <Text style={styles.legendItem}>🔴 Salida</Text>
          <Text style={styles.legendItem}>🧑 Vos</Text>
        </View>

        {/* Laberinto */}
        <View style={[styles.maze, { width: CELL_SIZE * diff.cols + 2 }]}>
          {maze.map((row, r) => (
            <View key={r} style={styles.mazeRow}>
              {row.map((cell, c) => {
                const isPlayer = pos[0] === r && pos[1] === c;
                const isStart = r === 0 && c === 0;
                const isEnd = r === diff.rows - 1 && c === diff.cols - 1;
                return (
                  <View
                    key={c}
                    style={[
                      styles.mazeCell,
                      { width: CELL_SIZE, height: CELL_SIZE },
                      cell.n && styles.wallN,
                      cell.s && styles.wallS,
                      cell.e && styles.wallE,
                      cell.w && styles.wallW,
                      isEnd && styles.endCell,
                    ]}
                  >
                    {isPlayer ? (
                      <Text style={{ fontSize: CELL_SIZE * 0.6 }}>🧑</Text>
                    ) : isEnd ? (
                      <Text style={{ fontSize: CELL_SIZE * 0.6 }}>🚪</Text>
                    ) : isStart ? (
                      <Text style={{ fontSize: CELL_SIZE * 0.5 }}>⭐</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Controles */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => move(-1, 0)}>
            <Text style={styles.arrowText}>▲</Text>
          </TouchableOpacity>
          <View style={styles.arrowMiddle}>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => move(0, -1)}>
              <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>
            <View style={styles.arrowCenter} />
            <TouchableOpacity style={styles.arrowBtn} onPress={() => move(0, 1)}>
              <Text style={styles.arrowText}>▶</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => move(1, 0)}>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Modal visible={won} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>¡Saliste!</Text>
            <Text style={styles.modalSub}>Llegaste a la salida en {moves} movimientos.</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => initGame(diffIdx)}>
              <Text style={styles.modalBtnText}>Jugar de nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const WALL = 2;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, alignItems: 'center', gap: Spacing.md },
  diffRow: { flexDirection: 'row', gap: Spacing.sm },
  diffBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.white,
  },
  diffBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  diffBtnText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  diffBtnTextActive: { color: Colors.white },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: Spacing.sm },
  statText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  resetText: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: Spacing.lg },
  legendItem: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  maze: { borderWidth: 1, borderColor: Colors.textPrimary },
  mazeRow: { flexDirection: 'row' },
  mazeCell: {
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  wallN: { borderTopWidth: WALL, borderTopColor: Colors.textPrimary },
  wallS: { borderBottomWidth: WALL, borderBottomColor: Colors.textPrimary },
  wallE: { borderRightWidth: WALL, borderRightColor: Colors.textPrimary },
  wallW: { borderLeftWidth: WALL, borderLeftColor: Colors.textPrimary },
  endCell: { backgroundColor: '#E8F5E9' },
  controls: { alignItems: 'center', gap: Spacing.sm },
  arrowMiddle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  arrowCenter: { width: 60, height: 60 },
  arrowBtn: {
    width: 70, height: 70, borderRadius: Radius.md,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  arrowText: { color: Colors.white, fontSize: 28, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.xxl, width: '80%', alignItems: 'center' },
  modalIcon: { fontSize: 64, marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.sm },
  modalSub: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  modalBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: Spacing.md, width: '100%', alignItems: 'center' },
  modalBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
