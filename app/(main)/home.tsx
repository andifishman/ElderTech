import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const menuItems = [
  { 
    id: 'horarios', 
    icon: '📅', 
    label: 'Horarios', 
    subtitle: 'Actividades de la semana', 
    color: '#FFE5E5', 
    iconBg: '#FF9999',
    size: 'large' 
  },
  { 
    id: 'llamar', 
    icon: '📞', 
    label: 'Llamar', 
    subtitle: 'Contactar familia', 
    color: '#E5F9E5', 
    iconBg: '#99E699',
    size: 'medium' 
  },
  { 
    id: 'articulos', 
    icon: '📚', 
    label: 'Artículos', 
    subtitle: 'Aprendé con videos', 
    color: '#F0E5FF', 
    iconBg: '#CC99FF',
    size: 'medium' 
  },
  { 
    id: 'asistente', 
    icon: '🤖', 
    label: 'Asistente', 
    subtitle: 'Asistente personal para ayudas', 
    color: '#E5F5FF', 
    iconBg: '#99CCFF',
    size: 'medium' 
  },
  { 
    id: 'mas', 
    icon: '➕', 
    label: 'Más', 
    subtitle: 'Ver más opciones de la aplicación', 
    color: '#FFF0E5', 
    iconBg: '#FFCC99',
    size: 'medium' 
  },
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
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🌉</Text>
            <View>
              <Text style={styles.logoText}>ElderTech</Text>
              <Text style={styles.logoSubtext}>El puente que necesitás</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowLogout(true)} style={styles.avatarBtn}>
            <Text style={styles.avatarIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcome}>¡Bienvenido/a {user?.fullName?.split(' ')[0] ?? 'Marta'}</Text>
        <Text style={styles.welcomeSub}>¿Qué querés hacer hoy?</Text>
      </View>

      {/* Menu Grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {/* Large Horarios Card */}
        <TouchableOpacity
          style={[styles.largeCard, { backgroundColor: menuItems[0].color }]}
          onPress={() => router.push('/(main)/horarios')}
          activeOpacity={0.8}
        >
          <View style={[styles.largeCardTopBar, { backgroundColor: menuItems[0].iconBg }]} />
          <View style={styles.largeCardContent}>
            <View style={[styles.largeIconCircle, { backgroundColor: menuItems[0].iconBg }]}>
              <Text style={styles.largeCardIcon}>{menuItems[0].icon}</Text>
            </View>
            <View style={styles.largeCardText}>
              <Text style={styles.largeCardLabel}>{menuItems[0].label}</Text>
              <Text style={styles.largeCardSub}>{menuItems[0].subtitle}</Text>
            </View>
          </View>
          <View style={styles.largeCardBottom}>
            <View style={[styles.smallIconCircle, { backgroundColor: menuItems[0].iconBg }]}>
              <Text style={styles.smallIcon}>🔊</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Medium Cards Grid - 2 filas de 2 columnas */}
        <View style={styles.mediumRow}>
          {menuItems.slice(1, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.mediumCard, { backgroundColor: item.color }]}
              onPress={() => router.push(`/(main)/${item.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.mediumCardTopBar, { backgroundColor: item.iconBg }]} />
              <View style={styles.mediumCardInner}>
                <View style={[styles.mediumIconCircle, { backgroundColor: item.iconBg }]}>
                  <Text style={styles.mediumCardIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.mediumCardLabel}>{item.label}</Text>
                <Text style={styles.mediumCardSub}>{item.subtitle}</Text>
              </View>
              <View style={styles.mediumCardBottom}>
                <View style={[styles.smallSpeakerCircle, { backgroundColor: item.iconBg }]}>
                  <Text style={styles.smallSpeakerIcon}>🔊</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.mediumRow}>
          {menuItems.slice(3, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.mediumCard, { backgroundColor: item.color }]}
              onPress={() => router.push(`/(main)/${item.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.mediumCardTopBar, { backgroundColor: item.iconBg }]} />
              <View style={styles.mediumCardInner}>
                <View style={[styles.mediumIconCircle, { backgroundColor: item.iconBg }]}>
                  <Text style={styles.mediumCardIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.mediumCardLabel}>{item.label}</Text>
                <Text style={styles.mediumCardSub}>{item.subtitle}</Text>
              </View>
              <View style={styles.mediumCardBottom}>
                <View style={[styles.smallSpeakerCircle, { backgroundColor: item.iconBg }]}>
                  <Text style={styles.smallSpeakerIcon}>🔊</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  
  // Header Styles
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50, 
    paddingBottom: 20, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  logoText: { 
    color: Colors.white, 
    fontWeight: 'bold', 
    fontSize: 24 
  },
  logoSubtext: {
    color: '#E8F5E8',
    fontSize: 14,
  },
  avatarBtn: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  avatarIcon: { 
    fontSize: 20,
    color: Colors.white,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  welcome: { 
    color: '#2E3A59', 
    fontSize: 22, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSub: { 
    color: '#8A8A8A', 
    fontSize: 16,
  },
  // Grid Layout
  grid: { 
    padding: 20,
    paddingTop: 25,
  },

  // Large Card (Horarios)
  largeCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 140,
  },
  largeCardTopBar: {
    height: 6,
    width: '100%',
  },
  largeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  largeIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  largeCardIcon: { 
    fontSize: 36 
  },
  largeCardText: { 
    flex: 1 
  },
  largeCardLabel: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2E3A59',
    marginBottom: 4,
  },
  largeCardSub: { 
    fontSize: 16, 
    color: '#666',
  },
  largeCardBottom: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  smallIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIcon: {
    fontSize: 20,
  },

  // Medium Cards Grid
  mediumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mediumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mediumCard: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 170,
  },
  mediumCardTopBar: {
    height: 6,
    width: '100%',
  },
  mediumCardInner: {
    padding: 16,
    flex: 1,
  },
  mediumCardContent: {
    flex: 1,
  },
  mediumCardLabel: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2E3A59',
    marginBottom: 6,
    marginTop: 8,
  },
  mediumCardSub: { 
    fontSize: 13, 
    color: '#666',
    lineHeight: 18,
  },
  mediumIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mediumCardIcon: { 
    fontSize: 22,
  },
  mediumCardBottom: {
    alignItems: 'flex-end',
    padding: 12,
    paddingTop: 0,
  },
  smallSpeakerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallSpeakerIcon: {
    fontSize: 18,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white, 
    borderRadius: 20,
    padding: 30, 
    width: '85%', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIcon: { 
    fontSize: 60, 
    marginBottom: 20 
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2E3A59', 
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSub: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 30,
    lineHeight: 22,
  },
  modalBtns: { 
    flexDirection: 'row', 
    gap: 15,
    width: '100%',
  },
  modalBtnDanger: {
    backgroundColor: '#FF6B6B', 
    borderRadius: 12,
    paddingVertical: 15, 
    flex: 1,
    alignItems: 'center',
  },
  modalBtnDangerText: { 
    color: Colors.white, 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  modalBtnCancel: {
    backgroundColor: '#F0F0F0', 
    borderRadius: 12,
    paddingVertical: 15, 
    flex: 1,
    alignItems: 'center',
  },
  modalBtnCancelText: { 
    color: '#2E3A59', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});
