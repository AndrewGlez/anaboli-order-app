import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { ProductType } from '@/types';
import { useThemeStore } from '@/store/themeStore';

interface ProductSelectorProps {
  value: ProductType;
  onChange: (value: ProductType) => void;
}

export default function ProductSelector({ value, onChange }: ProductSelectorProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  const products: { type: ProductType; label: string; color: string }[] = [
    { type: 'A', label: 'Avena', color: COLORS.productA },
    { type: 'GNY', label: 'Galletas', color: COLORS.productGNY },
    { type: 'C', label: 'Cookies', color: COLORS.productC },
    { type: 'K', label: 'Ketos', color: COLORS.productK },
  ];

  return (
    <View style={styles.container}>
      {products.map((product) => (
        <TouchableOpacity
          key={product.type}
          style={[
            styles.option,
            value === product.type && { backgroundColor: product.color + '15', borderColor: product.color },
          ]}
          onPress={() => onChange(product.type)}
        >
          <Text
            style={[
              [styles.optionText, { color: colors.textLight }],
              value === product.type && { color: product.color, fontWeight: '600' },
            ]}
          >
            {product.type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  option: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  optionText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
});