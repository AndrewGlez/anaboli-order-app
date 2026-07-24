import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StockItem } from "@/types";
import { LowStockBadge } from "./InventoryLowStockBadge";

interface InventoryListItemProps {
  item: StockItem;
}

export function InventoryListItem({ item }: InventoryListItemProps) {
  const isLowStock = item.quantity <= item.minThreshold;

  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{item.type}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        <Text style={styles.price}>${item.price}</Text>
        {isLowStock && (
          <LowStockBadge
            quantity={item.quantity}
            minThreshold={item.minThreshold}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  type: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantity: {
    fontSize: 14,
    color: "#374151",
  },
  price: {
    fontSize: 14,
    color: "#374151",
  },
});
