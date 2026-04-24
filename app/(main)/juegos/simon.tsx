import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// ─── Config ─────────────────────────────────────────────────────────────────
const SIZE   = 300;          // tamaño del SVG
const CX     = SIZE / 2;     // centro X
const CY     = SIZE / 2;     // centro Y
const R_OUT  = SIZE / 2 - 4; // radio exterior (con margen para el borde)
const R_IN   = 72;           // radio del hueco central
const GAP    = 2;            // ángulo de separación entre sectores (grados)

// Sectores: top-left=verde, top-right=rojo, bottom-left=amarillo, bottom-right=azul
// Ángulos: 0° = derecha, sentido horario
// Verde:    180° → 270°  (top-left)
// Rojo:     270° → 360°  (top-right)
// Amarillo: 90°  → 180°  (bottom-left)
// Azul:     0°   → 90°   (bottom-right)
const SECTORS = [
  { id: 0, label: 'Verde',    color: '#2ECC40', dim: '#0D3D12', startDeg: 180, endDeg: 270 },
  { id: 1, label: 'Rojo',     color: '#FF3B30', dim: '#6B0A05', startDeg: 270, endDeg: 360 },
  { id: 2, label: 'Amarillo', color: '#FFD600', dim: '#6B5800', startDeg:  90, endDeg: 180 },
  { id: 3, label: 'Azul',     color: '#007AFF', dim: '#003A7A', startDeg:   0, endDeg:  90 },
];

type Phase = 'idle' | 'showing' | 'input' | 'gameover' | 'won';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toRad(deg: number) { return (deg * Math.PI) / 180; }

function sectorPath(startDeg: number, endDeg: number, rOut: number, rIn: number, gap: number): string {
  const s = startDeg + gap / 2;
  const e = endDeg   - gap / 2;
  const sr = toRad(s);
  const er = toRad(e);

  const x1 = CX + rOut * Math.cos(sr);
  const y1 = CY + rOut * Math.sin(sr);
  const x2 = CX + rOut * Math.cos(er);
  const y2 = CY + rOut * Math.sin(er);
  const x3 = CX + rIn  * Math.cos(er);
  const y3 = CY + rIn  * Math.sin(er);
  const x4 = CX + rIn  * Math.cos(sr);
  const y4 = CY + rIn  * Math.sin(sr);

  return [
    `M ${x1} ${y1}`,
    `A ${rOut} ${rOut} 0 0 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rIn} ${rIn} 0 0 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

// ─── Componente tablero SVG ───────────────────────────────────────────────────
function SimonBoard({
  activeBtn,
  level,
  onPress,
  disabled,
}: {
  activeBtn: number | null;
  level: number;
  onPress: (id: number) => void;
  disabled: boolean;
}) {
  // Áreas táctiles para cada cuadrante (top-left, top-right, bottom-left, bottom-right)
  // Orden: Verde(0)=top-left, Rojo(1)=top-right, Amarillo(2)=bottom-left, Azul(3)=bottom-right
  const half = SIZE / 2;
  const quadrants = [
    { id: 0, top: 0,    left: 0,    width: half, height: half }, // Verde top-left
    { id: 1, top: 0,    left: half, width: half, height: half }, // Rojo top-right
    { id: 2, top: half, left: 0,    width: half, height: half }, // Amarillo bottom-left
    { id: 3, top: half, left: half, width: half, height: half }, // Azul bottom-right
  ];

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Borde exterior negro */}
        <Circle cx={CX} cy={CY} r={R_OUT + 3} fill="#111111" />

        {/* Sectores */}
        {SECTORS.map((s) => {
          const isActive = activeBtn === s.id;
          const fill = isActive ? s.color : s.dim;
          const path = sectorPath(s.startDeg, s.endDeg, R_OUT, R_IN + 4, GAP);
          return (
            <Path
              key={s.id}
              d={path}
              fill={fill}
            />
          );
        })}

        {/* Círculo central negro */}
        <Circle cx={CX} cy={CY} r={R_IN} fill="#1A1A1A" />
      </Svg>

      {/* Áreas táctiles superpuestas por cuadrante */}
      {quadrants.map((q) => (
        <TouchableOpacity
          key={q.id}
          style={{
            position: 'absolute',
            top: q.top,
            left: q.left,
            width: q.width,
            height: q.height,
          }}
          onPress={() => { if (!disabled) onPress(q.id); }}
          activeOpacity={0.7}
        />
      ))}

      {/* Círculo central bloqueador de toques (para no activar el cuadrante de abajo) */}
      <View
        style={{
          position: 'absolute',
          top: CY - R_IN,
          left: CX - R_IN,
          width: R_IN * 2,
          height: R_IN * 2,
          borderRadius: R_IN,
        }}
        pointerEvents="box-only"
      />
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function SimonScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sequence, setSequence]       = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [phase, setPhase]             = useState<Phase>('idle');
  const [activeBtn, setActiveBtn]     = useState<number | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [won, setWon]                 = useState(false);

  const flashButton = useCallback((id: number, duration = 550): Promise<void> => {
    return new Promise(resolve => {
      setActiveBtn(id);
      setTimeout(() => {
        setActiveBtn(null);
        setTimeout(resolve, 120);
      }, duration);
    });
  }, []);

  const playSequence = useCallback(async (seq: number[]) => {
    setPhase('showing');
    await new Promise(r => setTimeout(r, 700));
    for (const id of seq) {
      await flashButton(id, 550);
    }
    setPhase('input');
  }, [flashButton]);

  const startGame = useCallback(() => {
    const first = Math.floor(Math.random() * 4);
    const newSeq = [first];
    setSequence(newSeq);
    setPlayerIndex(0);
    setShowModal(false);
    setWon(false);
    playSequence(newSeq);
  }, [playSequence]);

  const handlePress = async (id: number) => {
    if (phase !== 'input') return;
    await flashButton(id, 300);

    if (id !== sequence[playerIndex]) {
      setPhase('gameover');
      setWon(false);
      setShowModal(true);
      return;
    }

    const nextIndex = playerIndex + 1;
    if (nextIndex === sequence.length) {
      if (sequence.length >= 20) {
        setPhase('won');
        setWon(true);
        setShowModal(true);
        return;
      }
      const next = Math.floor(Math.random() * 4);
      const newSeq = [...sequence, next];
      setSequence(newSeq);
      setPlayerIndex(0);
      setTimeout(() => playSequence(newSeq), 900);
    } else {
      setPlayerIndex(nextIndex);
    }
  };

  const phaseLabel =
    phase === 'idle'    ? 'Presioná Iniciar' :
    phase === 'showing' ? 'Mirá la secuencia…' :
    phase === 'input'   ? '¡Tu turno!' :
    phase === 'gameover'? '¡Perdiste!' : '¡Ganaste!';

  const isDisabled = phase === 'showing' || phase === 'idle';

  return (
    <View style={styles.container}>
      <AppHeader title="Simon Dice" subtitle="Repetí la secuencia de colores" showBack />

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* ── Explicación ── */}
        {phase === 'idle' && (
          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>¿Cómo se juega?</Text>
            <Text style={styles.instructionText}>
              1. Presioná <Text style={styles.bold}>Iniciar juego</Text> para comenzar.{'\n'}
              2. El tablero iluminará una secuencia de colores.{'\n'}
              3. Repetí la secuencia tocando los colores <Text style={styles.bold}>en el mismo orden</Text>.{'\n'}
              4. Cada ronda se agrega un color más. ¡Llegá lo más lejos posible!
            </Text>
          </View>
        )}

        {/* ── Stats (solo durante el juego) ── */}
        {phase !== 'idle' && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Nivel</Text>
              <Text style={styles.statValue}>{sequence.length}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Estado</Text>
              <Text style={[styles.statValue, styles.statPhase]}>{phaseLabel}</Text>
            </View>
          </View>
        )}

        {/* ── Tablero ── */}
        <View style={styles.boardWrapper}>
          <SimonBoard
            activeBtn={activeBtn}
            level={sequence.length}
            onPress={handlePress}
            disabled={isDisabled}
          />
          {/* Texto central superpuesto */}
          <View style={styles.centerOverlay} pointerEvents="none">
            <Text style={styles.centerTitle}>ElderTech</Text>
            {sequence.length > 0 && (
              <Text style={styles.centerScore}>{sequence.length}</Text>
            )}
          </View>
        </View>

        {/* ── Botón ── */}
        <TouchableOpacity
          style={[styles.startBtn, (phase === 'showing' || phase === 'input') && styles.startBtnDisabled]}
          onPress={startGame}
          disabled={phase === 'showing' || phase === 'input'}
          activeOpacity={0.8}
        >
          <Text style={styles.startBtnText}>
            {phase === 'idle' ? '▶  Iniciar juego' : '🔄  Nuevo juego'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Modal resultado ── */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>{won ? '🏆' : '😢'}</Text>
            <Text style={styles.modalTitle}>{won ? '¡Ganaste!' : '¡Perdiste!'}</Text>
            <Text style={styles.modalSub}>
              {won
                ? '¡Increíble! Completaste 20 niveles.'
                : `Llegaste al nivel ${sequence.length}.`}
            </Text>
            <TouchableOpacity style={styles.modalBtnPrimary} onPress={startGame}>
              <Text style={styles.modalBtnPrimaryText}>Jugar de nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => router.back()}>
              <Text style={styles.modalBtnSecondaryText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  scroll: {
    padding: Spacing.lg,
    alignItems: 'center',
  },

  // Instrucciones
  instructionBox: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  instructionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  instructionText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  statValue: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary },
  statPhase: { fontSize: FontSizes.md },

  // Tablero
  boardWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  centerOverlay: {
    position: 'absolute',
    width: R_IN * 2,
    height: R_IN * 2,
    borderRadius: R_IN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  centerScore: {
    color: '#AAAAAA',
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Botón iniciar
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: '#00000066',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.xxl, width: '80%', alignItems: 'center',
  },
  modalIcon: { fontSize: 64, marginBottom: Spacing.md },
  modalTitle: {
    fontSize: FontSizes.xxl, fontWeight: 'bold',
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  modalSub: {
    fontSize: FontSizes.md, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: Spacing.xl,
  },
  modalBtnPrimary: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, width: '100%',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  modalBtnPrimaryText: {
    color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold',
  },
  modalBtnSecondary: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, width: '100%', alignItems: 'center',
  },
  modalBtnSecondaryText: {
    color: Colors.primary, fontSize: FontSizes.lg, fontWeight: 'bold',
  },
});
