import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Sun, Moon, Monitor } from "lucide-react-native";
import { FONTS, SIZES, type ColorSet } from "@/constants/theme";
import { type ThemeMode } from "@/store/themeStore";

interface ThemeModeOption {
  mode: ThemeMode;
  label: string;
  Icon: typeof Sun;
}

const OPTIONS: ThemeModeOption[] = [
  { mode: "light", label: "Claro", Icon: Sun },
  { mode: "dark", label: "Oscuro", Icon: Moon },
  { mode: "system", label: "Sistema", Icon: Monitor },
];

interface ThemeModeSelectorProps {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  colors: ColorSet;
}

export function ThemeModeSelector({ mode, onModeChange, colors }: ThemeModeSelectorProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(({ mode: optionMode, label, Icon }) => {
        const active = mode === optionMode;
        return (
          <TouchableOpacity
            key={optionMode}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            onPress={() => onModeChange(optionMode)}
            style={[
              styles.option,
              {
                backgroundColor: active ? colors.primary : colors.background,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Icon size={18} color={active ? colors.onPrimary : colors.text} />
            <Text
              style={[
                styles.label,
                { color: active ? colors.onPrimary : colors.text },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
  },
  label: {
    ...FONTS.body3,
    fontWeight: "600",
  },
});
