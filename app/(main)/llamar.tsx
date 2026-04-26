import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useContacts } from '@/context/ContactsContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LlamarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const handleCall = (phone: string) => {
    const url = `tel:${phone.replace(/\s/g, '')}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir la app de teléfono en este dispositivo');
      }
    });
  };

  const handleWhatsApp = (phone: string) => {
    const number = phone.replace(/[\s\-\+\(\)]/g, '');
    const url = `whatsapp://send?phone=${number}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo');
      }
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Llamar" subtitle="Contactá a personas" showBack />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
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
            {/* Info del contacto */}
            <View style={styles.contactTop}>
              <View style={styles.avatarBox}>
                {contact.avatar ? (
                  <Image source={{ uri: contact.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{contact.name.charAt(0)}</Text>
                )}
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
                {contact.relation && (
                  <Text style={styles.contactRelation}>👤 {contact.relation}</Text>
                )}
              </View>
            </View>
            {/* Botones en fila */}
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnEdit]}
                onPress={() => router.push({ pathname: '/(main)/llamar/editar', params: { id: contact.id } } as any)}
              >
                <Text style={styles.actionBtnIcon}>✏️</Text>
                <Text style={styles.actionBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnCall]}
                onPress={() => handleCall(contact.phone)}
              >
                <Text style={styles.actionBtnIcon}>📞</Text>
                <Text style={styles.actionBtnText}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnWsp]}
                onPress={() => handleWhatsApp(contact.phone)}
              >
                <Text style={styles.actionBtnIcon}>💬</Text>
                <Text style={styles.actionBtnText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDelete]}
                onPress={() => setDeleteId(contact.id)}
              >
                <Text style={styles.actionBtnIcon}>🗑️</Text>
                <Text style={styles.actionBtnText}>Borrar</Text>
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
    padding: Spacing.md,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
    gap: Spacing.md,
  },
  contactTop: {
    flexDirection: 'row', alignItems: 'center',
  },
  avatarBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primaryLight, alignItems: 'center',
    justifyContent: 'center', marginRight: Spacing.md,
    overflow: 'hidden',
  },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  avatarText: { color: Colors.white, fontWeight: 'bold', fontSize: FontSizes.xl },
  contactInfo: { flex: 1 },
  contactName: { fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.textPrimary },
  contactPhone: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: 2 },
  contactRelation: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  contactActions: {
    flexDirection: 'row', gap: Spacing.xs,
  },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.sm, borderRadius: Radius.sm, gap: 4,
  },
  actionBtnEdit:   { backgroundColor: Colors.info },
  actionBtnCall:   { backgroundColor: Colors.success },
  actionBtnWsp:    { backgroundColor: '#25D366' },
  actionBtnDelete: { backgroundColor: Colors.danger },
  actionBtnIcon: { fontSize: 22 },
  actionBtnText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '700' },
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
