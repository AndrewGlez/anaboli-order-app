import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { CellValues, ProductType } from "@/types";

interface DistributionTotalsProps {
  gymTotals: Record<string, CellValues>;
  grandTotal: number;
  gymIds: string[];
}

const PRODUCT_TYPES: ProductType[] = ["A", "GNY", "C", "K"];

export default function DistributionTotals({
  gymTotals,
  grandTotal,
  gymIds,
}: DistributionTotalsProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Gym column totals */}
      {gymIds.map((gymId) => (
        <View key={gymId} style={styles.gymGroup}>
          {PRODUCT_TYPES.map((pt) => (
            <View key={pt} style={styles.cell}>
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
    paddingVertical: 4,
  },
  gymGroup: {
    flexDirection: "row",
  },
  cell: {
    width: 40,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    fontSize: 12,
    fontFamily: FONTS.body3.fontFamily,
    fontWeight: "600",
  },
  grandTotalCell: {
    width: 50,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  grandTotalText: {
    fontSize: 13,
    fontFamily: FONTS.h4.fontFamily,
    fontWeight: "700",
  },
});
