import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { useOrderStore } from '@/store/orderStore';
import { ProductType, OrderStatus } from '@/types';
import ProductSelector from '@/components/ProductSelector';
import StatusSelector from '@/components/StatusSelector';
import { useThemeStore } from '@/store/themeStore';

export default function NewOrderScreen() {
  const router = useRouter();
  const { addOrder } = useOrderStore();
  const { theme } = useThemeStore();

  const colors = COLORS.themed(theme);

  const [gymName, setGymName] = useState('');
  const [products, setProducts] = useState<Array<{ type: ProductType, quantity: number }>>([]);
  const [status, setStatus] = useState<OrderStatus>('Entregado');
  const [notes, setNotes] = useState('');

  const handleAddProduct = () => {
    setProducts([...products, { type: 'A', quantity: 1 }]);
  };

  const handleUpdateProduct = (index: number, type: ProductType, quantity: number) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { type, quantity };
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const handleSubmit = () => {
    if (!gymName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del gimnasio');
      return;
    }

    if (products.length === 0) {
      Alert.alert('Error', 'Por favor agrega al menos un producto');
      return;
    }

    const newOrder = {
      id: Date.now().toString(),
      gymName,
      products,
      status,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    Alert.alert('Éxito', 'Orden creada con éxito');

    // Reset form
    setGymName('');
    setProducts([]);
    setStatus('Entregado');
    setNotes('');

    // Navigate back to orders
    router.push('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Crear nueva orden</Text>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
            value={gymName}
            onChangeText={setGymName}
            placeholder="Ingresa el nombre del gym"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Productos</Text>
          {products.map((product, index) => (
            <View key={index} style={[styles.productRow, { borderColor: colors.primary }]}>
              <ProductSelector
                value={product.type}
                onChange={(type) => handleUpdateProduct(index, type, product.quantity)}
              />
              <TextInput
                style={[styles.quantityInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
                value={product.quantity.toString()}
                onChangeText={(text) => {
                  const quantity = parseInt(text) || 0;
                  handleUpdateProduct(index, product.type, quantity);
                }}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveProduct(index)}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddProduct}>
            <PlusCircle size={20} color={colors.white} />
            <Text style={[styles.addButtonText, { color: colors.white }]}>Agregar Productos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Estado</Text>
          <StatusSelector value={status} onChange={setStatus} />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Notas</Text>
          <TextInput
            style={[styles.input, styles.notesInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Agrega notas adicionales"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
          <Text style={[styles.submitButtonText, { color: colors.white }]}>Crear Orden</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    ...FONTS.h2,
  },
  form: {
    flex: 1,
    padding: SIZES.padding,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.h3,
    marginBottom: 8,
  },
  input: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 12,
    ...FONTS.body2,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityInput: {
    width: 60,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 10,
    ...FONTS.body2,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    padding: 12,
    justifyContent: 'center',
    marginTop: 10,
  },
  addButtonText: {
    ...FONTS.body2,
    marginLeft: 8,
  },
  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
  },
  submitButton: {
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    ...FONTS.h3,
  },
});