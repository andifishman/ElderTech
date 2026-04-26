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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const scheduleData: Record<string, Array<{ time: string; icon: string; activity: string; endTime: string; description: string; location: string; instructor: string }>> = {
  // Lunes
  '2025-04-07': [
    { time: '07:00', endTime: '08:00', icon: '🍳', activity: 'Desayuno', description: 'Desayuno completo con opciones saludables. Incluye frutas, lácteos y cereales.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '09:00', endTime: '10:00', icon: '🏋️', activity: 'Gimnasia', description: 'Ejercicios suaves de movilidad y estiramiento. Apto para todos los niveles.', location: 'Salón de usos múltiples, 1er piso', instructor: 'Prof. Laura Méndez' },
    { time: '10:30', endTime: '12:00', icon: '💻', activity: 'Taller de tecnología', description: 'Aprendé a usar el celular y la tablet. Temas: fotos, WhatsApp y videollamadas.', location: 'Sala de computación, planta baja', instructor: 'Prof. Germán Lobos' },
    { time: '12:30', endTime: '13:30', icon: '🍽️', activity: 'Almuerzo', description: 'Almuerzo con menú variado. Consultar opciones especiales con el personal.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '15:00', endTime: '16:30', icon: '📖', activity: 'Lectura y descanso', description: 'Tiempo libre para leer, descansar o conversar con otros residentes.', location: 'Biblioteca y sala de estar', instructor: 'Actividad libre' },
    { time: '17:00', endTime: '17:30', icon: '🥐', activity: 'Merienda', description: 'Merienda con té, café, medialunas y galletitas.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '20:00', endTime: '21:00', icon: '🍽️', activity: 'Cena', description: 'Cena liviana. Menú del día disponible en recepción.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
  ],
  // Martes
  '2025-04-08': [
    { time: '07:00', endTime: '08:00', icon: '🍳', activity: 'Desayuno', description: 'Desayuno completo con opciones saludables.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '09:30', endTime: '11:00', icon: '♟️', activity: 'Torneo de ajedrez', description: 'Torneo amistoso de ajedrez. Todos los niveles bienvenidos. Hay premios para los ganadores.', location: 'Sala de juegos, 2do piso', instructor: 'Prof. Carlos Ruiz' },
    { time: '11:00', endTime: '12:30', icon: '🎨', activity: 'Taller de mosaico', description: 'Creá hermosas piezas decorativas con técnica de mosaico. Se proveen materiales.', location: 'Taller de arte, 1er piso', instructor: 'Prof. Ana Gómez' },
    { time: '12:30', endTime: '13:30', icon: '🍽️', activity: 'Almuerzo', description: 'Almuerzo con menú variado.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '15:00', endTime: '17:00', icon: '🎬', activity: 'Cine', description: 'Proyección de película clásica. Esta semana: "Casablanca" (1942). Entrada libre.', location: 'Sala de cine, subsuelo', instructor: 'Actividad libre' },
    { time: '17:00', endTime: '17:30', icon: '🥐', activity: 'Merienda', description: 'Merienda con té, café y facturas.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '20:00', endTime: '21:00', icon: '🍽️', activity: 'Cena', description: 'Cena liviana. Menú del día disponible en recepción.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
  ],
  // Miércoles
  '2025-04-09': [
    { time: '07:00', endTime: '08:00', icon: '🍳', activity: 'Desayuno', description: 'Desayuno completo con opciones saludables.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '09:00', endTime: '10:30', icon: '🧘', activity: 'Yoga y relajación', description: 'Clase de yoga suave y técnicas de respiración para reducir el estrés. Traer ropa cómoda.', location: 'Jardín o salón de usos múltiples', instructor: 'Prof. Sofía Herrera' },
    { time: '11:00', endTime: '12:30', icon: '🎵', activity: 'Taller de música', description: 'Canto grupal y apreciación musical. Repertorio de tangos y folklore argentino.', location: 'Sala de música, 1er piso', instructor: 'Prof. Roberto Sánchez' },
    { time: '12:30', endTime: '13:30', icon: '🍽️', activity: 'Almuerzo', description: 'Almuerzo con menú variado.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '15:00', endTime: '16:30', icon: '🌿', activity: 'Taller de jardinería', description: 'Cuidado de plantas y huerta orgánica. Aprendé a cultivar tus propias hierbas aromáticas.', location: 'Jardín trasero', instructor: 'Prof. Miguel Torres' },
    { time: '17:00', endTime: '17:30', icon: '🥐', activity: 'Merienda', description: 'Merienda con té, café y torta casera.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '20:00', endTime: '21:00', icon: '🍽️', activity: 'Cena', description: 'Cena liviana. Menú del día disponible en recepción.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
  ],
  // Jueves
  '2025-04-10': [
    { time: '07:00', endTime: '08:00', icon: '🍳', activity: 'Desayuno', description: 'Desayuno completo con opciones saludables.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '09:00', endTime: '10:30', icon: '🩺', activity: 'Control médico', description: 'Revisión médica general y control de presión. Traer libreta de salud.', location: 'Consultorio médico, planta baja', instructor: 'Dr. Pablo Fernández' },
    { time: '11:00', endTime: '12:30', icon: '🧩', activity: 'Juegos de mesa', description: 'Tarde de juegos: dominó, cartas, ludo y más. Actividad grupal y recreativa.', location: 'Sala de juegos, 2do piso', instructor: 'Personal de recreación' },
    { time: '12:30', endTime: '13:30', icon: '🍽️', activity: 'Almuerzo', description: 'Almuerzo con menú variado.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '15:00', endTime: '16:30', icon: '✂️', activity: 'Taller de manualidades', description: 'Tejido, bordado y otras manualidades. Se proveen materiales básicos.', location: 'Taller de arte, 1er piso', instructor: 'Prof. Elena Vidal' },
    { time: '17:00', endTime: '17:30', icon: '🥐', activity: 'Merienda', description: 'Merienda con té, café y galletitas.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '20:00', endTime: '21:00', icon: '🍽️', activity: 'Cena', description: 'Cena liviana. Menú del día disponible en recepción.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
  ],
  // Viernes
  '2025-04-11': [
    { time: '07:00', endTime: '08:00', icon: '🍳', activity: 'Desayuno', description: 'Desayuno completo con opciones saludables.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '09:00', endTime: '10:30', icon: '🏋️', activity: 'Gimnasia', description: 'Ejercicios suaves de movilidad y estiramiento. Apto para todos los niveles.', location: 'Salón de usos múltiples, 1er piso', instructor: 'Prof. Laura Méndez' },
    { time: '11:00', endTime: '12:30', icon: '🍰', activity: 'Taller de cocina', description: 'Aprendé recetas simples y deliciosas. Esta semana: alfajores caseros.', location: 'Cocina taller, planta baja', instructor: 'Chef María Rodríguez' },
    { time: '12:30', endTime: '13:30', icon: '🍽️', activity: 'Almuerzo', description: 'Almuerzo especial de viernes con menú ampliado.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '15:00', endTime: '17:00', icon: '🎭', activity: 'Tarde cultural', description: 'Presentación de teatro o música en vivo. Programa semanal en cartelera.', location: 'Salón de actos, 1er piso', instructor: 'Grupo cultural externo' },
    { time: '17:00', endTime: '17:30', icon: '🥐', activity: 'Merienda', description: 'Merienda especial de viernes con torta y facturas.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '20:00', endTime: '21:00', icon: '🍽️', activity: 'Cena', description: 'Cena liviana. Menú del día disponible en recepción.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
  ],
  // Sábado
  '2025-04-12': [
    { time: '08:00', endTime: '09:00', icon: '🍳', activity: 'Desayuno', description: 'Desayuno especial de fin de semana con más variedad.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '10:00', endTime: '12:00', icon: '👨‍👩‍👧', activity: 'Visitas familiares', description: 'Horario de visitas. Los familiares son bienvenidos en todas las áreas comunes.', location: 'Sala de visitas y jardín', instructor: 'Personal de guardia' },
    { time: '12:30', endTime: '13:30', icon: '🍽️', activity: 'Almuerzo', description: 'Almuerzo especial de sábado.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '15:00', endTime: '17:00', icon: '🎲', activity: 'Tarde de juegos', description: 'Bingo, cartas y juegos grupales. Actividad recreativa con premios.', location: 'Sala de juegos, 2do piso', instructor: 'Personal de recreación' },
    { time: '17:00', endTime: '17:30', icon: '🥐', activity: 'Merienda', description: 'Merienda con té, café y facturas.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '20:00', endTime: '21:00', icon: '🍽️', activity: 'Cena', description: 'Cena especial de sábado.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
  ],
  // Domingo
  '2025-04-13': [
    { time: '08:00', endTime: '09:30', icon: '🍳', activity: 'Desayuno', description: 'Desayuno especial de domingo con medialunas y facturas.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '10:00', endTime: '12:00', icon: '⛪', activity: 'Misa / Momento espiritual', description: 'Celebración religiosa opcional. También hay espacio de meditación y reflexión.', location: 'Capilla o sala de estar', instructor: 'Padre Martín López' },
    { time: '12:30', endTime: '14:00', icon: '🍽️', activity: 'Almuerzo especial', description: 'Almuerzo especial de domingo con menú ampliado y postre.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '14:00', endTime: '17:00', icon: '👨‍👩‍👧', activity: 'Visitas familiares', description: 'Horario extendido de visitas de domingo. Familiares bienvenidos.', location: 'Sala de visitas y jardín', instructor: 'Personal de guardia' },
    { time: '17:00', endTime: '17:30', icon: '🥐', activity: 'Merienda', description: 'Merienda especial de domingo.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
    { time: '20:00', endTime: '21:00', icon: '🍽️', activity: 'Cena', description: 'Cena liviana de domingo.', location: 'Comedor principal, planta baja', instructor: 'Personal de cocina' },
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
