import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UtilidadesScreen() {
  const insets = useSafeAreaInsets();
  const [torchOn, setTorchOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const toggleTorch = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('No disponible', 'La linterna solo funciona en el celular.');
      return;
    }
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para usar la linterna.');
        return;
      }
    }
    setTorchOn((v) => !v);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <AppHeader title="Utilidades" subtitle="Herramientas útiles" showBack />

      {torchOn && Platform.OS !== 'web' && (
        <CameraView
          ref={cameraRef}
          style={styles.hiddenCamera}
          enableTorch={true}
        />
      )}

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔦 Linterna</Text>
          <TouchableOpacity
            style={[styles.torchBtn, torchOn && styles.torchBtnOn]}
            onPress={toggleTorch}
            activeOpacity={0.8}
          >
            <Text style={styles.torchIcon}>{torchOn ? '💡' : '🔦'}</Text>
            <Text style={[styles.torchText, torchOn && styles.torchTextOn]}>
              {torchOn ? 'Apagar linterna' : 'Encender linterna'}
            </Text>
          </TouchableOpacity>
          {torchOn && (
            <Text style={styles.torchHint}>La linterna está encendida. Tocá para apagarla.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hiddenCamera: { width: 1, height: 1, position: 'absolute', opacity: 0 },
  content: { padding: Spacing.lg },
  section: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, gap: Spacing.md,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary },
  torchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: Colors.background,
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: Radius.lg, paddingVertical: Spacing.xl,
  },
  torchBtnOn: { backgroundColor: '#FFF9C4', borderColor: '#F9A825' },
  torchIcon: { fontSize: 48 },
  torchText: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.textPrimary },
  torchTextOn: { color: '#F9A825' },
  torchHint: { textAlign: 'center', fontSize: FontSizes.sm, color: Colors.textSecondary },
});
