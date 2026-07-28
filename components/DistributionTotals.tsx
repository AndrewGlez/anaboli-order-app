import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { CellValues, ProductType } from "@/types";

interface DistributionTotalsProps {
  gymTotals: Record<string, CellValues>;
  grandTotal: number;
  gymIds: string[];
  cellWidth?: number;
}

const PRODUCT_TYPES: ProductType[] = ["A", "GNY", "C", "K"];

export default function DistributionTotals({
  gymTotals,
  grandTotal,
  gymIds,
  cellWidth,
}: DistributionTotalsProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}> 
      <View style={[styles.flavorTotalCell, { borderRightColor: colors.border }]}> 
        <Text style={[styles.totalLabel, { color: colors.textLight }]}>TOTAL</Text>
      </View>
      {/* Gym column totals */}
      {gymIds.map((gymId) => (
        <View key={gymId} style={[styles.gymGroup, cellWidth != null ? { width: cellWidth * PRODUCT_TYPES.length } : undefined]}>
          {PRODUCT_TYPES.map((pt) => (
            <View key={pt} style={[styles.cell, cellWidth != null ? { width: cellWidth } : undefined]}>
              <Text style={[styles.cellText, { color: colors.text }]}>
                {gymTotals[gymId]?.[pt] ?? 0}
              </Text>
            </View>
          ))}
        </View>
      ))}
      {/* Grand total */}
      <View style={styles.grandTotalCell}>
        <Text style={[styles.grandTotalText, { color: colors.text }]}>
          {grandTotal}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  gymGroup: {
    flexDirection: "row",
  },
  flavorTotalCell: {
    width: 120,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRightWidth: 1,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: FONTS.h4.fontFamily,
    fontWeight: "700",
  },
  cell: {
    width: 40,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    fontSize: 14,
    fontFamily: FONTS.body3.fontFamily,
    fontWeight: "600",
  },
  grandTotalCell: {
    width: 50,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  grandTotalText: {
    fontSize: 15,
    fontFamily: FONTS.h4.fontFamily,
    fontWeight: "700",
  },
});
