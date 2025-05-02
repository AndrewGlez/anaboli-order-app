import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { OrderStatus, ProductType } from '@/types';
import { useOrderStore } from '@/store/orderStore';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  activeFilters: {
    gym: string;
    product: string;
    status: string;
  };
  setActiveFilters: React.Dispatch<React.SetStateAction<{
    gym: string;
    product: string;
    status: string;
  }>>;
}

export default function FilterSheet({
  visible,
  onClose,
  activeFilters,
  setActiveFilters
}: FilterSheetProps) {
  const { orders } = useOrderStore();

  if (!visible) return null;

  // Get unique gym names
  const gymNames = [...new Set(orders.map(order => order.gymName))];

  // Product types
  const productTypes: { type: ProductType; label: string; }[] = [
    { type: 'A', label: 'Avena' },
    { type: 'GNY', label: 'Galletas' },
    { type: 'C', label: 'Cookies' },
    { type: 'K', label: 'Ketos' },
  ];

  // Status types
  const statusTypes: OrderStatus[] = [
    'Entregado',
    'Entregado + P',
    'Entregado + TRF',

  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filtrar Ordenes</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gym</Text>
            <View style={styles.optionsContainer}>
              {gymNames.map((gym) => (
                <TouchableOpacity
                  key={gym}
                  style={[
                    styles.optionButton,
                    activeFilters.gym === gym && styles.activeOption,
                  ]}
                  onPress={() => setActiveFilters({
                    ...activeFilters,
                    gym: activeFilters.gym === gym ? '' : gym,
                  })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      activeFilters.gym === gym && styles.activeOptionText,
                    ]}
                  >
                    {gym}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipos de productos</Text>
            <View style={styles.optionsContainer}>
              {productTypes.map((product) => (
                <TouchableOpacity
                  key={product.type}
                  style={[
                    styles.optionButton,
                    activeFilters.product === product.type && styles.activeOption,
                  ]}
                  onPress={() => setActiveFilters({
                    ...activeFilters,
                    product: activeFilters.product === product.type ? '' : product.type,
                  })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      activeFilters.product === product.type && styles.activeOptionText,
                    ]}
                  >
                    {product.label} ({product.type})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado</Text>
            <View style={styles.optionsContainer}>
              {statusTypes.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.optionButton,
                    activeFilters.status === status && styles.activeOption,
                  ]}
                  onPress={() => setActiveFilters({
                    ...activeFilters,
                    status: activeFilters.status === status ? '' : status,
                  })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      activeFilters.status === status && styles.activeOptionText,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setActiveFilters({ gym: '', product: '', status: '' })}
          >
            <Text style={styles.resetButtonText}>Reiniciar Filtros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={onClose}
          >
            <Text style={styles.applyButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  content: {
    padding: 16,
    maxHeight: '60%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },
  activeOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  activeOptionText: {
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginRight: 8,
  },
  resetButtonText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
  },
});