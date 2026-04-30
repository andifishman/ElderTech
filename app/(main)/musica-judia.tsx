import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Song {
  id: string;
  title: string;
  artist: string;
  emoji: string;
  category: string;
  file: any;
}

// ─── Archivos de audio ────────────────────────────────────────────────────────
// Cuando subas los MP3 a assets/musicaJudia/, descomentá cada require()
// y borrá el null correspondiente.

const AUDIO_FILES: Record<string, any> = {
  'hava-nagila':             require('@/assets/musicaJudia/hava nagila.mp3'),
  'hevenu-shalom-aleichem':  require('@/assets/musicaJudia/Music from Israel_ Hevenu Shalom Alechem.mp3'),
  'am-yisrael-chai':         require('@/assets/musicaJudia/Eyal Golan - Am Yisrael Chai (Hebrew  English Subtitles)  אייל גולן - עם ישראל חי.mp3'),
  'hinei-ma-tov':           require('@/assets/musicaJudia/Hine Ma Tov.mp3'),
  'tumbalalaika':            null, // require('@/assets/musicaJudia/tumbalalaika.mp3'),
  'rozhinkes-mit-mandlen':   null, // require('@/assets/musicaJudia/rozhinkes-mit-mandlen.mp3'),
  'oyfn-pripetshik':         null, // require('@/assets/musicaJudia/oyfn-pripetshik.mp3'),
  'shalom-aleichem':         null, // require('@/assets/musicaJudia/shalom-aleichem.mp3'),
  'lecha-dodi':              null, // require('@/assets/musicaJudia/lecha-dodi.mp3'),
  'maoz-tzur':               null, // require('@/assets/musicaJudia/maoz-tzur.mp3'),
  'sevivon-sov-sov-sov':     null, // require('@/assets/musicaJudia/sevivon-sov-sov-sov.mp3'),
  'dayenu':                  null, // require('@/assets/musicaJudia/dayenu.mp3'),
  'chad-gadya':              null, // require('@/assets/musicaJudia/chad-gadya.mp3'),
  'yerushalayim-shel-zahav': null, // require('@/assets/musicaJudia/yerushalayim-shel-zahav.mp3'),
  'hatikva':                 null, // require('@/assets/musicaJudia/hatikva.mp3'),
  'oseh-shalom':             null, // require('@/assets/musicaJudia/oseh-shalom.mp3'),
  'ani-maamin':              null, // require('@/assets/musicaJudia/ani-maamin.mp3'),
};

const SONGS: Song[] = [
  { id: '1',  emoji: '🎵', category: 'Tradicional', title: 'Hava Nagila',            artist: 'Tradicional',         file: AUDIO_FILES['hava-nagila'] },
  { id: '2',  emoji: '✡️', category: 'Tradicional', title: 'Hevenu Shalom Aleichem', artist: 'Tradicional',         file: AUDIO_FILES['hevenu-shalom-aleichem'] },
  { id: '3',  emoji: '🌟', category: 'Tradicional', title: 'Am Yisrael Chai',         artist: 'Tradicional',         file: AUDIO_FILES['am-yisrael-chai'] },
  { id: '4',  emoji: '🤝', category: 'Tradicional', title: 'Hinei Ma Tov',            artist: 'Tradicional',         file: AUDIO_FILES['hinei-ma-tov'] },
  { id: '5',  emoji: '🎻', category: 'Yidish',      title: 'Tumbalalaika',            artist: 'Canción Yidish',      file: AUDIO_FILES['tumbalalaika'] },
  { id: '6',  emoji: '🌙', category: 'Yidish',      title: 'Rozhinkes mit Mandlen',   artist: 'Canción de cuna',     file: AUDIO_FILES['rozhinkes-mit-mandlen'] },
  { id: '7',  emoji: '🔥', category: 'Yidish',      title: 'Oyfn Pripetshik',         artist: 'Canción Yidish',      file: AUDIO_FILES['oyfn-pripetshik'] },
  { id: '8',  emoji: '🕯️', category: 'Shabbat',     title: 'Shalom Aleichem',         artist: 'Tradicional Shabbat', file: AUDIO_FILES['shalom-aleichem'] },
  { id: '9',  emoji: '🕍', category: 'Shabbat',     title: 'Lecha Dodi',              artist: 'Tradicional Shabbat', file: AUDIO_FILES['lecha-dodi'] },
  { id: '10', emoji: '🕎', category: 'Janucá',      title: 'Maoz Tzur',               artist: 'Tradicional Janucá',  file: AUDIO_FILES['maoz-tzur'] },
  { id: '11', emoji: '🌀', category: 'Janucá',      title: 'Sevivon Sov Sov Sov',     artist: 'Canción de Janucá',   file: AUDIO_FILES['sevivon-sov-sov-sov'] },
  { id: '12', emoji: '🍷', category: 'Pesaj',       title: 'Dayenu',                  artist: 'Tradicional Pesaj',   file: AUDIO_FILES['dayenu'] },
  { id: '13', emoji: '🐐', category: 'Pesaj',       title: 'Chad Gadya',              artist: 'Tradicional Pesaj',   file: AUDIO_FILES['chad-gadya'] },
  { id: '14', emoji: '🏛️', category: 'Clásica',     title: 'Yerushalayim Shel Zahav', artist: 'Naomi Shemer',        file: AUDIO_FILES['yerushalayim-shel-zahav'] },
  { id: '15', emoji: '🇮🇱', category: 'Clásica',     title: 'Hatikva',                 artist: 'Himno de Israel',     file: AUDIO_FILES['hatikva'] },
  { id: '16', emoji: '🕊️', category: 'Espiritual',  title: 'Oseh Shalom',             artist: 'Tradicional',         file: AUDIO_FILES['oseh-shalom'] },
  { id: '17', emoji: '🙏', category: 'Espiritual',  title: 'Ani Maamin',              artist: 'Tradicional',         file: AUDIO_FILES['ani-maamin'] },
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

export default function MusicaJudiaScreen() {
  const insets = useSafeAreaInsets();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    return () => { stopAndUnload(); };
  }, []);

  const stopAndUnload = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSong(null);
  };

  const playSong = useCallback(async (song: Song) => {
    if (!song.file) {
      // Archivo no disponible todavía
      return;
    }

    if (currentSong?.id === song.id && soundRef.current) {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
      return;
    }

    await stopAndUnload();
    setCurrentSong(song);
    setIsLoading(true);

    try {
      const startPosition = song.id === '1' ? 5000 : 0; // primer mp3 empieza en segundo 5
      const { sound } = await Audio.Sound.createAsync(
        song.file,
        { shouldPlay: true, positionMillis: startPosition },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              const idx = SONGS.findIndex(s => s.id === song.id);
              if (idx < SONGS.length - 1) playSong(SONGS[idx + 1]);
              else setIsPlaying(false);
            }
          }
        }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (e) {
      console.error('Error al reproducir:', e);
    } finally {
      setIsLoading(false);
    }
  }, [currentSong, isPlaying]);

  const playNext = () => {
    if (!currentSong) return;
    const idx = SONGS.findIndex(s => s.id === currentSong.id);
    if (idx < SONGS.length - 1) playSong(SONGS[idx + 1]);
  };

  const playPrev = () => {
    if (!currentSong) return;
    const idx = SONGS.findIndex(s => s.id === currentSong.id);
    if (idx > 0) playSong(SONGS[idx - 1]);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Música Judía" subtitle="Canciones tradicionales y en yidish" showBack />

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
                const hasFile = !!song.file;
                return (
                  <React.Fragment key={song.id}>
                  <TouchableOpacity
                    style={[styles.card, isActive && styles.cardActive, !hasFile && styles.cardDisabled]}
                    activeOpacity={hasFile ? 0.8 : 1}
                    onPress={() => hasFile && playSong(song)}
                  >
                    <View style={[styles.emojiBox, isActive && styles.emojiBoxActive]}>
                      <Text style={styles.songEmoji}>{song.emoji}</Text>
                    </View>
                    <View style={styles.songInfo}>
                      <Text style={[styles.songTitle, isActive && styles.songTitleActive, !hasFile && styles.songTitleDisabled]}>
                        {song.title}
                      </Text>
                      <Text style={styles.songArtist}>
                        {hasFile ? song.artist : 'Archivo no disponible aún'}
                      </Text>
                    </View>
                    <View style={[styles.playBtn, isActive && styles.playBtnActive, !hasFile && styles.playBtnDisabled]}>
                      <Text style={styles.playBtnIcon}>
                        {!hasFile ? '—' : isActive && isLoading ? '⏳' : isActive ? '♪' : '▶'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Controles grandes */}
                  {isActive && hasFile && (
                    <View style={styles.bigControls}>
                      <View style={styles.bigControlsRow}>
                        <TouchableOpacity style={[styles.bigBtn, styles.bigBtnStop]} onPress={stopAndUnload} activeOpacity={0.8}>
                          <Text style={styles.bigBtnText}>{'Dejar de escuchar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.bigBtn, styles.bigBtnPause]} onPress={() => playSong(song)} activeOpacity={0.8}>
                          <Text style={styles.bigBtnText}>{isPlaying ? 'Pausar' : 'Reanudar'}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.bigControlsRow}>
                        {SONGS.findIndex(s => s.id === song.id) > 0 && (
                          <TouchableOpacity
                            style={[styles.bigBtn, styles.bigBtnNav]}
                            onPress={playPrev}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.bigBtnText}>{'Cancion anterior'}</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.bigBtn, styles.bigBtnNav, SONGS.findIndex(s => s.id === song.id) === SONGS.length - 1 && styles.bigBtnDisabled]}
                          onPress={playNext}
                          disabled={SONGS.findIndex(s => s.id === song.id) === SONGS.length - 1}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.bigBtnText, SONGS.findIndex(s => s.id === song.id) === SONGS.length - 1 && styles.bigBtnTextDisabled]}>
                            {'Siguiente cancion'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  </React.Fragment>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  playerBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#3949AB',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs,
  },
  playerBarEmpty: {
    backgroundColor: '#5C6BC0',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignItems: 'center',
  },
  playerBarEmptyText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSizes.sm },
  playerEmoji: { fontSize: 24 },
  playerInfo: { flex: 1, marginHorizontal: Spacing.xs },
  playerTitle: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: 'bold' },
  playerArtist: { color: '#C5CAE9', fontSize: FontSizes.xs },
  controlBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  stopBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.danger,
    alignItems: 'center', justifyContent: 'center',
  },
  controlIcon: { color: Colors.white, fontSize: 16 },
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
  cardDisabled: { opacity: 0.5 },
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
  songTitleDisabled: { color: Colors.textSecondary },
  songArtist: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  playBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#5C6BC0',
    alignItems: 'center', justifyContent: 'center',
  },
  playBtnActive: { backgroundColor: '#3F51B5' },
  playBtnDisabled: { backgroundColor: Colors.border },
  playBtnIcon: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },

  // Controles grandes
  bigControls: { gap: Spacing.sm, marginBottom: Spacing.sm },
  bigControlsRow: { flexDirection: 'row', gap: Spacing.sm },
  bigBtn: {
    flex: 1, paddingVertical: Spacing.lg,
    borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
  },
  bigBtnStop:    { backgroundColor: Colors.danger },
  bigBtnPause:   { backgroundColor: '#3949AB' },
  bigBtnNav:     { backgroundColor: Colors.primary },
  bigBtnDisabled:{ backgroundColor: Colors.border },
  bigBtnText:    { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
  bigBtnTextDisabled: { color: Colors.textSecondary },
});
