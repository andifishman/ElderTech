import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

// Palabras de 6 a 9 letras
const PALABRAS = [
  'CAMINO', 'PUENTE', 'CIUDAD', 'FLORES', 'TIEMPO',
  'MUSICA', 'COCINA', 'JARDIN', 'VERANO', 'INVIERNO',
  'FAMILIA', 'AMISTAD', 'TRABAJO', 'ESCUELA', 'MERCADO',
  'VENTANA', 'CARPETA', 'CABALLO', 'PALOMAS', 'MONTANA',
  'ESTRELLA', 'MARIPOSA', 'TORTUGA', 'ELEFANTE', 'GIRASOL',
  'NARANJA', 'MANZANA', 'SANDALIA', 'SOMBRERO', 'PARAGUAS',
  'HOSPITAL', 'FARMACIA', 'IGLESIA', 'TELEFONO', 'ABUELITA',
];

const MAX_ERRORES = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getRandomWord(): string {
  const filtered = PALABRAS.filter(p => p.length >= 6 && p.length <= 9);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Componente SVG del ahorcado
// Coordenadas sobre un canvas de 200x220
// Horca: base, poste vertical, viga horizontal, soga
// Personaje: cabeza, cuerpo, brazos, piernas
function HangmanSvg({ errores, color }: { errores: number; color: string }) {
  const strokeW = 7;
  const gallowsColor = '#1A1A1A';
  const ropeColor = '#888888';

  // Punto de cuelgue de la soga
  const ropeX = 148;
  const ropeTopY = 18;
  const ropeBottomY = 42;

  // Centro del personaje
  const cx = ropeX;
  const headR = 20;
  const headTopY = ropeBottomY;
  const headCenterY = headTopY + headR;       // 62
  const neckBottomY = headCenterY + headR;    // 82
  const bodyBottomY = neckBottomY + 52;       // 134

  // Brazos
  const shoulderY = neckBottomY + 12;         // 94
  const armLen = 34;

  // Piernas
  const hipY = bodyBottomY;
  const legLen = 38;

  return (
    <Svg width={200} height={220} viewBox="0 0 200 220">
      {/* ── HORCA (siempre visible) ── */}
      {/* Base */}
      <Line x1={10} y1={210} x2={130} y2={210} stroke={gallowsColor} strokeWidth={strokeW} strokeLinecap="round" />
      {/* Poste vertical */}
      <Line x1={40} y1={210} x2={40} y2={10} stroke={gallowsColor} strokeWidth={strokeW} strokeLinecap="round" />
      {/* Viga horizontal */}
      <Line x1={40} y1={10} x2={ropeX} y2={10} stroke={gallowsColor} strokeWidth={strokeW} strokeLinecap="round" />
      {/* Soga */}
      <Line x1={ropeX} y1={10} x2={ropeX} y2={ropeBottomY} stroke={ropeColor} strokeWidth={5} strokeLinecap="round" />

      {/* ── PERSONAJE ── */}

      {/* 1 error — cabeza */}
      {errores >= 1 && (
        <Circle
          cx={cx}
          cy={headCenterY}
          r={headR}
          stroke={color}
          strokeWidth={strokeW}
          fill="none"
        />
      )}

      {/* 2 errores — cuerpo */}
      {errores >= 2 && (
        <Line
          x1={cx} y1={neckBottomY}
          x2={cx} y2={bodyBottomY}
          stroke={color} strokeWidth={strokeW} strokeLinecap="round"
        />
      )}

      {/* 3 errores — brazo izquierdo */}
      {errores >= 3 && (
        <Line
          x1={cx} y1={shoulderY}
          x2={cx - armLen} y2={shoulderY + 22}
          stroke={color} strokeWidth={strokeW} strokeLinecap="round"
        />
      )}

      {/* 4 errores — brazo derecho */}
      {errores >= 4 && (
        <Line
          x1={cx} y1={shoulderY}
          x2={cx + armLen} y2={shoulderY + 22}
          stroke={color} strokeWidth={strokeW} strokeLinecap="round"
        />
      )}

      {/* 5 errores — pierna izquierda */}
      {errores >= 5 && (
        <Line
          x1={cx} y1={hipY}
          x2={cx - legLen} y2={hipY + legLen}
          stroke={color} strokeWidth={strokeW} strokeLinecap="round"
        />
      )}

      {/* 6 errores — pierna derecha */}
      {errores >= 6 && (
        <Line
          x1={cx} y1={hipY}
          x2={cx + legLen} y2={hipY + legLen}
          stroke={color} strokeWidth={strokeW} strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

export default function AhorcadoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [palabra, setPalabra] = useState('');
  const [letrasUsadas, setLetrasUsadas] = useState<Set<string>>(new Set());
  const [errores, setErrores] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ganó, setGanó] = useState(false);

  const initGame = () => {
    setPalabra(getRandomWord());
    setLetrasUsadas(new Set());
    setErrores(0);
    setGameOver(false);
    setGanó(false);
  };

  useEffect(() => { initGame(); }, []);

  const handleLetra = (letra: string) => {
    if (letrasUsadas.has(letra) || gameOver) return;

    const nuevasUsadas = new Set(letrasUsadas);
    nuevasUsadas.add(letra);
    setLetrasUsadas(nuevasUsadas);

    if (!palabra.includes(letra)) {
      const nuevosErrores = errores + 1;
      setErrores(nuevosErrores);
      if (nuevosErrores >= MAX_ERRORES) {
        setGameOver(true);
        setGanó(false);
      }
    } else {
      const todasDescubiertas = palabra.split('').every(l => nuevasUsadas.has(l));
      if (todasDescubiertas) {
        setGameOver(true);
        setGanó(true);
      }
    }
  };

  const personColor = errores >= MAX_ERRORES ? Colors.danger : Colors.primary;

  return (
    <View style={styles.container}>
      <AppHeader title="Completar palabras" subtitle="Descubrí la palabra letra por letra" showBack />

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Errores</Text>
          <Text style={[styles.statValue, errores > 3 && { color: Colors.danger }]}>
            {errores} / {MAX_ERRORES}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Letras usadas</Text>
          <Text style={styles.statValue}>{letrasUsadas.size}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Dibujo del ahorcado */}
        <View style={styles.hangmanContainer}>
          <HangmanSvg errores={errores} color={personColor} />
        </View>

        {/* Palabra con guiones */}
        <View style={styles.wordRow}>
          {palabra.split('').map((letra, i) => (
            <View key={i} style={styles.letterBox}>
              <Text style={styles.letterText}>
                {letrasUsadas.has(letra) ? letra : ' '}
              </Text>
              <View style={styles.letterUnderline} />
            </View>
          ))}
        </View>

        {/* Letras incorrectas */}
        {errores > 0 && (
          <View style={styles.wrongSection}>
            <Text style={styles.wrongLabel}>Letras incorrectas:</Text>
            <View style={styles.wrongRow}>
              {Array.from(letrasUsadas)
                .filter(l => !palabra.includes(l))
                .map(l => (
                  <View key={l} style={styles.wrongBadge}>
                    <Text style={styles.wrongBadgeText}>{l}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Teclado */}
        <View style={styles.keyboard}>
          {ALPHABET.map((letra) => {
            const usada = letrasUsadas.has(letra);
            const correcta = usada && palabra.includes(letra);
            const incorrecta = usada && !palabra.includes(letra);
            return (
              <TouchableOpacity
                key={letra}
                style={[
                  styles.key,
                  correcta && styles.keyCorrect,
                  incorrecta && styles.keyWrong,
                  usada && styles.keyUsed,
                ]}
                onPress={() => handleLetra(letra)}
                disabled={usada || gameOver}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.keyText,
                  incorrecta && styles.keyTextWrong,
                ]}>
                  {letra}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón nuevo juego */}
        <TouchableOpacity style={styles.newGameBtn} onPress={initGame}>
          <Text style={styles.newGameBtnText}>🔄 Nuevo juego</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal resultado */}
      <Modal visible={gameOver} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>{ganó ? '🎉' : '😢'}</Text>
            <Text style={styles.modalTitle}>
              {ganó ? '¡Ganaste!' : '¡Perdiste!'}
            </Text>
            <Text style={styles.modalSub}>
              {ganó
                ? '¡Muy bien! Descubriste la palabra.'
                : `La palabra era: ${palabra}`}
            </Text>
            <TouchableOpacity style={styles.modalBtnPrimary} onPress={initGame}>
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

  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },

  hangmanContainer: {
    marginVertical: Spacing.md,
  },

  // Palabra
  wordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  letterBox: {
    alignItems: 'center',
    minWidth: 28,
  },
  letterText: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.primary,
    minHeight: 30,
  },
  letterUnderline: {
    height: 3,
    width: 28,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginTop: 2,
  },

  // Letras incorrectas
  wrongSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  wrongLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  wrongRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  wrongBadge: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  wrongBadgeText: {
    color: Colors.danger,
    fontWeight: 'bold',
    fontSize: FontSizes.sm,
  },

  // Teclado
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  key: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  keyUsed: {
    opacity: 0.4,
  },
  keyCorrect: {
    backgroundColor: Colors.success,
  },
  keyWrong: {
    backgroundColor: Colors.danger,
  },
  keyText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: FontSizes.md,
  },
  keyTextWrong: {
    color: Colors.white,
  },

  // Botón nuevo juego
  newGameBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.md,
  },
  newGameBtnText: {
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
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.sm, width: '100%', alignItems: 'center',
  },
  modalBtnPrimaryText: {
    color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold',
  },
  modalBtnSecondary: {
    borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxl,
    width: '100%', alignItems: 'center',
  },
  modalBtnSecondaryText: {
    color: Colors.primary, fontSize: FontSizes.lg, fontWeight: 'bold',
  },
});
