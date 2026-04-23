import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header verde */}
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
            placeholder="María García"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
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
            secureTextEntry
          />
          <Text style={styles.inputIcon}>🔒</Text>
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
  logoText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: FontSizes.xl,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSub: {
    color: '#CCFFCC',
    fontSize: FontSizes.sm,
  },
  form: {
    padding: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  inputIcon: {
    fontSize: 18,
    marginLeft: Spacing.sm,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
    textDecorationLine: 'underline',
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
  },
  registerBtn: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  registerBtnText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
