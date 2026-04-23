import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (!email) {
      Alert.alert('Error', 'Ingresá tu correo electrónico');
      return;
    }
    Alert.alert('Listo', 'Te enviamos las instrucciones a tu correo', [
      { text: 'OK', onPress: () => router.back() },
    ]);
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
        <Text style={styles.headerTitle}>Recuperar acceso</Text>
        <Text style={styles.headerSub}>Olvidaste tu contraseña</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.keyBox}>
          <Text style={styles.keyIcon}>🔑</Text>
        </View>

        <Text style={styles.description}>
          Ingresá tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña.
        </Text>

        <Text style={styles.label}>Correo electrónico *</Text>
        <TextInput
          style={styles.input}
          placeholder="mi.correo@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Enviar instrucciones</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50, paddingBottom: 24, paddingHorizontal: Spacing.xl,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  backArrow: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: 'bold' },
  logoBox: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    alignSelf: 'flex-start', marginBottom: Spacing.sm,
  },
  logoText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.lg },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: 'bold' },
  headerSub: { color: '#CCFFCC', fontSize: FontSizes.sm, marginTop: 4 },
  form: { padding: Spacing.xl, alignItems: 'center' },
  keyBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.successLight,
    alignItems: 'center', justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  keyIcon: { fontSize: 40 },
  description: {
    fontSize: FontSizes.md, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22,
  },
  label: {
    fontSize: FontSizes.md, fontWeight: '600',
    color: Colors.textPrimary, marginBottom: Spacing.xs,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSizes.md, color: Colors.textPrimary,
  },
  sendBtn: {
    width: '100%', backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.xl,
  },
  sendBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
  backLink: { marginTop: Spacing.lg },
  backLinkText: { color: Colors.primary, fontSize: FontSizes.md, textDecorationLine: 'underline' },
});
