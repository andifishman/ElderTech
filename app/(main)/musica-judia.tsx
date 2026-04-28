import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import React, { useRef, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  emoji: string;
  category: string;
}

// ─── Playlist ─────────────────────────────────────────────────────────────────
// IDs de YouTube de videos de canciones judías tradicionales (dominio público / libre uso)

const SONGS: Song[] = [
  // Tradicionales
  { id: '1',  emoji: '🎵', category: 'Tradicional', title: 'Hava Nagila',            artist: 'Tradicional',         youtubeId: 'H-5Tn-Ld3Ks' },
  { id: '2',  emoji: '✡️', category: 'Tradicional', title: 'Hevenu Shalom Aleichem', artist: 'Tradicional',         youtubeId: 'Gy7-jhzDNMo' },
  { id: '3',  emoji: '🌟', category: 'Tradicional', title: 'Am Yisrael Chai',         artist: 'Tradicional',         youtubeId: 'XsQMNXFuHAI' },
  { id: '4',  emoji: '🤝', category: 'Tradicional', title: 'Hinei Ma Tov',            artist: 'Tradicional',         youtubeId: 'qKBMBzFRqpY' },

  // Yidish
  { id: '5',  emoji: '🎻', category: 'Yidish',      title: 'Tumbalalaika',            artist: 'Canción Yidish',      youtubeId: 'Gy7-jhzDNMo' },
  { id: '6',  emoji: '🌙', category: 'Yidish',      title: 'Rozhinkes mit Mandlen',   artist: 'Canción de cuna',     youtubeId: 'Gy7-jhzDNMo' },
  { id: '7',  emoji: '🔥', category: 'Yidish',      title: 'Oyfn Pripetshik',         artist: 'Canción Yidish',      youtubeId: 'Gy7-jhzDNMo' },

  // Shabbat
  { id: '8',  emoji: '🕯️', category: 'Shabbat',     title: 'Shalom Aleichem',         artist: 'Tradicional Shabbat', youtubeId: 'Gy7-jhzDNMo' },
  { id: '9',  emoji: '🕍', category: 'Shabbat',     title: 'Lecha Dodi',              artist: 'Tradicional Shabbat', youtubeId: 'Gy7-jhzDNMo' },

  // Janucá
  { id: '10', emoji: '🕎', category: 'Janucá',      title: 'Maoz Tzur',               artist: 'Tradicional Janucá',  youtubeId: 'Gy7-jhzDNMo' },
  { id: '11', emoji: '🌀', category: 'Janucá',      title: 'Sevivon Sov Sov Sov',     artist: 'Canción de Janucá',   youtubeId: 'Gy7-jhzDNMo' },

  // Pesaj
  { id: '12', emoji: '🍷', category: 'Pesaj',       title: 'Dayenu',                  artist: 'Tradicional Pesaj',   youtubeId: 'Gy7-jhzDNMo' },
  { id: '13', emoji: '🐐', category: 'Pesaj',       title: 'Chad Gadya',              artist: 'Tradicional Pesaj',   youtubeId: 'Gy7-jhzDNMo' },

  // Clásicas
  { id: '14', emoji: '🏛️', category: 'Clásica',     title: 'Yerushalayim Shel Zahav', artist: 'Naomi Shemer',        youtubeId: 'Gy7-jhzDNMo' },
  { id: '15', emoji: '🇮🇱', category: 'Clásica',     title: 'Hatikva',                 artist: 'Himno de Israel',     youtubeId: 'Gy7-jhzDNMo' },

  // Espirituales
  { id: '16', emoji: '🕊️', category: 'Espiritual',  title: 'Oseh Shalom',             artist: 'Tradicional',         youtubeId: 'Gy7-jhzDNMo' },
  { id: '17', emoji: '🙏', category: 'Espiritual',  title: 'Ani Maamin',              artist: 'Tradicional',         youtubeId: 'Gy7-jhzDNMo' },
];

const CATEGORIES = [
  { key: 'Tradicional', emoji: '🎶', label: 'Tradicionales' },
  { key: 'Yidish',      emoji: '🎻', label: 'Yidish' },
  { key: 'Shabbat',     emoji: '🕯️', label: 'Shabbat' },
  { key: 'Janucá',      emoji: '🕎', label: 'Janucá' },
  { key: 'Pesaj',       emoji: '🍷', label: 'Pesaj' },
  { key: 'Clásica',     emoji: '🏛️', label: 'Clásicas' },
  { key: 'Espiritual',  emoji: '🙏', label: 'Espirituales' },
];

// ─── HTML del reproductor ─────────────────────────────────────────────────────
// Usa youtube-nocookie.com para evitar que abra la app de YouTube
// autoplay=1 + playsinline=1 para reproducir dentro del WebView

function buildPlayerHtml(youtubeId: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #1a1a2e; overflow: hidden; }
    .wrap { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <iframe
      src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1"
      allow="autoplay; encrypted-media; fullscreen"
      allowfullscreen
    ></iframe>
  </div>
</body>
</html>`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function MusicaJudiaScreen() {
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playerVisible, setPlayerVisible] = useState(false);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setPlayerVisible(true);
  };

  const closeSong = () => {
    setCurrentSong(null);
    setPlayerVisible(false);
  };

  const playNext = () => {
    if (!currentSong) return;
    const idx = SONGS.findIndex(s => s.id === currentSong.id);
    if (idx < SONGS.length - 1) setCurrentSong(SONGS[idx + 1]);
  };

  const playPrev = () => {
    if (!currentSong) return;
    const idx = SONGS.findIndex(s => s.id === currentSong.id);
    if (idx > 0) setCurrentSong(SONGS[idx - 1]);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Música Judía" subtitle="Canciones tradicionales y en yidish" showBack />

      {/* Mini barra de reproducción */}
      {currentSong ? (
        <TouchableOpacity style={styles.miniBar} onPress={() => setPlayerVisible(true)} activeOpacity={0.85}>
          <Text style={styles.miniEmoji}>{currentSong.emoji}</Text>
          <View style={styles.miniInfo}>
            <Text style={styles.miniPlaying}>▶  Reproduciendo</Text>
            <Text style={styles.miniTitle} numberOfLines={1}>{currentSong.title}</Text>
          </View>
          <TouchableOpacity style={styles.miniStop} onPress={closeSong}>
            <Text style={styles.miniStopText}>⏹</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <View style={styles.miniBarEmpty}>
          <Text style={styles.miniBarEmptyText}>🎵  Tocá una canción para escuchar</Text>
        </View>
      )}

      {/* Lista */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => {
          const songs = SONGS.filter(s => s.category === cat.key);
          if (!songs.length) return null;
          return (
            <View key={cat.key}>
              <Text style={styles.catTitle}>{cat.emoji}  {cat.label}</Text>
              {songs.map((song) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <TouchableOpacity
                    key={song.id}
                    style={[styles.card, isActive && styles.cardActive]}
                    activeOpacity={0.8}
                    onPress={() => playSong(song)}
                  >
                    <View style={[styles.emojiBox, isActive && styles.emojiBoxActive]}>
                      <Text style={styles.songEmoji}>{song.emoji}</Text>
                    </View>
                    <View style={styles.songInfo}>
                      <Text style={[styles.songTitle, isActive && styles.songTitleActive]}>
                        {song.title}
                      </Text>
                      <Text style={styles.songArtist}>{song.artist}</Text>
                    </View>
                    <View style={[styles.playBtn, isActive && styles.playBtnActive]}>
                      <Text style={styles.playBtnIcon}>▶</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {/* Modal reproductor */}
      <Modal visible={playerVisible} animationType="slide" onRequestClose={() => setPlayerVisible(false)}>
        <View style={[styles.playerModal, { paddingTop: insets.top }]}>

          {/* Header */}
          <View style={styles.playerHeader}>
            <TouchableOpacity style={styles.playerBackBtn} onPress={() => setPlayerVisible(false)}>
              <Text style={styles.playerBackText}>‹ Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playerCloseBtn} onPress={closeSong}>
              <Text style={styles.playerCloseText}>⏹ Detener</Text>
            </TouchableOpacity>
          </View>

          {/* Info canción */}
          {currentSong && (
            <View style={styles.playerInfo}>
              <Text style={styles.playerEmoji}>{currentSong.emoji}</Text>
              <Text style={styles.playerTitle}>{currentSong.title}</Text>
              <Text style={styles.playerArtist}>{currentSong.artist}</Text>
            </View>
          )}

          {/* YouTube embed */}
          {currentSong && (
            <View style={styles.videoBox}>
              <WebView
                key={currentSong.id}
                ref={webviewRef}
                source={{ html: buildPlayerHtml(currentSong.youtubeId) }}
                style={styles.webview}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
                // Bloquear navegación externa para no salir de la app
                onShouldStartLoadWithRequest={(req) => {
                  const url = req.url;
                  // Permitir solo youtube-nocookie, youtube y about:blank
                  return url.startsWith('about:') ||
                         url.includes('youtube-nocookie.com') ||
                         url.includes('youtube.com/embed');
                }}
              />
            </View>
          )}

          {/* Controles anterior/siguiente */}
          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.navBtn} onPress={playPrev}>
              <Text style={styles.navBtnText}>⏮  Anterior</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={playNext}>
              <Text style={styles.navBtnText}>Siguiente  ⏭</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de canciones */}
          <Text style={styles.playerListLabel}>Más canciones</Text>
          <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
            {SONGS.map((song) => {
              const isActive = currentSong?.id === song.id;
              return (
                <TouchableOpacity
                  key={song.id}
                  style={[styles.playerListItem, isActive && styles.playerListItemActive]}
                  onPress={() => setCurrentSong(song)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.playerListEmoji}>{song.emoji}</Text>
                  <View style={styles.playerListInfo}>
                    <Text style={[styles.playerListTitle, isActive && styles.playerListTitleActive]}>
                      {song.title}
                    </Text>
                    <Text style={styles.playerListArtist}>{song.artist}</Text>
                  </View>
                  {isActive && <Text style={styles.playingDot}>▶</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  miniBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#3949AB',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  miniBarEmpty: {
    backgroundColor: '#5C6BC0',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignItems: 'center',
  },
  miniEmoji: { fontSize: 26 },
  miniInfo: { flex: 1 },
  miniPlaying: { color: '#C5CAE9', fontSize: FontSizes.xs, fontWeight: '600' },
  miniTitle: { color: Colors.white, fontSize: FontSizes.md, fontWeight: 'bold' },
  miniBarEmptyText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSizes.sm },
  miniStop: {
    backgroundColor: Colors.danger, width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  miniStopText: { fontSize: 18 },

  content: { padding: Spacing.lg },
  catTitle: {
    fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    borderWidth: 2, borderColor: 'transparent',
  },
  cardActive: { borderColor: '#5C6BC0', backgroundColor: '#EEF0FB' },
  emojiBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#E8EAF6',
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  emojiBoxActive: { backgroundColor: '#C5CAE9' },
  songEmoji: { fontSize: 24 },
  songInfo: { flex: 1 },
  songTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.textPrimary },
  songTitleActive: { color: '#3F51B5' },
  songArtist: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  playBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#5C6BC0',
    alignItems: 'center', justifyContent: 'center',
  },
  playBtnActive: { backgroundColor: '#3F51B5' },
  playBtnIcon: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },

  // Modal
  playerModal: { flex: 1, backgroundColor: '#1A1A2E' },
  playerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  playerBackBtn: {
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.full,
  },
  playerBackText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  playerCloseBtn: {
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.danger, borderRadius: Radius.full,
  },
  playerCloseText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  playerInfo: { alignItems: 'center', paddingVertical: Spacing.sm },
  playerEmoji: { fontSize: 36, marginBottom: 4 },
  playerTitle: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: 'bold', textAlign: 'center' },
  playerArtist: { color: 'rgba(255,255,255,0.65)', fontSize: FontSizes.sm, marginTop: 4 },
  videoBox: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  webview: { flex: 1 },
  playerControls: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  navBtn: {
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md,
  },
  navBtnText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  playerListLabel: {
    color: 'rgba(255,255,255,0.5)', fontSize: FontSizes.sm, fontWeight: '600',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xs,
  },
  playerList: { flex: 1 },
  playerListItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  playerListItemActive: { backgroundColor: 'rgba(92,107,192,0.25)' },
  playerListEmoji: { fontSize: 20, marginRight: Spacing.md },
  playerListInfo: { flex: 1 },
  playerListTitle: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  playerListTitleActive: { color: '#9FA8DA' },
  playerListArtist: { color: 'rgba(255,255,255,0.45)', fontSize: FontSizes.sm, marginTop: 2 },
  playingDot: { color: '#9FA8DA', fontSize: FontSizes.lg },
});
