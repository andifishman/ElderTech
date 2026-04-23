import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

const DIFFICULTIES = ['Independiente', 'Necesita ayuda', 'Dependiente'] as const;

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [floor, setFloor] = useState('');
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>('Independiente');

  const handleRegister = () => {
    if (!fullName || !username || !password || !email) {
      Alert.alert('Error', 'Completá los campos obligatorios');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    register({ fullName, username, password, email, floor, difficulty });
    router.replace('/(main)/home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>ElderTech</Text>
        </View>
        <Text style={styles.headerTitle}>Crear una cuenta nueva</Text>
        <Text style={styles.headerSub}>Completá tus datos</Text>
      </View>

      <View style={styles.form}>
        {[
          { label: 'Nombre completo *', value: fullName, setter: setFullName, placeholder: 'María García' },
          { label: 'Nombre de usuario *', value: username, setter: setUsername, placeholder: 'mariagarcia' },
          { label: 'Contraseña *', value: password, setter: setPassword, placeholder: '••••••••', secure: true },
          { label: 'Confirmar contraseña *', value: confirmPassword, setter: setConfirmPassword, placeholder: '••••••••', secure: true },
          { label: 'Correo electrónico *', value: email, setter: setEmail, placeholder: 'maria@gmail.com' },
          { label: 'Piso / Habitación', value: floor, setter: setFloor, placeholder: 'Ej: 3A' },
        ].map((field) => (
          <View key={field.label}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={field.setter}
              secureTextEntry={field.secure}
              autoCapitalize="none"
            />
          </View>
        ))}

        <Text style={styles.label}>Estado de dificultad *</Text>
        <View style={styles.difficultyRow}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.diffBtnText, difficulty === d && styles.diffBtnTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerBtnText}>Registrarme</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: Spacing.xl,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  backArrow: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: 'bold' },
  logoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  logoText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.lg },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: 'bold' },
  headerSub: { color: '#CCFFCC', fontSize: FontSizes.sm, marginTop: 4 },
  form: { padding: Spacing.xl },
  label: {
    fontSize: FontSizes.md, fontWeight: '600',
    color: Colors.textPrimary, marginBottom: Spacing.xs, marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSizes.md, color: Colors.textPrimary,
  },
  difficultyRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginTop: Spacing.xs },
  diffBtn: {
    borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  diffBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  diffBtnText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  diffBtnTextActive: { color: Colors.white, fontWeight: '600' },
  registerBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.xl,
  },
  registerBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
