import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface LowStockBadgeProps {
  quantity: number;
  minThreshold: number;
}

export function LowStockBadge({ quantity, minThreshold }: LowStockBadgeProps) {
  return (
    <View
      style={styles.badge}
      accessibilityRole="text"
      accessibilityLabel={`Low stock: ${quantity} of ${minThreshold}`}
    >
      <Text style={styles.text}>
        {quantity} / {minThreshold}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
});
