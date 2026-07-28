import React from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { useDistributionMatrix } from "@/hooks/useDistributionMatrix";
import { DateKey, ProductType } from "@/types";
import { FLAVOR_CODES, FLAVOR_COLORS, FlavorCode } from "@/constants/productionCatalog";
import DistributionCell from "./DistributionCell";
import DistributionTotals from "./DistributionTotals";

const PRODUCT_TYPES: ProductType[] = ["A", "GNY", "C", "K"];

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
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header row: SABOR + gym headers + TOTAL */}
          <View style={[styles.headerRow, { backgroundColor: colors.primary }]}>
            {/* Flavor column header */}
            <View style={[styles.flavorHeaderCell, { backgroundColor: colors.primary }]}>
              <Text style={[styles.headerText, { color: colors.onPrimary }]}>SABOR</Text>
            </View>
            {/* Gym group headers */}
            {matrix.gyms.map((gym) => (
              <View key={gym.id} style={styles.gymHeaderGroup}>
                <Text
                  style={[styles.gymHeaderText, { color: colors.onPrimary }]}
                  numberOfLines={1}
                >
                  {gym.name}
                </Text>
                <View style={styles.subHeaderRow}>
                  {PRODUCT_TYPES.map((pt) => (
                    <View key={pt} style={styles.subHeaderCell}>
                      <Text style={[styles.subHeaderText, { color: colors.onPrimary }]}>
                        {pt}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            {/* Grand total header */}
            <View style={styles.totalHeaderCell}>
              <Text style={[styles.headerText, { color: colors.onPrimary }]}>TOTAL</Text>
            </View>
          </View>

          {/* Flavor rows */}
          {matrix.rows.map((row) => (
            <View
              key={row.flavor}
              style={[styles.dataRow, { borderBottomColor: colors.border }]}
            >
              {/* Flavor cell with color indicator */}
              <View style={[styles.flavorCell, { borderRightColor: colors.border }]}>
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
                <View key={gymId} style={styles.gymCellGroup}>
                  {PRODUCT_TYPES.map((pt) => (
                    <DistributionCell
                      key={`${gymId}-${row.flavor}-${pt}`}
                      gymId={gymId}
                      flavor={row.flavor}
                      productType={pt}
                      date={selectedDate}
                    />
                  ))}
                </View>
              ))}

              {/* Row total */}
              <View style={styles.rowTotalCell}>
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
          />
        </View>
      </ScrollView>
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
    width: 100,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "rgba(255,255,255,0.3)",
  },
  headerText: {
    fontSize: 12,
    fontFamily: FONTS.h4.fontFamily,
    fontWeight: "700",
  },
  gymHeaderGroup: {
    alignItems: "center",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "rgba(255,255,255,0.3)",
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
  },
  subHeaderCell: {
    width: 40,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  subHeaderText: {
    fontSize: 11,
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
  },
  flavorCell: {
    width: 100,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 4,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flavorText: {
    fontSize: 11,
    fontFamily: FONTS.body3.fontFamily,
    flex: 1,
  },
  gymCellGroup: {
    flexDirection: "row",
  },
  rowTotalCell: {
    width: 50,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  rowTotalText: {
    fontSize: 12,
    fontFamily: FONTS.body3.fontFamily,
    fontWeight: "600",
  },
});
