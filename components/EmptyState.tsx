import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    ...FONTS.body2,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});