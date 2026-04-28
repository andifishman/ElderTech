import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Temas ────────────────────────────────────────────────────────────────────
const TEMAS = [
  { nombre: 'Frutas',       palabras: ['MANZANA','PERA','UVA','LIMON','MELON','SANDIA','NARANJA','DURAZNO','BANANA','CIRUELA','FRUTILLA','KIWI','MANGO','CEREZA','POMELO','MANDARINA','HIGO','FRAMBUESA','PAPAYA','COCO','ANANA','GUAYABA','MARACUYA','DAMASCO','MEMBRILLO'] },
  { nombre: 'Verduras',     palabras: ['PAPA','TOMATE','CEBOLLA','ZANAHORIA','LECHUGA','ZAPALLO','ACELGA','ESPINACA','BROCOLI','PEPINO','APIO','CHOCLO','BERENJENA','AJO','PUERRO','NABO','RABANITO','ALCAUCIL','COLIFLOR','REMOLACHA','ARVEJA','CHAUCHA','HINOJO','BATATA','MORRÓN'] },
  { nombre: 'Animales',     palabras: ['PERRO','GATO','LEON','TIGRE','OSO','LOBO','VACA','CABALLO','CONEJO','MONO','ELEFANTE','JIRAFA','DELFIN','TORTUGA','AGUILA','COCODRILO','CEBRA','HIPOPOTAMO','RINOCERONTE','PINGUINO','FLAMENCO','CAMELLO','CANGURO','KOALA','PANDA','BALLENA','TIBURON','PULPO','MEDUSA','CANGREJO'] },
  { nombre: 'Colores',      palabras: ['ROJO','AZUL','VERDE','ROSA','NEGRO','BLANCO','GRIS','CELESTE','AMARILLO','NARANJA','VIOLETA','MARRON','TURQUESA','MAGENTA','BEIGE','DORADO','PLATEADO','INDIGO','CORAL','SALMON','OCRE','CIAN','LILA','BORDO','OLIVA'] },
  { nombre: 'Paises',       palabras: ['ARGENTINA','BRASIL','CHILE','PERU','MEXICO','FRANCIA','ITALIA','JAPON','ESPANA','CHINA','ALEMANIA','CANADA','AUSTRALIA','RUSIA','INDIA','EGIPTO','GRECIA','PORTUGAL','COLOMBIA','CUBA','TURQUIA','SUECIA','NORUEGA','HOLANDA','BELGICA'] },
  { nombre: 'Deportes',     palabras: ['FUTBOL','TENIS','GOLF','BOXEO','RUGBY','POLO','REMO','JUDO','NATACION','CICLISMO','VOLEY','BASQUET','ATLETISMO','ESGRIMA','KARATE','HOCKEY','BEISBOL','SOFTBOL','ESQUI','SURF','ESCALADA','PATINAJE','HANDBALL','WATERPOLO','TAEKWONDO'] },
  { nombre: 'Flores',       palabras: ['ROSA','CLAVEL','TULIPAN','GIRASOL','JAZMIN','MARGARITA','LILA','DALIA','AMAPOLA','BEGONIA','LAVANDA','ORQUIDEA','AZALEA','CAMELIA','GARDENIA','PETUNIA','VIOLETA','MAGNOLIA','CRISANTEMO','NARCISO','GLADIOLO','HORTENSIA','LIRIO','GERANIO','NARDO'] },
  { nombre: 'Comidas',      palabras: ['PIZZA','MILANESA','EMPANADA','ASADO','FIDEOS','ARROZ','SOPA','ENSALADA','TARTA','LOCRO','CHORIPAN','ALFAJOR','HUMITA','CARBONADA','CAZUELA','GUISO','ESTOFADO','REVUELTO','TORTILLA','CROQUETA','CANELONES','LASAGNA','RISOTTO','PAELLA','CEVICHE'] },
  { nombre: 'Ropa',         palabras: ['CAMISA','PANTALON','VESTIDO','ABRIGO','BUFANDA','GORRO','ZAPATOS','MEDIAS','REMERA','CAMPERA','CORBATA','GUANTES','POLLERA','BERMUDA','CALZADO','BOTAS','SANDALIAS','CHALECO','PIJAMA','BATA','DELANTAL','OVEROL','BIKINI','TRAJE','CAMISETA'] },
  { nombre: 'Muebles',      palabras: ['SILLA','MESA','CAMA','SOFA','ARMARIO','ESCRITORIO','ESTANTE','SILLON','COMODA','ROPERO','BANQUETA','VITRINA','APARADOR','CAJONERA','PERCHERO','BIBLIOTECA','PUPITRE','MECEDORA','HAMACA','OTOMANA','BAULERA','CHIFONIER','TRINCHANTE','BARGÜENO','VELADOR'] },
  { nombre: 'Transportes',  palabras: ['AUTO','TREN','AVION','BARCO','BICICLETA','MOTO','COLECTIVO','SUBTE','CAMION','TAXI','LANCHA','TRANVIA','HELICOPTERO','VELERO','KAYAK','PATINETA','MONOPATÍN','TROLEBÚS','FUNICULAR','TELEFÉRICO','CRUCERO','SUBMARINO','GLOBO','TRINEO','CARRETA'] },
  { nombre: 'Profesiones',  palabras: ['MEDICO','MAESTRO','ABOGADO','COCINERO','BOMBERO','POLICIA','ENFERMERO','PILOTO','CARPINTERO','CONTADOR','VETERINARIO','ARQUITECTO','INGENIERO','PERIODISTA','FOTOGRAFO','MUSICO','PINTOR','ESCULTOR','ASTRONAUTA','GEOLOGO','BIOLOGO','QUIMICO','FILOSOFO','SOCIOLOGO','PSICOLOGO'] },
  { nombre: 'Instrumentos', palabras: ['GUITARRA','PIANO','VIOLIN','FLAUTA','BATERIA','TROMPETA','ARPA','ACORDEON','BAJO','BOMBO','SAXOFON','CLARINETE','OBOE','FAGOT','CELLO','VIOLA','MANDOLINA','BANDONEON','CHARANGO','QUENA','SIKU','MARIMBA','XILOFON','TIMBAL','PANDERETA'] },
  { nombre: 'Partes del cuerpo', palabras: ['CABEZA','BRAZO','PIERNA','MANO','PIE','ESPALDA','CUELLO','RODILLA','CODO','HOMBRO','TOBILLO','PECHO','FRENTE','MEJILLA','MENTON','NARIZ','OREJA','CEJA','PESTANA','LABIO','MUNECA','PULGAR','TALÓN','PANTORRILLA','CADERA'] },
  { nombre: 'Meses',        palabras: ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'] },
  { nombre: 'Dias',         palabras: ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'] },
  { nombre: 'Bebidas',      palabras: ['AGUA','JUGO','LECHE','CAFE','TE','MATE','GASEOSA','LIMONADA','CHOCOLATE','CERVEZA','VINO','SIDRA','CHAMPAN','TERERÉ','SUBMARINO','LICUADO','SMOOTHIE','KOMBUCHA','KEFIR','CALDO','INFUSION','REFRESCO','SODA','TÓNICA','APERITIVO'] },
  { nombre: 'Postres',      palabras: ['HELADO','TORTA','FLAN','BROWNIE','MOUSSE','BUDIN','PANQUEQUE','ALFAJOR','CHURROS','FACTURAS','TIRAMISU','CHEESECAKE','PROFITEROL','ECLAIR','MACARON','CREPE','WAFFLE','STRUDEL','BAKLAVA','CANNOLI','MUFFIN','CUPCAKE','DONUT','GALLETITA','MERENGUE'] },
  { nombre: 'Tecnología',   palabras: ['CELULAR','TABLET','COMPUTADORA','INTERNET','PANTALLA','TECLADO','MOUSE','IMPRESORA','CAMARA','AURICULAR','ALTAVOZ','ROUTER','CABLE','BATERIA','CARGADOR','MEMORIA','DISCO','PROCESADOR','MONITOR','ESCANER','PROYECTOR','MICROFONO','WEBCAM','PENDRIVE','SERVIDOR'] },
  { nombre: 'Naturaleza',   palabras: ['MONTAÑA','RIO','LAGO','MAR','BOSQUE','SELVA','DESIERTO','PAMPA','GLACIAR','VOLCAN','CASCADA','CUEVA','ARRECIFE','PANTANO','SABANA','TUNDRA','PRADERA','ACANTILADO','PENINSULA','ISLA','DELTA','FIORDO','MESETA','LLANURA','VALLE'] },
  { nombre: 'Judaísmo',     palabras: ['SHABBAT','TORÁ','SINAGOGA','MENORÁ','MEZUZÁ','KIPÁ','TALÍT','SHOFAR','JASIDUT','HALAJÁ','MITZVÁ','RABINO','SIDUR','KIDUSH','HAVDALÁ','PESAJ','SUCOT','JANUCÁ','PURIM','ROSHASHANA','YOMKIPUR','SHAVUOT','ISRAEL','JERUSALEM','KOTEL'] },
  { nombre: 'Comidas judías', palabras: ['JALÁ','MATZÁ','GEFILTEFISH','KNISH','LATKE','KUGEL','TZIMES','CHOLENT','RUGELAJ','BABKA','HAMANTASH','SUFGANIYÁ','BOREKAS','HUMMUS','FALAFEL','SHAKSHUKA','TAHINI','BUREKAS','JACHNUN','MALAWAJ'] },
];

const GRID_SIZE = 10;
const DIRS = [
  [0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]
];

function buildGrid(palabras: string[]) {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill('')
  );
  const placed: { word: string; cells: [number,number][] }[] = [];

  for (const word of palabras) {
    let ok = false;
    for (let attempt = 0; attempt < 100 && !ok; attempt++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      const cells: [number,number][] = [];
      let valid = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) { valid = false; break; }
        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) { valid = false; break; }
        cells.push([nr, nc]);
      }
      if (valid) {
        cells.forEach(([nr, nc], i) => { grid[nr][nc] = word[i]; });
        placed.push({ word, cells });
        ok = true;
      }
    }
  }

  // Rellenar con letras aleatorias
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * letters.length)];

  return { grid, placed };
}

export default function SopaScreen() {
  const insets = useSafeAreaInsets();
  const [temaIdx, setTemaIdx] = useState(0);
  const temaListRef = useRef<FlatList>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [placed, setPlaced] = useState<{ word: string; cells: [number,number][] }[]>([]);
  const [selecting, setSelecting] = useState<[number,number][]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [won, setWon] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const initGame = useCallback((idx = temaIdx) => {
    const tema = TEMAS[idx];
    // Elegir 6 palabras al azar
    const shuffled = [...tema.palabras].sort(() => Math.random() - 0.5);
    const { grid: g, placed: p } = buildGrid(shuffled.slice(0, 6));
    setGrid(g);
    setPlaced(p);
    setSelecting([]);
    setFound([]);
    setFoundCells(new Set());
    setWon(false);
  }, [temaIdx]);

  useEffect(() => { initGame(temaIdx); }, [temaIdx]);

  const cellKey = (r: number, c: number) => `${r},${c}`;

  const handlePress = (r: number, c: number) => {
    if (won) return;
    const already = selecting.findIndex(([sr, sc]) => sr === r && sc === c);

    let newSel: [number,number][];
    if (already >= 0) {
      // Deseleccionar si ya estaba marcada
      newSel = selecting.filter((_, i) => i !== already);
    } else {
      newSel = [...selecting, [r, c]];
    }
    setSelecting(newSel);

    // Verificar si el conjunto de celdas seleccionadas coincide con alguna palabra
    // (sin importar el orden en que se tocaron)
    const selKeys = new Set(newSel.map(([sr, sc]) => cellKey(sr, sc)));
    const match = placed.find(p => {
      if (found.includes(p.word)) return false;
      if (p.cells.length !== newSel.length) return false;
      const wordKeys = new Set(p.cells.map(([pr, pc]) => cellKey(pr, pc)));
      if (selKeys.size !== wordKeys.size) return false;
      for (const k of selKeys) if (!wordKeys.has(k)) return false;
      return true;
    });

    if (match) {
      const newFound = [...found, match.word];
      const newFoundCells = new Set(foundCells);
      match.cells.forEach(([fr, fc]) => newFoundCells.add(cellKey(fr, fc)));
      setFound(newFound);
      setFoundCells(newFoundCells);
      setSelecting([]);
      if (newFound.length === placed.length) setWon(true);
    } else if (newSel.length >= 12) {
      setSelecting([]);
    }
  };

  const tema = TEMAS[temaIdx];

  return (
    <View style={styles.container}>
      <AppHeader title="Sopa de letras" subtitle="Encontrá las palabras escondidas" showBack />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >

        {/* Selector de tema */}
        <FlatList
          ref={temaListRef}
          data={TEMAS}
          horizontal
          keyExtractor={t => t.nombre}
          showsHorizontalScrollIndicator={false}
          style={styles.temaRow}
          contentContainerStyle={{ paddingRight: Spacing.md }}
          nestedScrollEnabled
          renderItem={({ item: t, index: i }) => (
            <TouchableOpacity
              key={t.nombre}
              style={[styles.temaBtn, temaIdx === i && styles.temaBtnActive]}
              onPress={() => {
                setTemaIdx(i);
                temaListRef.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.5 });
              }}
            >
              <Text style={[styles.temaBtnText, temaIdx === i && styles.temaBtnTextActive]}>{t.nombre}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Palabras a encontrar */}
        <View style={styles.wordsRow}>
          {placed.map(p => (
            <View key={p.word} style={[styles.wordChip, found.includes(p.word) && styles.wordChipFound]}>
              <Text style={[styles.wordChipText, found.includes(p.word) && styles.wordChipTextFound]}>
                {p.word}
              </Text>
            </View>
          ))}
        </View>

        {/* Grilla */}
        <View style={styles.grid}>
          {grid.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((letter, c) => {
                const key = cellKey(r, c);
                const isFound = foundCells.has(key);
                const isSel = selecting.some(([sr, sc]) => sr === r && sc === c);
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.cell, isFound && styles.cellFound, isSel && styles.cellSel]}
                    onPress={() => handlePress(r, c)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cellText, isFound && styles.cellTextFound, isSel && styles.cellTextSel]}>
                      {letter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.clearBtn} onPress={() => setSelecting([])}>
            <Text style={styles.clearBtnText}>Limpiar selección</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newBtn} onPress={() => initGame(temaIdx)}>
            <Text style={styles.newBtnText}>🔄 Nuevo juego</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Tutorial */}
      <Modal visible={showTutorial} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🔤</Text>
            <Text style={styles.modalTitle}>¿Cómo se juega?</Text>
            <Text style={styles.modalSub}>
              Hay palabras escondidas en la grilla de letras.{'\n\n'}
              Tocá las letras una por una para formar la palabra. Las palabras pueden estar en cualquier dirección.{'\n\n'}
              Las palabras a encontrar aparecen arriba. Cuando encontrás una, se marca en verde.{'\n\n'}
              Elegí el tema que más te guste con los botones de arriba.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowTutorial(false)}>
              <Text style={styles.modalBtnText}>¡Entendido, a jugar!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={won} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>¡Encontraste todas!</Text>
            <Text style={styles.modalSub}>Encontraste las {placed.length} palabras del tema {tema.nombre}.</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => initGame(temaIdx)}>
              <Text style={styles.modalBtnText}>Jugar de nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CELL = 32;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, alignItems: 'center', gap: Spacing.md },
  temaRow: { marginBottom: Spacing.xs },
  temaBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, marginRight: Spacing.sm,
    backgroundColor: Colors.white,
  },
  temaBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  temaBtnText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  temaBtnTextActive: { color: Colors.white },
  wordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, justifyContent: 'center' },
  wordChip: {
    borderWidth: 1, borderColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  wordChipFound: { backgroundColor: Colors.primary },
  wordChipText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600' },
  wordChipTextFound: { color: Colors.white, textDecorationLine: 'line-through' },
  grid: { gap: 2 },
  row: { flexDirection: 'row', gap: 2 },
  cell: {
    width: CELL, height: CELL, borderRadius: 6,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cellFound: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  cellSel: { backgroundColor: Colors.info, borderColor: Colors.info },
  cellText: { fontSize: 13, fontWeight: 'bold', color: Colors.textPrimary },
  cellTextFound: { color: Colors.white },
  cellTextSel: { color: Colors.white },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  clearBtn: {
    flex: 1, borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  clearBtnText: { color: Colors.primary, fontWeight: 'bold', fontSize: FontSizes.sm },
  newBtn: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  newBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.sm },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.xxl, width: '80%', alignItems: 'center' },
  modalIcon: { fontSize: 64, marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.sm },
  modalSub: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  modalBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: Spacing.md, width: '100%', alignItems: 'center' },
  modalBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
