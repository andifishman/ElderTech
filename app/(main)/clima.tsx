import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: number;
  maxTemp: number;
  minTemp: number;
  forecast: ForecastDay[];
}

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

interface CityResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface SavedCity {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

// ─── Weather helpers ──────────────────────────────────────────────────────────

function getWeatherEmoji(code: number, isDay = 1): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '🌙';
  if (code === 3) return '☁️';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌦️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 84) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Despejado';
  if (code === 1) return 'Mayormente despejado';
  if (code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if (code <= 49) return 'Neblina';
  if (code <= 59) return 'Llovizna';
  if (code <= 69) return 'Lluvia';
  if (code <= 79) return 'Nieve';
  if (code === 80) return 'Lluvias leves';
  if (code === 81) return 'Lluvias moderadas';
  if (code === 82) return 'Lluvias fuertes';
  if (code <= 84) return 'Granizo';
  if (code <= 99) return 'Tormenta';
  return 'Desconocido';
}

function getDayName(dateStr: string, index: number): string {
  if (index === 0) return 'Hoy';
  if (index === 1) return 'Mañana';
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const d = new Date(dateStr + 'T12:00:00');
  return days[d.getDay()];
}

// ─── API response types ───────────────────────────────────────────────────────

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface GeocodingResponse {
  results?: CityResult[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function fetchWeather(lat: number, lon: number, cityName: string, country: string): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo obtener el clima');
  const data = (await res.json()) as OpenMeteoResponse;

  const forecast: ForecastDay[] = data.daily.time.map((date: string, i: number) => ({
    date,
    maxTemp: Math.round(data.daily.temperature_2m_max[i]),
    minTemp: Math.round(data.daily.temperature_2m_min[i]),
    weatherCode: data.daily.weather_code[i],
  }));

  return {
    city: cityName,
    country,
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day,
    maxTemp: Math.round(data.daily.temperature_2m_max[0]),
    minTemp: Math.round(data.daily.temperature_2m_min[0]),
    forecast,
  };
}

async function searchCities(query: string): Promise<CityResult[]> {
  if (query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as GeocodingResponse;
  return data.results ?? [];
}

// ─── Buenos Aires coords ──────────────────────────────────────────────────────

const BUENOS_AIRES: SavedCity = {
  name: 'Buenos Aires',
  country: 'AR',
  latitude: -34.6037,
  longitude: -58.3816,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClimaScreen() {
  const [cities, setCities] = useState<SavedCity[]>([BUENOS_AIRES]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search modal
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityResult[]>([]);
  const [searching, setSearching] = useState(false);

  const loadWeather = useCallback(async (city: SavedCity) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(city.latitude, city.longitude, city.name, city.country);
      setWeather(data);
    } catch {
      setError('No se pudo cargar el clima. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(cities[selectedIndex]);
  }, [selectedIndex, cities, loadWeather]);

  // Debounced city search
  useEffect(() => {
    if (!modalVisible) return;
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      const results = await searchCities(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, modalVisible]);

  const addCity = (result: CityResult) => {
    const already = cities.find(
      (c) => Math.abs(c.latitude - result.latitude) < 0.01 && Math.abs(c.longitude - result.longitude) < 0.01
    );
    if (already) {
      Alert.alert('Ciudad ya agregada', `${result.name} ya está en tu lista.`);
      return;
    }
    const newCity: SavedCity = {
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
    };
    const newCities = [...cities, newCity];
    setCities(newCities);
    setSelectedIndex(newCities.length - 1);
    setModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCity = (index: number) => {
    if (index === 0) {
      Alert.alert('No se puede eliminar', 'Buenos Aires es la ciudad principal.');
      return;
    }
    Alert.alert('Eliminar ciudad', `¿Querés eliminar ${cities[index].name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          const newCities = cities.filter((_, i) => i !== index);
          setCities(newCities);
          setSelectedIndex(0);
        },
      },
    ]);
  };

  const bgColor = weather
    ? weather.isDay
      ? weather.weatherCode <= 2
        ? '#1565C0'
        : weather.weatherCode <= 49
        ? '#546E7A'
        : '#37474F'
      : '#1A237E'
    : Colors.primary;

  return (
    <View style={styles.container}>
      <AppHeader title="Clima" subtitle="Temperatura y pronóstico" showBack />

      {/* City tabs */}
      <View style={[styles.tabsWrapper, { backgroundColor: bgColor }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {cities.map((city, i) => (
            <TouchableOpacity
              key={`${city.name}-${i}`}
              style={[styles.tab, selectedIndex === i && styles.tabActive]}
              onPress={() => setSelectedIndex(i)}
              onLongPress={() => removeCity(i)}
            >
              <Text style={[styles.tabText, selectedIndex === i && styles.tabTextActive]}>
                {city.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addTab} onPress={() => setModalVisible(true)}>
            <Text style={styles.addTabText}>＋</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { backgroundColor: bgColor }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>Cargando clima...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadWeather(cities[selectedIndex])}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : weather ? (
          <>
            {/* Main card */}
            <View style={styles.mainCard}>
              <Text style={styles.cityName}>{weather.city}</Text>
              <Text style={styles.countryName}>{weather.country}</Text>
              {selectedIndex !== 0 && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeCity(selectedIndex)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteBtnText}>🗑️  Eliminar ciudad</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.weatherEmoji}>
                {getWeatherEmoji(weather.weatherCode, weather.isDay)}
              </Text>
              <Text style={styles.temperature}>{weather.temperature}°C</Text>
              <Text style={styles.description}>{getWeatherDescription(weather.weatherCode)}</Text>
              <Text style={styles.minMax}>
                Máx {weather.maxTemp}° · Mín {weather.minTemp}°
              </Text>
            </View>

            {/* Details row */}
            <View style={styles.detailsRow}>
              <View style={styles.detailCard}>
                <Text style={styles.detailEmoji}>🌡️</Text>
                <Text style={styles.detailValue}>{weather.feelsLike}°C</Text>
                <Text style={styles.detailLabel}>Sensación</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailEmoji}>💧</Text>
                <Text style={styles.detailValue}>{weather.humidity}%</Text>
                <Text style={styles.detailLabel}>Humedad</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailEmoji}>💨</Text>
                <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
                <Text style={styles.detailLabel}>Viento</Text>
              </View>
            </View>

            {/* 7-day forecast */}
            <View style={styles.forecastCard}>
              <Text style={styles.forecastTitle}>Pronóstico 7 días</Text>
              {weather.forecast.map((day, i) => (
                <View key={day.date} style={[styles.forecastRow, i < weather.forecast.length - 1 && styles.forecastDivider]}>
                  <Text style={styles.forecastDay}>{getDayName(day.date, i)}</Text>
                  <Text style={styles.forecastEmoji}>{getWeatherEmoji(day.weatherCode)}</Text>
                  <Text style={styles.forecastDesc}>{getWeatherDescription(day.weatherCode)}</Text>
                  <Text style={styles.forecastTemps}>
                    <Text style={styles.forecastMax}>{day.maxTemp}°</Text>
                    <Text style={styles.forecastMin}> / {day.minTemp}°</Text>
                  </Text>
                </View>
              ))}
            </View>

            {/* Source note */}
            <Text style={styles.source}>Datos: Actualizado ahora</Text>
          </>
        ) : null}
      </ScrollView>

      {/* Add city modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Agregar ciudad</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ciudad..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searching && (
              <ActivityIndicator style={{ marginVertical: Spacing.md }} color={Colors.primary} />
            )}
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.id)}
              style={styles.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => addCity(item)}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultSub}>
                    {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length >= 2 && !searching ? (
                  <Text style={styles.noResults}>Sin resultados</Text>
                ) : null
              }
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Tabs
  tabsWrapper: { paddingBottom: Spacing.sm },
  tabs: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm, flexDirection: 'row' },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabActive: { backgroundColor: Colors.white },
  tabText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSizes.sm, fontWeight: '600' },
  tabTextActive: { color: Colors.primary },
  addTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderStyle: 'dashed',
  },
  addTabText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },

  // Content
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 },
  centered: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  loadingText: { color: Colors.white, fontSize: FontSizes.lg },
  errorEmoji: { fontSize: 48 },
  errorText: { color: Colors.white, fontSize: FontSizes.lg, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  retryText: { color: Colors.primary, fontWeight: 'bold', fontSize: FontSizes.md },

  // Main card
  mainCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  cityName: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: 'bold' },
  countryName: { color: 'rgba(255,255,255,0.7)', fontSize: FontSizes.md, marginBottom: Spacing.sm },
  weatherEmoji: { fontSize: 80, marginVertical: Spacing.sm },
  temperature: { color: Colors.white, fontSize: 72, fontWeight: '200', lineHeight: 80 },
  description: { color: 'rgba(255,255,255,0.9)', fontSize: FontSizes.xl, marginTop: Spacing.sm },
  minMax: { color: 'rgba(255,255,255,0.7)', fontSize: FontSizes.md, marginTop: Spacing.xs },

  // Details
  detailsRow: { flexDirection: 'row', gap: Spacing.sm },
  detailCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  detailEmoji: { fontSize: 24 },
  detailValue: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
  detailLabel: { color: 'rgba(255,255,255,0.75)', fontSize: FontSizes.xs },

  // Forecast
  forecastCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  forecastTitle: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  forecastDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  forecastDay: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600', width: 60 },
  forecastEmoji: { fontSize: 22, width: 36, textAlign: 'center' },
  forecastDesc: { color: 'rgba(255,255,255,0.8)', fontSize: FontSizes.sm, flex: 1 },
  forecastTemps: { textAlign: 'right' },
  forecastMax: { color: Colors.white, fontSize: FontSizes.md, fontWeight: 'bold' },
  forecastMin: { color: 'rgba(255,255,255,0.6)', fontSize: FontSizes.md },

  source: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Delete button
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteBtnText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  resultsList: { maxHeight: 280 },
  resultItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.textPrimary },
  resultSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  noResults: { textAlign: 'center', color: Colors.textLight, padding: Spacing.lg },
  cancelBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelText: { color: Colors.textSecondary, fontSize: FontSizes.lg, fontWeight: '600' },
});
