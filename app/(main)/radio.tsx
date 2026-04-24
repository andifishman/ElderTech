import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RadioStation {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  fallbackUrl?: string;
  emoji: string;
  group: string;
  genre: string;
}

// ─── Radio Browser API ────────────────────────────────────────────────────────
// Fetches the best verified stream URL for a station name + country from
// radio-browser.info (free, open, community-maintained database).

const RB_HOST = 'https://de1.api.radio-browser.info';

async function resolveStream(name: string, countryCode: string): Promise<string | null> {
  try {
    const url =
      `${RB_HOST}/json/stations/search` +
      `?name=${encodeURIComponent(name)}&countrycode=${countryCode}` +
      `&limit=5&hidebroken=true&order=clickcount&reverse=true`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ElderTechApp/1.0' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ url_resolved: string; url: string }>;
    if (!data.length) return null;
    return data[0].url_resolved || data[0].url || null;
  } catch {
    return null;
  }
}

// ─── Station definitions ──────────────────────────────────────────────────────
// streamUrl = known fallback; the app will try to resolve a fresh URL first.

const STATIONS: RadioStation[] = [
  // ── Argentina ──────────────────────────────────────────────────────────────
  {
    id: 'ar1',
    name: 'Radio Mitre',
    description: 'Noticias y actualidad',
    streamUrl: 'https://25853.live.streamtheworld.com/RADIO_MITRE.mp3',
    emoji: '🎙️',
    group: 'Argentina',
    genre: 'Noticias',
  },
  {
    id: 'ar2',
    name: 'La 100',
    description: 'Los mejores hits',
    streamUrl: 'https://25853.live.streamtheworld.com/LA100.mp3',
    emoji: '🎵',
    group: 'Argentina',
    genre: 'Pop',
  },
  {
    id: 'ar3',
    name: 'Radio Nacional',
    description: 'Radio pública argentina',
    streamUrl: 'https://stream.radionacional.com.ar/am870',
    fallbackUrl: 'http://stream.radionacional.com.ar:8000/am870',
    emoji: '📻',
    group: 'Argentina',
    genre: 'General',
  },
  // ── Israel ─────────────────────────────────────────────────────────────────
  {
    id: 'il1',
    name: 'Galatz',
    description: 'Radio del ejército israelí',
    streamUrl: 'https://glzwizzlv.bynetcdn.com/glz_mp3',
    emoji: '🎶',
    group: 'Israel',
    genre: 'Pop / Noticias',
  },
  {
    id: 'il2',
    name: 'Reshet Bet',
    description: 'Noticias y cultura israelí',
    streamUrl: 'https://radiokan.cdn.cybercdn.live/KAN_BET/radio/icecast.audio',
    emoji: '📰',
    group: 'Israel',
    genre: 'Noticias',
  },
  {
    id: 'il3',
    name: 'Kol Chai',
    description: 'Música y cultura judía',
    streamUrl: 'https://cdn.cybercdn.live/KolChai/radio/icecast.audio',
    emoji: '✡️',
    group: 'Israel',
    genre: 'Cultura',
  },
  // ── English ────────────────────────────────────────────────────────────────
  {
    id: 'en1',
    name: 'BBC World Service',
    description: 'International news in English',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    emoji: '🌍',
    group: 'English',
    genre: 'News',
  },
  {
    id: 'en2',
    name: 'NPR News',
    description: 'American public radio',
    streamUrl: 'https://npr-ice.streamguys1.com/live.mp3',
    emoji: '🗞️',
    group: 'English',
    genre: 'News',
  },
  {
    id: 'en3',
    name: 'Classic FM',
    description: 'Classical music 24/7',
    streamUrl: 'https://media-ice.musicradio.com/ClassicFMMP3',
    emoji: '🎻',
    group: 'English',
    genre: 'Classical',
  },
];

const GROUPS = [
  { key: 'Argentina', emoji: '🇦🇷', label: 'Argentina' },
  { key: 'Israel', emoji: '🇮🇱', label: 'Israel' },
  { key: 'English', emoji: '🇬🇧', label: 'En inglés' },
];

// Country codes for Radio Browser lookup
const COUNTRY_CODE: Record<string, string> = {
  Argentina: 'AR',
  Israel: 'IL',
  English: 'GB',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RadioScreen() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // Cache resolved URLs so we don't re-fetch every tap
  const resolvedUrls = useRef<Record<string, string>>({});

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    return () => { stopAndUnload(); };
  }, []);

  const stopAndUnload = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch { /* ignore */ }
      soundRef.current = null;
    }
  };

  const tryPlay = async (uri: string): Promise<Audio.Sound> => {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      {
        shouldPlay: true,
        isLooping: false,
        progressUpdateIntervalMillis: 1000,
      }
    );
    return sound;
  };

  const handlePress = useCallback(async (station: RadioStation) => {
    // Tap playing station → stop
    if (playingId === station.id) {
      await stopAndUnload();
      setPlayingId(null);
      return;
    }

    await stopAndUnload();
    setPlayingId(null);
    setLoadingId(station.id);

    try {
      // 1. Try cached resolved URL
      // 2. Try Radio Browser API
      // 3. Try hardcoded streamUrl
      // 4. Try fallbackUrl

      let uri: string | null = resolvedUrls.current[station.id] ?? null;

      if (!uri) {
        const cc = COUNTRY_CODE[station.group] ?? '';
        uri = await resolveStream(station.name, cc);
        if (uri) resolvedUrls.current[station.id] = uri;
      }

      const urlsToTry: string[] = [];
      if (uri) urlsToTry.push(uri);
      if (station.streamUrl && !urlsToTry.includes(station.streamUrl))
        urlsToTry.push(station.streamUrl);
      if (station.fallbackUrl && !urlsToTry.includes(station.fallbackUrl))
        urlsToTry.push(station.fallbackUrl);

      let sound: Audio.Sound | null = null;
      let lastError: unknown = null;

      for (const candidate of urlsToTry) {
        try {
          sound = await tryPlay(candidate);
          // Cache the working URL
          resolvedUrls.current[station.id] = candidate;
          break;
        } catch (e) {
          lastError = e;
          sound = null;
        }
      }

      if (!sound) throw lastError ?? new Error('No stream available');

      soundRef.current = sound;
      setPlayingId(station.id);
    } catch {
      Alert.alert(
        'No se pudo conectar',
        `No se encontró un stream disponible para ${station.name}.\n\nVerificá tu conexión a internet.`
      );
    } finally {
      setLoadingId(null);
    }
  }, [playingId]);

  const currentStation = STATIONS.find((s) => s.id === playingId) ?? null;

  return (
    <View style={styles.container}>
      <AppHeader title="Radio" subtitle="Escuchá radios en vivo" showBack />

      {/* Now playing bar */}
      {currentStation ? (
        <View style={styles.nowPlayingBar}>
          <Text style={styles.nowPlayingEmoji}>{currentStation.emoji}</Text>
          <View style={styles.nowPlayingInfo}>
            <Text style={styles.nowPlayingLabel}>🔴  En vivo</Text>
            <Text style={styles.nowPlayingName} numberOfLines={1}>
              {currentStation.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={() => handlePress(currentStation)}
          >
            <Text style={styles.stopBtnText}>⏹</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.nowPlayingBarEmpty}>
          <Text style={styles.nowPlayingEmptyText}>🎧  Tocá una radio para escuchar</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {GROUPS.map((group) => (
          <View key={group.key}>
            <Text style={styles.groupTitle}>{group.emoji}  {group.label}</Text>
            {STATIONS.filter((s) => s.group === group.key).map((station) => {
              const isPlaying = playingId === station.id;
              const isLoading = loadingId === station.id;
              return (
                <TouchableOpacity
                  key={station.id}
                  style={[styles.card, isPlaying && styles.cardActive]}
                  activeOpacity={0.8}
                  onPress={() => handlePress(station)}
                  disabled={loadingId !== null && !isPlaying}
                >
                  <View style={[styles.emojiBox, isPlaying && styles.emojiBoxActive]}>
                    <Text style={styles.stationEmoji}>{station.emoji}</Text>
                  </View>
                  <View style={styles.stationInfo}>
                    <Text style={[styles.stationName, isPlaying && styles.stationNameActive]}>
                      {station.name}
                    </Text>
                    <Text style={styles.stationDesc}>{station.description}</Text>
                    <Text style={styles.stationGenre}>{station.genre}</Text>
                  </View>
                  <View style={styles.playBtnWrapper}>
                    {isLoading ? (
                      <ActivityIndicator color={Colors.primary} size="large" />
                    ) : (
                      <View style={[styles.playBtn, isPlaying && styles.playBtnActive]}>
                        <Text style={styles.playBtnIcon}>{isPlaying ? '⏹' : '▶'}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <Text style={styles.note}>Streams en vivo · Requiere conexión a internet</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  nowPlayingBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  nowPlayingBarEmpty: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignItems: 'center',
  },
  nowPlayingEmoji: { fontSize: 28 },
  nowPlayingInfo: { flex: 1 },
  nowPlayingLabel: { color: '#AAFFAA', fontSize: FontSizes.xs, fontWeight: '600' },
  nowPlayingName: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
  nowPlayingEmptyText: { color: 'rgba(255,255,255,0.6)', fontSize: FontSizes.sm },
  stopBtn: {
    backgroundColor: Colors.danger, width: 48, height: 48,
    borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  stopBtnText: { fontSize: 22 },

  content: { padding: Spacing.lg, paddingBottom: 40 },
  groupTitle: {
    fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.sm,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    borderWidth: 2, borderColor: 'transparent',
  },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.successLight },
  emojiBox: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.cyanLight,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  emojiBoxActive: { backgroundColor: Colors.primaryLight },
  stationEmoji: { fontSize: 26 },
  stationInfo: { flex: 1 },
  stationName: { fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.textPrimary },
  stationNameActive: { color: Colors.primary },
  stationDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  stationGenre: { fontSize: FontSizes.xs, color: Colors.textLight, marginTop: 2 },

  playBtnWrapper: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 3,
  },
  playBtnActive: { backgroundColor: Colors.danger },
  playBtnIcon: { color: Colors.white, fontSize: 20, fontWeight: 'bold' },

  note: {
    textAlign: 'center', color: Colors.textLight,
    fontSize: FontSizes.xs, marginTop: Spacing.lg,
  },
});
