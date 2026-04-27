import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const menuItems = [
  { 
    id: 'horarios', icon: '📅', label: 'Horarios', 
    subtitle: 'Actividades de la semana', color: '#FFE5E5', iconBg: '#FF9999', size: 'large',
    audio: 'Horarios. Acá podés ver todas las actividades de la semana, con sus horarios y descripciones.',
  },
  { 
    id: 'llamar', icon: '📞', label: 'Llamar', 
    subtitle: 'Contactar a personas', color: '#E5F9E5', iconBg: '#99E699', size: 'medium',
    audio: 'Llamar. Desde acá podés llamar o escribirle por WhatsApp a tu familia y amigos.',
  },
  { 
    id: 'articulos', icon: '📚', label: 'Tutoriales', 
    subtitle: 'Aprendé con videos', color: '#F0E5FF', iconBg: '#CC99FF', size: 'medium',
    audio: 'Artículos. Encontrás guías y videos para aprender a usar el celular paso a paso.',
  },
  { 
    id: 'asistente', icon: '🤖', label: 'Asistente', 
    subtitle: 'Asistente personal para ayudas', color: '#E5F5FF', iconBg: '#99CCFF', size: 'medium',
    audio: 'Asistente. Podés hacerle preguntas y te va a responder de forma simple y clara.',
  },
  { 
    id: 'mas', icon: '➕', label: 'Más', 
    subtitle: 'Ver más opciones de la aplicación', color: '#FFF0E5', iconBg: '#FFCC99', size: 'medium',
    audio: 'Más opciones. Acá encontrás juegos, radio, noticias, clima, linterna y más.',
  },
];

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function getFechaHoy() {
  const hoy = new Date();
  const diaSemana = DIAS[hoy.getDay()];
  const diaMes = hoy.getDate();
  const mes = MESES[hoy.getMonth()];
  const anio = hoy.getFullYear();
  return `${diaSemana} ${diaMes} de ${mes} de ${anio}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const insets = useSafeAreaInsets();
  const fecha = getFechaHoy();

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'es-AR', rate: 0.9 });
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🌉</Text>
            <Text style={styles.logoText}>ElderTech</Text>
          </View>
          <TouchableOpacity onPress={() => setShowLogout(true)} style={styles.avatarBtn}>
            <Text style={styles.avatarIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcome}>Hola, hoy es {fecha}</Text>
      </View>

      {/* Menu Grid */}
      <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity
              style={styles.audioBtn}
              onPress={() => speak(menuItems[0].audio)}
              activeOpacity={0.7}
            >
              <Text style={styles.audioBtnText}>🔊  Escuchar descripción</Text>
            </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.audioBtn}
                  onPress={() => speak(item.audio)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.audioBtnText}>🔊  Escuchar</Text>
                </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.audioBtn}
                  onPress={() => speak(item.audio)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.audioBtnText}>🔊  Escuchar</Text>
                </TouchableOpacity>
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
    paddingTop: 14,
    paddingBottom: 6,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  logoText: { 
    color: Colors.white, 
    fontWeight: 'bold', 
    fontSize: 34,
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
    paddingTop: 14,
    paddingBottom: 10,
  },
  welcome: { 
    color: '#2E3A59', 
    fontSize: 32, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSub: { 
    color: '#8A8A8A', 
    fontSize: 18,
  },
  // Grid Layout
  grid: { 
    padding: 20,
    paddingTop: 6,
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
    minHeight: 200,
    flexDirection: 'column',
    justifyContent: 'space-between',
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
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#2E3A59',
    marginBottom: 4,
  },
  largeCardSub: { 
    fontSize: 18, 
    color: '#666',
  },
  largeCardBottom: {
    padding: 12,
    paddingTop: 4,
  },
  audioBtn: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: '100%',
  },
  audioBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E3A59',
  },
  // Botones inferiores legacy (por si quedan referencias)
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
    minHeight: 260,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mediumCardTopBar: {
    height: 6,
    width: '100%',
  },
  mediumCardInner: {
    padding: 16,
    paddingBottom: 8,
    flex: 1,
  },
  mediumCardContent: {
    flex: 1,
  },
  mediumCardLabel: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#2E3A59',
    marginBottom: 6,
    marginTop: 8,
  },
  mediumCardSub: { 
    fontSize: 15, 
    color: '#666',
    lineHeight: 20,
  },
  mediumIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mediumCardIcon: { 
    fontSize: 26,
  },
  mediumCardBottom: {
    padding: 12,
    paddingTop: 0,
    width: '100%',
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
