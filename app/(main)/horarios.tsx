import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const scheduleData: Record<string, Array<{ time: string; icon: string; activity: string }>> = {
  '2025-04-07': [
    { time: '06:00', icon: '🍳', activity: 'Desayuno' },
    { time: '09:30', icon: '🏋️', activity: 'Gimnasia' },
    { time: '11:00', icon: '💻', activity: 'Taller de tecnología' },
    { time: '12:30', icon: '🍽️', activity: 'Almuerzo' },
    { time: '15:00', icon: '📖', activity: 'Lectura y descanso' },
    { time: '17:00', icon: '🥐', activity: 'Merienda' },
  ],
  '2025-04-08': [
    { time: '06:00', icon: '🍳', activity: 'Desayuno' },
    { time: '09:30', icon: '♟️', activity: 'Torneo de ajedrez' },
    { time: '11:00', icon: '🎨', activity: 'Mosaico' },
    { time: '12:30', icon: '🍽️', activity: 'Almuerzo' },
    { time: '15:00', icon: '🎬', activity: 'Cine' },
    { time: '19:00', icon: '🍽️', activity: 'Cena' },
  ],
};

function getWeekDates(baseDate: Date) {
  const day = baseDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatDateLabel(d: Date) {
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HorariosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = new Date(2025, 3, 7); // April 7 2025
  const [selectedDate, setSelectedDate] = useState(today);
  const weekDates = getWeekDates(selectedDate);
  const dateKey = formatDateKey(selectedDate);
  const activities = scheduleData[dateKey] ?? [];

  return (
    <View style={styles.container}>
      <AppHeader title="Horarios del Día" subtitle="Actividades de la semana" showBack />

      {/* Week selector */}
      <View style={styles.weekRow}>
        {weekDates.map((d, i) => {
          const isSelected = formatDateKey(d) === formatDateKey(selectedDate);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
              onPress={() => setSelectedDate(d)}
            >
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{DAYS[i]}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{d.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.dateLabel}>
        {formatDateLabel(selectedDate).charAt(0).toUpperCase() + formatDateLabel(selectedDate).slice(1)}
      </Text>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {activities.length === 0 ? (
          <Text style={styles.emptyText}>No hay actividades para este día</Text>
        ) : (
          activities.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.activityCard}
              onPress={() => router.push({ pathname: '/(main)/horarios/detalle', params: { activity: JSON.stringify(item) } } as any)}
            >
              <Text style={styles.activityTime}>{item.time}</Text>
              <View style={styles.activityIconBox}>
                <Text style={styles.activityIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.activityName}>{item.activity}</Text>
              <Text style={styles.activityArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  weekRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: Colors.white, paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dayBtn: {
    alignItems: 'center', paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm, borderRadius: Radius.sm,
  },
  dayBtnActive: { backgroundColor: Colors.primary },
  dayLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  dayLabelActive: { color: Colors.white },
  dayNum: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 2 },
  dayNumActive: { color: Colors.white },
  dateLabel: {
    fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  activityCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
    shadowRadius: 3, elevation: 2,
  },
  activityTime: {
    fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary,
    width: 48, marginRight: Spacing.sm,
  },
  activityIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background, alignItems: 'center',
    justifyContent: 'center', marginRight: Spacing.md,
  },
  activityIcon: { fontSize: 22 },
  activityName: { flex: 1, fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  activityArrow: { fontSize: 24, color: Colors.textLight },
  emptyText: { textAlign: 'center', color: Colors.textLight, fontSize: FontSizes.md, marginTop: Spacing.xxl },
});
