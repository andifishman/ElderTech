import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContacts } from '@/context/ContactsContext';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

const RELATIONS = ['Hijo/a', 'Nieto/a', 'Médico', 'Amigo'];

export default function EditarContactoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, editContact } = useContacts();
  const contact = contacts.find((c) => c.id === id);

  const [name, setName] = useState(contact?.name ?? '');
  const [phone, setPhone] = useState(contact?.phone?.replace('+54 ', '') ?? '');
  const [relation, setRelation] = useState(contact?.relation ?? '');

  const handleSave = () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Nombre y teléfono son obligatorios');
      return;
    }
    editContact(id!, { name, phone: `+54 ${phone}`, relation });
    router.back();
  };

  if (!contact) return null;

  return (
    <View style={styles.container}>
      <AppHeader title="Llamar" subtitle="Editar contacto" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarBox}>
          <Text style={styles.avatarIcon}>👤</Text>
          <Text style={styles.avatarLabel}>Cambiar foto</Text>
        </View>

        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Número de teléfono *</Text>
        <View style={styles.phoneRow}>
          <View style={styles.prefixBox}><Text style={styles.prefixText}>+54</Text></View>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Relación (opcional)</Text>
        <View style={styles.relationsRow}>
          {RELATIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.relBtn, relation === r && styles.relBtnActive]}
              onPress={() => setRelation(r)}
            >
              <Text style={[styles.relBtnText, relation === r && styles.relBtnTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, gap: Spacing.sm },
  avatarBox: { alignItems: 'center', marginBottom: Spacing.lg },
  avatarIcon: { fontSize: 64 },
  avatarLabel: { color: Colors.primary, fontSize: FontSizes.sm, marginTop: Spacing.xs },
  label: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSizes.md, color: Colors.textPrimary,
  },
  phoneRow: { flexDirection: 'row', gap: Spacing.sm },
  prefixBox: {
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.sm, paddingHorizontal: Spacing.md, justifyContent: 'center',
  },
  prefixText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  phoneInput: { flex: 1 },
  relationsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  relBtn: {
    borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  relBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  relBtnText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  relBtnTextActive: { color: Colors.white, fontWeight: '600' },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.lg,
  },
  saveBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: 'bold' },
  cancelBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontSize: FontSizes.md },
});
