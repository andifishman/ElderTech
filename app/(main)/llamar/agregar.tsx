import AppHeader from '@/components/ui/AppHeader';
import { COMMON_COUNTRY_CODES, COUNTRY_CODES, CountryCode, getFlagEmoji } from '@/constants/countryCodes';
import { Colors, FontSizes, Radius, Spacing } from '@/constants/theme';
import { useContacts } from '@/context/ContactsContext';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

const RELATIONS = ['Hijo/a', 'Nieto/a', 'Médico', 'Amigo', 'Otra...'];

export default function AgregarContactoScreen() {
  const router = useRouter();
  const { addContact } = useContacts();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+54');
  const [relation, setRelation] = useState('');
  const [customRelation, setCustomRelation] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCustomRelation, setShowCustomRelation] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const commonCountries = useMemo(
    () => COUNTRY_CODES.filter((c) => COMMON_COUNTRY_CODES.includes(c.code)),
    []
  );

  // Filtrar países según la búsqueda
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRY_CODES;
    
    const search = countrySearch.toLowerCase();
    return COUNTRY_CODES.filter(
      (country) =>
        country.name.toLowerCase().includes(search) ||
        country.dial_code.includes(search) ||
        country.code.toLowerCase().includes(search)
    );
  }, [countrySearch]);

  const selectedCountry = useMemo(
    () => COUNTRY_CODES.find((c) => c.dial_code === countryCode),
    [countryCode]
  );

  const handlePhoneChange = (text: string) => {
    // Solo permitir números, espacios y guiones
    const cleaned = text.replace(/[^0-9\s-]/g, '');
    setPhone(cleaned);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para elegir una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleRelationSelect = (r: string) => {
    if (r === 'Otra...') {
      setShowCustomRelation(true);
      setRelation('');
    } else {
      setRelation(r);
      setShowCustomRelation(false);
    }
  };

  const handleSave = () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Nombre y teléfono son obligatorios');
      return;
    }
    
    const finalRelation = showCustomRelation ? customRelation : relation;
    const contactData = {
      name,
      phone: `${countryCode} ${phone}`,
      avatar,
      ...(finalRelation && { relation: finalRelation }),
    };
    
    addContact(contactData);
    router.back();
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Llamar" subtitle="Agregar contacto" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.avatarBox} onPress={handlePickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarIcon}>👤</Text>
          )}
          <Text style={styles.avatarLabel}>{avatar ? 'Cambiar foto' : 'Agregar foto'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput style={styles.input} placeholder="Ej: María García" value={name} onChangeText={setName} />

        <Text style={styles.label}>Número de teléfono *</Text>
        <View style={styles.phoneRow}>
          <TouchableOpacity 
            style={styles.prefixBox} 
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.prefixText}>
              {selectedCountry ? `${getFlagEmoji(selectedCountry.code)} ${countryCode}` : countryCode} ▼
            </Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="11 1234-5678"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Relación (opcional)</Text>
        <View style={styles.relationsRow}>
          {RELATIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.relBtn, relation === r && styles.relBtnActive]}
              onPress={() => handleRelationSelect(r)}
            >
              <Text style={[styles.relBtnText, relation === r && styles.relBtnTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {showCustomRelation && (
          <TextInput
            style={[styles.input, styles.customRelationInput]}
            placeholder="Escribe la relación..."
            value={customRelation}
            onChangeText={setCustomRelation}
          />
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>✓ Guardar contacto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para seleccionar código de país */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar prefijo</Text>
            
            {/* Buscador de países */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar país o código..."
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
              />
              {countrySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Países comunes (solo cuando no hay búsqueda activa) */}
            {!countrySearch.trim() && (
              <View style={styles.commonSection}>
                <Text style={styles.commonTitle}>Más usados</Text>
                {commonCountries.map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={styles.countryOption}
                    onPress={() => {
                      setCountryCode(item.dial_code);
                      setShowCountryPicker(false);
                      setCountrySearch('');
                    }}
                  >
                    <Text style={styles.flagText}>{getFlagEmoji(item.code)}</Text>
                    <Text style={styles.countryCode}>{item.dial_code}</Text>
                    <Text style={styles.countryName}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.divider} />
              </View>
            )}

            <ScrollView style={styles.countriesList}>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((item: CountryCode) => (
                  <TouchableOpacity
                    key={item.code}
                    style={styles.countryOption}
                    onPress={() => {
                      setCountryCode(item.dial_code);
                      setShowCountryPicker(false);
                      setCountrySearch('');
                    }}
                  >
                    <Text style={styles.flagText}>{getFlagEmoji(item.code)}</Text>
                    <Text style={styles.countryCode}>{item.dial_code}</Text>
                    <Text style={styles.countryName}>{item.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No se encontraron países</Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setShowCountryPicker(false);
                setCountrySearch('');
              }}
            >
              <Text style={styles.modalCloseBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, gap: Spacing.sm },
  avatarBox: { alignItems: 'center', marginBottom: Spacing.lg },
  avatarIcon: { fontSize: 64 },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
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
    minWidth: 90,
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
  customRelationInput: {
    marginTop: Spacing.sm,
  },
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
  
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  clearIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
  },
  countriesList: {
    maxHeight: '60%',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
  },
  flagText: {
    fontSize: 22,
    marginRight: Spacing.sm,
    width: 32,
    textAlign: 'center',
  },
  countryCode: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    width: 60,
  },
  countryName: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  commonSection: {
    marginBottom: Spacing.xs,
  },
  commonTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.inputBorder,
    marginVertical: Spacing.xs,
  },
  noResults: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  modalCloseBtn: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  modalCloseBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
