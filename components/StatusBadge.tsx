import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, FONTS } from '@/constants/theme';
import { OrderStatus } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'normal';
}

export default function StatusBadge({ status, size = 'normal' }: StatusBadgeProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStatusColor = () => {
    switch (status) {
      case 'Entregado':
        return COLORS.statusVisto;
      case 'Entregado + P':
        return COLORS.statusVistoP;
      case 'Entregado + TRF':
        return COLORS.statusVistoTRF;
      default:
        return COLORS.primary;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'Entregado':
        return 'Entregado';
      case 'Entregado + P':
        return 'Entregado + P';
      case 'Entregado + TRF':
        return 'Entregado + TRF';
      default:
        return status;
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      style={[
        styles.container,
        { backgroundColor: getStatusColor() + '15' },
        size === 'small' && styles.smallContainer,
        animatedStyle
      ]}
    >
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={[
        styles.text,
        { color: getStatusColor() },
        size === 'small' && styles.smallText
      ]}>
        {getStatusLabel()}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  smallContainer: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    ...FONTS.body3,
    fontWeight: '500',
  },
  smallText: {
    fontSize: 10,
  },
});