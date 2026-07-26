import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FONTS, SIZES } from "@/constants/theme";
import { buildReconciliationState, statusAccentColor } from "./reconciliationPanel";

export interface ReconciliationPanelProps {
  totalProduced: number;
  totalAssigned: number;
  colors: {
    background: string;
    text: string;
    textLight: string;
    white: string;
    border: string;
    success: string;
    error: string;
  };
}

export function ReconciliationPanel({ totalProduced, totalAssigned, colors }: ReconciliationPanelProps) {
  const state = buildReconciliationState(totalProduced, totalAssigned);
  const accent = statusAccentColor(state.balanced, colors.success, colors.error);
  const isBalanced = state.balanced;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.white,
          borderColor: accent,
        },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={state.accessibilityLabel}
      accessibilityLiveRegion={isBalanced ? "polite" : "assertive"}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[styles.statusLabel, { color: accent }]} numberOfLines={1}>
            {state.message}
          </Text>
        </View>

        <View style={[styles.metricsRow, { borderTopColor: colors.border }]}>
          <View style={styles.metricCell}>
            <Text style={[styles.metricLabel, { color: colors.textLight }]} numberOfLines={1}>
              Producido
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {state.totalProduced}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metricCell}>
            <Text style={[styles.metricLabel, { color: colors.textLight }]} numberOfLines={1}>
              Asignado
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {state.totalAssigned}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metricCell}>
            <Text style={[styles.metricLabel, { color: colors.textLight }]} numberOfLines={1}>
              Diferencia
            </Text>
            <Text style={[styles.metricValue, { color: accent }]}>
              {state.delta > 0 ? `+${state.delta}` : state.delta}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: SIZES.radius,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    marginBottom: 12,
  },
  statusLabel: {
    ...FONTS.h3,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metricCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 4,
  },
  metricDivider: {
    width: 1,
    alignSelf: "stretch",
  },
  metricLabel: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  metricValue: {
    ...FONTS.h2,
    fontWeight: "700",
  },
});