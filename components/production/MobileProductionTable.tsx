import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { FONTS, SIZES } from "@/constants/theme";
import { groupFlavorsForMobile } from "./mobileProductionLayout";

interface MobileProductionTableProps {
  quantities: Map<string, number>;
  isReadOnly: boolean;
  onQuantityChange: (flavor: string, product: string, value: string) => void;
  colors: {
    background: string;
    text: string;
    textLight: string;
    border: string;
    white: string;
  };
}

export function MobileProductionTable({
  quantities,
  isReadOnly,
  onQuantityChange,
  colors,
}: MobileProductionTableProps) {
  const rows = groupFlavorsForMobile();

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <Text style={[styles.title, { color: colors.text }]}>Tabla de Producción</Text>
      <Text style={[styles.hint, { color: colors.textLight }]}>
        Toca cada producto para cargar la cantidad producida.
      </Text>

      {rows.map((row) => (
        <View
          key={row.flavor}
          style={[styles.flavorRow, { borderBottomColor: colors.border }]}
        >
          <Text
            style={[styles.flavorName, { color: colors.text }]}
            numberOfLines={1}
          >
            {row.flavor}
          </Text>

          <View style={styles.inputsRow}>
            {row.cells.map((cell) => {
              const value = quantities.get(cell.key) || 0;
              return (
                <View key={cell.key} style={styles.inputCell}>
                  <Text
                    style={[styles.inputLabel, { color: colors.textLight }]}
                    numberOfLines={1}
                  >
                    {cell.label}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                      },
                    ]}
                    keyboardType="number-pad"
                    value={String(value)}
                    onChangeText={(text) =>
                      onQuantityChange(row.flavor, cell.product, text)
                    }
                    editable={!isReadOnly}
                    maxLength={4}
                    accessibilityLabel={`Sabor ${row.flavor}, producto ${cell.label}, cantidad`}
                  />
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  title: {
    ...FONTS.h3,
    marginBottom: 4,
  },
  hint: {
    ...FONTS.body3,
    marginBottom: 12,
  },
  flavorRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  flavorName: {
    ...FONTS.body2,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputsRow: {
    flexDirection: "row",
    gap: 8,
  },
  inputCell: {
    flex: 1,
  },
  inputLabel: {
    ...FONTS.small,
    marginBottom: 4,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: 8,
    textAlign: "center",
    ...FONTS.body2,
    fontWeight: "600",
    minWidth: 0,
  },
});