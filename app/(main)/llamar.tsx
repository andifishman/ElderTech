import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContacts } from '@/context/ContactsContext';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Spacing, Radius } from '@/constants/theme';

export default function LlamarScreen() {
  const router = useRouter();
  const { contacts, deleteContact } = useContacts();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = () => {
    if (deleteId) {
      deleteContact(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Llamar" subtitle="Contactá a personas" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(main)/llamar/agregar' as any)}
        >
          <Text style={styles.addBtnText}>+ Agregar nuevo contacto</Text>
        </TouchableOpacity>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar contacto..."
            value={search}
            onChangeText={setSearch}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        <Text style={styles.sectionTitle}>Mis contactos</Text>

        {filtered.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{contact.name.charAt(0)}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push({ pathname: '/(main)/llamar/editar', params: { id: contact.id } } as any)}
              >
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Llamar', `Llamando a ${contact.name}...`)}>
                <Text style={styles.actionIcon}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.whatsappBtn} onPress={() => Alert.alert('WhatsApp', `Abriendo WhatsApp para ${contact.name}...`)}>
                <Text style={styles.actionIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteId(contact.id)}>
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal visible={!!deleteId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🗑️</Text>
            <Text style={styles.modalTitle}>Eliminar Contacto</Text>
            <Text style={styles.modalSub}>¿Estás seguro que querés eliminar el contacto?</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnDanger} onPress={confirmDelete}>
                <Text style={styles.modalBtnDangerText}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setDeleteId(null)}>
                <Text style={styles.modalBtnCancelText}>Volver</Text>
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
  content: { padding: Spacing.lg, gap: Spacing.md },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  addBtnText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: 'bold' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.sm, paddingHorizontal: Spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontSize: FontSizes.md },
  searchIcon: { fontSize: 18 },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.textPrimary },
  contactCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, flexWrap: 'wrap', gap: Spacing.xs,
  },
  avatarBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryLight, alignItems: 'center',
    justifyContent: 'center', marginRight: Spacing.sm,
  },
  avatarText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.lg },
  contactInfo: { flex: 1, minWidth: 100 },
  contactName: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.textPrimary },
  contactPhone: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  contactActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  editBtn: {
    backgroundColor: Colors.info, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
  },
  editBtnText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '600' },
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
  },
  whatsappBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: Colors.danger, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
  },
  deleteBtnText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '600' },
  actionIcon: { fontSize: 18 },
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
