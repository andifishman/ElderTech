import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert, KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

const KeyboardWrapper = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }
    const ok = login(username, password);
    if (ok) {
      router.replace('/(main)/home');
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
    }
  };

  return (
    <KeyboardWrapper>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>ElderTech</Text>
          </View>
          <Text style={styles.headerTitle}>Iniciá sesión</Text>
          <Text style={styles.headerSub}>Ingresá tu nombre y contraseña</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre de usuario *</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ej: María García"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#BBBBBB"
            />
            <Text style={styles.inputIcon}>👤</Text>
          </View>

          <Text style={styles.label}>Contraseña *</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#BBBBBB"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/recover')}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Ingresar →</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>¿Sos nuevo?</Text>

          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerBtnText}>Crear una cuenta nueva</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  logoText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.xl },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: 'bold', marginBottom: 4 },
  headerSub: { color: '#CCFFCC', fontSize: FontSizes.sm },
  form: { padding: Spacing.xl },
  label: {
    fontSize: FontSizes.md, fontWeight: '600',
    color: Colors.textPrimary, marginBottom: Spacing.xs, marginTop: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.sm, paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1, paddingVertical: Spacing.md,
    fontSize: FontSizes.md, color: Colors.textPrimary,
  },
  inputIcon: { fontSize: 18, marginLeft: Spacing.sm },
  eyeBtn: { padding: 4 },
  forgotText: {
    color: Colors.primary, fontSize: FontSizes.sm,
    marginTop: Spacing.sm, textDecorationLine: 'underline',
  },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.xl,
  },
  loginBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
  orText: {
    textAlign: 'center', color: Colors.textSecondary,
    fontSize: FontSizes.sm, marginTop: Spacing.lg,
  },
  registerBtn: {
    borderWidth: 2, borderColor: Colors.primary,
    borderRadius: Radius.sm, paddingVertical: Spacing.md,
    alignItems: 'center', marginTop: Spacing.sm,
  },
  registerBtnText: { color: Colors.primary, fontSize: FontSizes.md, fontWeight: '600' },
});
