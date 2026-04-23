import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

const menuItems = [
  { id: 'horarios', icon: '📅', label: 'Horarios', subtitle: 'Actividades de la semana', color: Colors.cyanLight, iconBg: Colors.cyan },
  { id: 'llamar', icon: '📞', label: 'Llamar', subtitle: 'Contactá a tu familia', color: Colors.successLight, iconBg: Colors.success },
  { id: 'articulos', icon: '📰', label: 'Artículos', subtitle: 'Aprendé a usar la tecnología', color: Colors.purpleLight, iconBg: Colors.purple },
  { id: 'asistente', icon: '🤖', label: 'Asistente', subtitle: 'Asistente para ayudarte', color: Colors.infoLight, iconBg: Colors.info },
  { id: 'mas', icon: '➕', label: 'Más', subtitle: 'Ver más opciones de la aplicación', color: Colors.orangeLight, iconBg: Colors.orange },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>ElderTech</Text>
          </View>
          <TouchableOpacity onPress={() => setShowLogout(true)} style={styles.avatarBtn}>
            <Text style={styles.avatarIcon}>👤</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcome}>¡Bienvenido/a {user?.fullName?.split(' ')[0] ?? 'Marta'}!</Text>
        <Text style={styles.welcomeSub}>¿Qué querés hacer hoy?</Text>
      </View>

      {/* Menu Grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => router.push(`/(main)/${item.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardSub}>{item.subtitle}</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={showLogout} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🚪</Text>
            <Text style={styles.modalTitle}>¿Querés salir?</Text>
            <Text style={styles.modalSub}>¿Estás seguro que querés cerrar la aplicación?</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnDanger} onPress={handleLogout}>
                <Text style={styles.modalBtnDangerText}>Salir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLogout(false)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50, paddingBottom: 24, paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  logoBox: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  logoText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.lg },
  avatarBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarIcon: { fontSize: 20 },
  welcome: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: 'bold' },
  welcomeSub: { color: '#CCFFCC', fontSize: FontSizes.sm, marginTop: 4 },
  grid: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg, padding: Spacing.lg,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  cardIcon: { fontSize: 26 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.textPrimary },
  cardSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  cardArrow: { fontSize: 28, color: Colors.textLight, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, backgroundColor: '#00000066',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.xl, width: '80%', alignItems: 'center',
  },
  modalIcon: { fontSize: 48, marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.sm },
  modalSub: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  modalBtns: { flexDirection: 'row', gap: Spacing.md },
  modalBtnDanger: {
    backgroundColor: Colors.danger, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
  },
  modalBtnDangerText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.md },
  modalBtnCancel: {
    backgroundColor: Colors.border, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
  },
  modalBtnCancelText: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: FontSizes.md },
});
