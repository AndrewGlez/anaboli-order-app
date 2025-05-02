import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';
import { OrderStatus } from '@/types';
import StatusBadge from './StatusBadge';

interface StatusSelectorProps {
  value: OrderStatus;
  onChange: (value: OrderStatus) => void;
}

export default function StatusSelector({ value, onChange }: StatusSelectorProps) {
  const statuses: OrderStatus[] = [
    'Entregado',
    'Entregado + P',
    'Entregado + TRF',
  ];

  return (
    <View style={styles.container}>
      {statuses.map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.option,
            value === status && styles.selectedOption,
          ]}
          onPress={() => onChange(status)}
        >
          <StatusBadge status={status} size="small" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
});