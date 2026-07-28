import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, LayoutChangeEvent } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { useDistributionMatrix } from "@/hooks/useDistributionMatrix";
import { DateKey, ProductType } from "@/types";
import { FLAVOR_COLORS, FlavorCode } from "@/constants/productionCatalog";
import DistributionCell from "./DistributionCell";
import DistributionTotals from "./DistributionTotals";

const PRODUCT_TYPES: ProductType[] = ["A", "GNY", "C", "K"];

const TYPE_COLORS: Record<ProductType, string> = {
  A: "#4361ee",
  GNY: "#fb7185",
  C: "#fb923c",
  K: "#a78bfa",
};

interface DistributionMatrixProps {
  selectedDate: DateKey;
  gymHydrated: boolean;
  orderHydrated: boolean;
}

export default function DistributionMatrix({
  selectedDate,
  gymHydrated,
  orderHydrated,
}: DistributionMatrixProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const matrix = useDistributionMatrix(selectedDate);
  const isLoading = !gymHydrated || !orderHydrated;

  const [viewportWidth, setViewportWidth] = useState(0);
  const gymCount = matrix.gyms.length;
  const minimumTableWidth = 120 + gymCount * PRODUCT_TYPES.length * 40 + 50;
  const canExpand = viewportWidth >= minimumTableWidth;
  const cellWidth = canExpand
    ? Math.floor((viewportWidth - 120 - 50) / (gymCount * PRODUCT_TYPES.length))
    : 40;
  const tableWidth = Math.max(viewportWidth, minimumTableWidth);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setViewportWidth(e.nativeEvent.layout.width);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (matrix.gyms.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: colors.textLight }]}>
          No hay gimnasios activos. Agrega uno desde la gestión de gimnasios.
        </Text>
      </View>
    );
  }

  const gymIds = matrix.gyms.map((g) => g.id);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View onLayout={handleLayout}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View
            style={[
              styles.table,
              {
                width: tableWidth,
                backgroundColor: colors.surface,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
          {/* Header row: SABOR + gym headers + TOTAL */}
          <View style={[styles.headerRow, { backgroundColor: colors.primary }]}>
            {/* Flavor column header */}
            <View style={[styles.flavorHeaderCell, { backgroundColor: colors.primary, borderRightWidth: 0 }]}>
              <Text style={[styles.headerText, { color: colors.onPrimary }]}>SABOR</Text>
            </View>
            {/* Gym group headers */}
            {matrix.gyms.map((gym) => (
              <View key={gym.id} style={[styles.gymHeaderGroup, { width: cellWidth * PRODUCT_TYPES.length }]}>
                <Text
                  style={[styles.gymHeaderText, { color: colors.onPrimary }]}
                  numberOfLines={1}
                >
                  {gym.name}
                </Text>
                <View style={styles.subHeaderRow}>
                  {PRODUCT_TYPES.map((pt) => (
                    <View key={pt} style={[styles.subHeaderCell, { width: cellWidth, borderBottomColor: TYPE_COLORS[pt] }]}> 
                      <Text style={[styles.subHeaderText, { color: colors.onPrimary }]}> 
                        {pt}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            {/* Grand total header */}
            <View style={[styles.totalHeaderCell, { borderLeftWidth: 0 }]}>
              <Text style={[styles.headerText, { color: colors.onPrimary }]}>TOTAL</Text>
            </View>
          </View>

          {/* Flavor rows */}
          {matrix.rows.map((row) => (
            <View
              key={row.flavor}
              style={[styles.dataRow, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}
            >
              {/* Flavor cell with color indicator */}
              <View style={[styles.flavorCell, { borderRightColor: colors.border, borderRightWidth: 1 }]}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: FLAVOR_COLORS[row.flavor as FlavorCode] },
                  ]}
                />
                <Text
                  style={[styles.flavorText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {row.flavor}
                </Text>
              </View>

              {/* Gym cells */}
              {gymIds.map((gymId) => (
                <View key={gymId} style={[styles.gymCellGroup, { gap: 2 }]}>
                  {PRODUCT_TYPES.map((pt) => (
                    <DistributionCell
                      key={`${gymId}-${row.flavor}-${pt}`}
                      gymId={gymId}
                      flavor={row.flavor}
                      productType={pt}
                      date={selectedDate}
                      cellWidth={cellWidth}
                    />
                  ))}
                </View>
              ))}

              {/* Row total */}
              <View style={[styles.rowTotalCell, { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                <Text style={[styles.rowTotalText, { color: colors.text }]}>
                  {PRODUCT_TYPES.reduce(
                    (sum, pt) => sum + (row.total[pt] ?? 0),
                    0
                  )}
                </Text>
              </View>
            </View>
          ))}

          {/* Totals row */}
          <DistributionTotals
            gymTotals={matrix.gymTotals}
            grandTotal={matrix.grandTotal}
            gymIds={gymIds}
            cellWidth={cellWidth}
          />
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  table: {
    minWidth: "100%",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.body2.fontFamily,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  flavorHeaderCell: {
    width: 120,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  headerText: {
    fontSize: 13,
    fontFamily: FONTS.h4.fontFamily,
    fontWeight: "700",
  },
  gymHeaderGroup: {
    alignItems: "center",
  },
  gymHeaderText: {
    fontSize: 12,
    fontFamily: FONTS.body3.fontFamily,
    fontWeight: "600",
    paddingHorizontal: 4,
    paddingTop: 4,
    maxWidth: 160,
  },
  subHeaderRow: {
    flexDirection: "row",
    gap: 2,
  },
  subHeaderCell: {
    width: 40,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
  },
  subHeaderText: {
    fontSize: 12,
    fontFamily: FONTS.body3.fontFamily,
  },
  totalHeaderCell: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 40,
  },
  flavorCell: {
    width: 120,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  flavorText: {
    fontSize: 13,
    fontFamily: FONTS.body3.fontFamily,
    flex: 1,
  },
  gymCellGroup: {
    flexDirection: "row",
  },
  rowTotalCell: {
    width: 50,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  rowTotalText: {
    fontSize: 14,
    fontFamily: FONTS.body3.fontFamily,
    fontWeight: "600",
  },
});
