import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ChartPie } from "lucide-react-native";
import { FONTS, SIZES } from "@/constants/theme";
import { PRODUCTION_PRODUCT_TYPES } from "@/constants/productionCatalog";
import { DistributionSummary as DistributionSummaryData } from "@/services/productionSelectors";
import {
  formatShare,
  formatAssigned,
  sortEntriesByAssignedDesc,
  getProductCount,
  getShareColor,
} from "./distributionSummary";

interface DistributionSummaryProps {
  summary: DistributionSummaryData;
  colors: {
    background: string;
    primary: string;
    text: string;
    textLight: string;
    white: string;
    border: string;
  };
}

export function DistributionSummary({ summary, colors }: DistributionSummaryProps) {
  const sorted = sortEntriesByAssignedDesc(summary.entries);
  const { totalCustomers, totalAssigned } = summary;

  if (totalCustomers === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.white }]}>
        <View style={styles.header}>
          <ChartPie size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Resumen de Distribución</Text>
        </View>
        <Text style={[styles.emptyText, { color: colors.textLight }]}>
          No hay pedidos para esta fecha
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={styles.header}>
        <ChartPie size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Resumen de Distribución</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.countText, { color: colors.white }]}>
            {totalCustomers}
          </Text>
        </View>
      </View>

      <View style={[styles.totalsRow, { borderBottomColor: colors.border }]}>
        <View style={styles.totalCell}>
          <Text style={[styles.totalLabel, { color: colors.textLight }]}>Clientes</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            {formatAssigned(totalCustomers)}
          </Text>
        </View>
        <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />
        <View style={styles.totalCell}>
          <Text style={[styles.totalLabel, { color: colors.textLight }]}>Total Asignado</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {formatAssigned(totalAssigned)}
          </Text>
        </View>
      </View>

      <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerCell, styles.customerColumn, { color: colors.textLight }]}>
          Cliente
        </Text>
        <Text style={[styles.headerCell, styles.flavorColumn, { color: colors.textLight }]}>
          Sabor
        </Text>
        <Text style={[styles.headerCell, styles.assignedColumn, { color: colors.textLight }]}>
          Asignado
        </Text>
        <Text style={[styles.headerCell, styles.shareColumn, { color: colors.textLight }]}>
          %
        </Text>
      </View>

      <ScrollView style={styles.entryList}>
        {sorted.map((entry, idx) => (
          <View
            key={`${entry.customer}-${idx}`}
            style={[styles.entryRow, { borderBottomColor: colors.border }]}
          >
            <Text
              style={[styles.customerColumn, styles.entryText, { color: colors.text }]}
              numberOfLines={1}
            >
              {entry.customer}
            </Text>
            <Text
              style={[styles.flavorColumn, styles.entrySubText, { color: colors.textLight }]}
              numberOfLines={1}
            >
              {entry.flavor}
            </Text>
            <Text style={[styles.assignedColumn, styles.entryText, { color: colors.text }]}>
              {formatAssigned(entry.assignedTotal)}
            </Text>
            <View style={styles.shareColumn}>
              <View
                style={[
                  styles.shareBar,
                  {
                    backgroundColor: colors.primary + "20",
                    borderColor: colors.primary,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shareBarFill,
                    {
                      backgroundColor: getShareColor(entry.share, colors.primary, colors.primary),
                      width: `${Math.min(100, Math.max(0, entry.share))}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.shareText,
                  {
                    color: getShareColor(entry.share, colors.primary, colors.textLight),
                  },
                ]}
              >
                {formatShare(entry.share)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footerSummary, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerLabel, { color: colors.textLight }]}>
          Productos por cliente (promedio)
        </Text>
        <Text style={[styles.footerValue, { color: colors.text }]}>
          {totalCustomers > 0
            ? (totalAssigned / totalCustomers).toFixed(1)
            : "0"}
        </Text>
      </View>

      <View style={styles.productLegend}>
        {PRODUCTION_PRODUCT_TYPES.map((product) => {
          const productTotal = sorted.reduce(
            (sum, e) => sum + getProductCount(e, product),
            0
          );
          return (
            <View key={product} style={styles.legendItem}>
              <Text style={[styles.legendLabel, { color: colors.textLight }]}>
                {product}
              </Text>
              <Text style={[styles.legendValue, { color: colors.text }]}>
                {formatAssigned(productTotal)}
              </Text>
            </View>
          );
        })}
      </View>
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
    marginBottom: 12,
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
  emptyText: {
    ...FONTS.body2,
    textAlign: "center",
    paddingVertical: 24,
  },
  totalsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  totalCell: {
    flex: 1,
    alignItems: "center",
  justifyContent: "center",
  paddingVertical: 4,
  gap: 4,
  },
  totalDivider: {
    width: 1,
    alignSelf: "stretch",
  },
  totalLabel: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  totalValue: {
    ...FONTS.h2,
    fontWeight: "700",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerCell: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  customerColumn: {
    flex: 3,
  },
  flavorColumn: {
    flex: 2,
  },
  assignedColumn: {
    flex: 1,
    textAlign: "right",
  },
  shareColumn: {
    flex: 2,
    alignItems: "flex-end",
  },
  entryList: {
    maxHeight: 220,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  entryText: {
    ...FONTS.body2,
    fontWeight: "600",
  },
  entrySubText: {
    ...FONTS.body3,
  },
  shareBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 2,
  },
  shareBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  shareText: {
    ...FONTS.body3,
    fontWeight: "600",
    marginTop: 2,
  },
  footerSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1,
  },
  footerLabel: {
    ...FONTS.body3,
  },
  footerValue: {
    ...FONTS.body2,
    fontWeight: "700",
  },
  productLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
  },
  legendLabel: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  legendValue: {
    ...FONTS.body3,
    fontWeight: "700",
  },
});