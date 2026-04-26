import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DetalleActividadScreen() {
  const { activity } = useLocalSearchParams<{ activity: string }>();
  const item = activity ? JSON.parse(activity) : null;

  if (!item) return null;

  return (
    <View style={styles.container}>
      <AppHeader title="Horarios del Día" subtitle="Detalle de actividad" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.title}>{item.activity}</Text>
          <Text style={styles.time}>🕐 {item.time} - {item.endTime ?? '10:00 hs'}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 ¿Dónde es?</Text>
            <Text style={styles.sectionText}>{item.location ?? 'Sala Común'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Descripción</Text>
            <Text style={styles.sectionText}>{item.description ?? 'Sin descripción disponible.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍🏫 Instructor / Responsable</Text>
            <Text style={styles.sectionText}>{item.instructor ?? 'Personal del hogar'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  icon: { fontSize: 60, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.xs },
  time: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  section: { width: '100%', marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.primary, marginBottom: Spacing.xs },
  sectionText: { fontSize: FontSizes.md, color: Colors.textPrimary, lineHeight: 22 },
  sectionSubText: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
});
