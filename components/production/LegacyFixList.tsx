import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AlertTriangle, Pencil } from "lucide-react-native";
import { FONTS, SIZES } from "@/constants/theme";
import { Order } from "@/types";
import {
  isLegacyOrder,
  getLegacyFixLabel,
  getLegacyBadgeLabel,
} from "./legacyFixes";

interface LegacyFixListProps {
  orders: Order[];
  onFix: (orderId: string) => void;
  colors: {
    background: string;
    primary: string;
    text: string;
    textLight: string;
    warning: string;
    white: string;
    border: string;
  };
}

export function LegacyFixList({
  orders,
  onFix,
  colors,
}: LegacyFixListProps) {
  const legacyOrders = orders.filter((order) => isLegacyOrder(order));

  if (legacyOrders.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <AlertTriangle size={20} color={colors.warning} />
        <Text style={[styles.title, { color: colors.text }]}>
          Datos Legacy por Corregir
        </Text>
        <View style={[styles.countBadge, { backgroundColor: colors.warning }]}>
          <Text style={[styles.countText, { color: colors.white }]}>
            {legacyOrders.length}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textLight }]}>
        Los siguientes pedidos tienen sabor faltante o inválido. Corrígelos para incluirlos en la reconciliación.
      </Text>

      <ScrollView style={styles.orderList}>
        {legacyOrders.map((order) => (
          <View
            key={order.id}
            style={[
              styles.orderItem,
              { backgroundColor: colors.white, borderColor: colors.border },
            ]}
          >
            <View style={styles.orderInfo}>
              <Text style={[styles.orderName, { color: colors.text }]}>
                {order.gymName}
              </Text>
              <View style={styles.orderMeta}>
                <Text style={[styles.legacyBadge, { color: colors.warning }]}>
                  {getLegacyBadgeLabel()}
                </Text>
                <Text style={[styles.orderDate, { color: colors.textLight }]}>
                  {new Date(order.createdAt).toLocaleDateString("es-ES")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.fixButton, { backgroundColor: colors.warning + "20" }]}
              onPress={() => onFix(order.id)}
            >
              <Pencil size={16} color={colors.warning} />
              <Text style={[styles.fixButtonText, { color: colors.warning }]}>
                {getLegacyFixLabel()}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  title: {
    ...FONTS.h3,
    flex: 1,
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    ...FONTS.body3,
    fontWeight: "700",
  },
  description: {
    ...FONTS.body3,
    marginBottom: 12,
  },
  orderList: {
    maxHeight: 250,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    ...FONTS.body2,
    fontWeight: "600",
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legacyBadge: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  orderDate: {
    ...FONTS.body3,
  },
  fixButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    gap: 4,
  },
  fixButtonText: {
    ...FONTS.body3,
    fontWeight: "600",
  },
});
