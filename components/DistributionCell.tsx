import React, { useState, useCallback } from "react";
import { TextInput, StyleSheet, View, ActivityIndicator } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { useCellEdit } from "@/hooks/useCellEdit";
import { DateKey, FlavorCode, ProductType } from "@/types";

interface DistributionCellProps {
  gymId: string;
  flavor: FlavorCode;
  productType: ProductType;
  date: DateKey;
  cellWidth?: number;
}

function DistributionCellInner({
  gymId,
  flavor,
  productType,
  date,
  cellWidth,
}: DistributionCellProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const { value, isSaving, warning, error, commit } = useCellEdit(
    gymId,
    flavor,
    productType,
    date
  );

  const [text, setText] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (text.trim() === "" || parseInt(text, 10) === value) {
      setText(value.toString());
      return;
    }
    commit(text).then((result) => {
      if (!result.ok) {
        setText(value.toString());
      }
    });
  }, [text, value, commit]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const hasWarning = !!warning;
  const hasError = !!error;

  return (
    <View
      style={[
        styles.cell,
        {
          borderColor: hasWarning
            ? "#f59e0b"
            : hasError
            ? "#ef4444"
            : isFocused
            ? colors.primary
            : colors.border,
          backgroundColor: hasWarning ? "#f59e0b18" : colors.background,
          borderRadius: 6,
          borderWidth: isFocused ? 2 : 1,
          ...(cellWidth != null ? { width: cellWidth - 4 } : { width: 36 }),
        },
      ]}
    >
      {isSaving ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <TextInput
          style={[
            styles.input,
            ({
              color: colors.text,
              outlineStyle: "none",
              outlineWidth: 0,
            } as any),
          ]}
          value={text}
          onChangeText={setText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={4}
          textAlign="center"
          selectTextOnFocus
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    height: 36,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  input: {
    width: "100%",
    height: "100%",
    fontSize: 15,
    fontFamily: FONTS.body3.fontFamily,
    padding: 0,
    margin: 0,
  },
});

export default React.memo(DistributionCellInner);
