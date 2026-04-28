import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convierte cualquier URL de Gutenberg a la versión HTML limpia
function toHtmlUrl(url: string): string {
  // Extraer el ID del libro de cualquier formato de URL de Gutenberg
  const idMatch = url.match(/gutenberg\.org\/(?:ebooks\/|cache\/epub\/)(\d+)/);
  if (idMatch) {
    const id = idMatch[1];
    // Usar la versión HTML sin imágenes (más liviana y compatible)
    return `https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`;
  }
  return url;
}

// CSS que se inyecta en el HTML de Gutenberg para hacerlo legible en móvil
function buildCSS(fontSize: number, bg: string, textColor: string): string {
  return `
    body {
      font-family: Georgia, serif !important;
      font-size: ${fontSize}px !important;
      line-height: 1.8 !important;
      color: ${textColor} !important;
      background-color: ${bg} !important;
      padding: 16px 20px 80px 20px !important;
      max-width: 100% !important;
    }
    h1, h2, h3, h4 {
      color: ${textColor} !important;
      font-size: ${fontSize + 4}px !important;
      margin-top: 24px !important;
    }
    p { margin-bottom: 16px !important; }
    img { max-width: 100% !important; height: auto !important; }
    /* Ocultar header y footer de Gutenberg */
    .pg-header, .pg-footer, #pg-header, #pg-footer,
    .noindent:first-child, pre { display: none !important; }
    a { color: ${textColor} !important; text-decoration: none !important; }
  `;
}

const FONT_SIZES = [16, 20, 24, 28];
const BG_THEMES = [
  { bg: '#FFFDF5', text: '#2E2E2E', label: '☀️', name: 'Claro' },
  { bg: '#F0EAD6', text: '#3B2F1E', label: '📜', name: 'Sepia' },
  { bg: '#1A1A2E', text: '#E0E0E0', label: '🌙', name: 'Oscuro' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LectorScreen() {
  const insets = useSafeAreaInsets();
  const { title, author, url } = useLocalSearchParams<{
    title: string; author: string; url: string;
  }>();

  const webviewRef = useRef<WebView>(null);
  const [fontIdx, setFontIdx] = useState(1);
  const [themeIdx, setThemeIdx] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const theme = BG_THEMES[themeIdx];
  const fontSize = FONT_SIZES[fontIdx];
  const bookUrl = url ? toHtmlUrl(url) : '';

  // Inyectar CSS cada vez que cambia fuente o tema
  const injectCSS = (fSize: number, bg: string, textColor: string) => {
    const css = buildCSS(fSize, bg, textColor);
    const js = `
      (function() {
        var existing = document.getElementById('__reader_style__');
        if (existing) existing.remove();
        var style = document.createElement('style');
        style.id = '__reader_style__';
        style.textContent = ${JSON.stringify(css)};
        document.head.appendChild(style);
        document.body.style.backgroundColor = '${bg}';
      })();
      true;
    `;
    webviewRef.current?.injectJavaScript(js);
  };

  const handleFontChange = (idx: number) => {
    setFontIdx(idx);
    injectCSS(FONT_SIZES[idx], theme.bg, theme.text);
  };

  const handleThemeChange = (idx: number) => {
    setThemeIdx(idx);
    injectCSS(fontSize, BG_THEMES[idx].bg, BG_THEMES[idx].text);
  };

  // CSS inicial que se carga con la página
  const injectedCSS = buildCSS(fontSize, theme.bg, theme.text);
  const injectedJavaScript = `
    (function() {
      var style = document.createElement('style');
      style.id = '__reader_style__';
      style.textContent = ${JSON.stringify(injectedCSS)};
      document.head.appendChild(style);
      document.body.style.backgroundColor = '${theme.bg}';
    })();
    true;
  `;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AppHeader
        title={title ?? 'Lector'}
        subtitle={author ?? ''}
        showBack
        rightIcon={
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
            <Text style={styles.settingsBtnText}>⚙️</Text>
          </TouchableOpacity>
        }
      />

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={[styles.errorText, { color: theme.text }]}>
            No se pudo cargar este libro.{'\n'}Verificá tu conexión a internet.
          </Text>
        </View>
      ) : (
        <WebView
          ref={webviewRef}
          source={{ uri: bookUrl }}
          style={[styles.webview, { backgroundColor: theme.bg }]}
          injectedJavaScript={injectedJavaScript}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          javaScriptEnabled
          domStorageEnabled
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
          onHttpError={() => { setError(true); setLoading(false); }}
          // Evitar que links externos saquen de la app
          onShouldStartLoadWithRequest={(req) => {
            return req.url.includes('gutenberg.org');
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.loadingOverlay, { backgroundColor: theme.bg }]}>
              <Text style={styles.loadingEmoji}>📖</Text>
              <Text style={[styles.loadingText, { color: theme.text }]}>Cargando libro...</Text>
            </View>
          )}
        />
      )}

      {/* Modal de ajustes */}
      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={[styles.settingsBox, { backgroundColor: theme.bg }]}>
            <View style={styles.settingsHandle} />
            <Text style={[styles.settingsTitle, { color: theme.text }]}>Ajustes de lectura</Text>

            {/* Tamaño de fuente */}
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Tamaño de letra</Text>
            <View style={styles.fontRow}>
              {FONT_SIZES.map((size, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.fontBtn, fontIdx === i && styles.fontBtnActive]}
                  onPress={() => handleFontChange(i)}
                >
                  <Text style={[
                    styles.fontBtnText,
                    { fontSize: 12 + i * 4 },
                    fontIdx === i && styles.fontBtnTextActive,
                  ]}>
                    A
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tema de color */}
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Fondo</Text>
            <View style={styles.themeRow}>
              {BG_THEMES.map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.themeBtn,
                    { backgroundColor: t.bg, borderColor: themeIdx === i ? Colors.primary : Colors.border },
                  ]}
                  onPress={() => handleThemeChange(i)}
                >
                  <Text style={styles.themeBtnEmoji}>{t.label}</Text>
                  <Text style={[styles.themeBtnName, { color: t.text }]}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.settingsClose}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.settingsCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },

  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, padding: Spacing.xl,
  },
  errorEmoji: { fontSize: 52 },
  errorText: { fontSize: FontSizes.lg, textAlign: 'center', lineHeight: 28 },

  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
  },
  loadingEmoji: { fontSize: 52 },
  loadingText: { fontSize: FontSizes.lg },

  settingsBtn: { padding: 8 },
  settingsBtnText: { fontSize: 22 },

  // Modal ajustes
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  settingsBox: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, gap: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 12,
  },
  settingsHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.sm,
  },
  settingsTitle: {
    fontSize: FontSizes.xl, fontWeight: 'bold',
    textAlign: 'center', marginBottom: Spacing.sm,
  },
  settingsLabel: { fontSize: FontSizes.md, fontWeight: '600' },

  fontRow: { flexDirection: 'row', gap: Spacing.sm },
  fontBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  fontBtnActive: { borderColor: Colors.primary, backgroundColor: '#E8F5E9' },
  fontBtnText: { fontWeight: 'bold', color: Colors.textPrimary },
  fontBtnTextActive: { color: Colors.primary },

  themeRow: { flexDirection: 'row', gap: Spacing.sm },
  themeBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, gap: 4,
  },
  themeBtnEmoji: { fontSize: 24 },
  themeBtnName: { fontSize: FontSizes.xs, fontWeight: '600' },

  settingsClose: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.sm,
  },
  settingsCloseText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
