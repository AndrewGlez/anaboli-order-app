import React, { useState, useCallback } from "react";
import { TextInput, StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { useCellEdit } from "@/hooks/useCellEdit";
import { DateKey, FlavorCode, ProductType } from "@/types";

interface DistributionCellProps {
  gymId: string;
  flavor: FlavorCode;
  productType: ProductType;
  date: DateKey;
}

function DistributionCellInner({
  gymId,
  flavor,
  productType,
  date,
}: DistributionCellProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const { value, isSaving, warning, error, commit, rollback } = useCellEdit(
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
            : colors.border,
          backgroundColor: hasWarning ? "#f59e0b10" : colors.surface,
        },
      ]}
    >
      {isSaving ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
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
    width: 40,
    height: 32,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: "100%",
    fontSize: 13,
    fontFamily: FONTS.body3.fontFamily,
    padding: 0,
    margin: 0,
  },
});

export default React.memo(DistributionCellInner);
