import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { Gym } from "@/types";
import { useThemeStore } from "@/store/themeStore";
import { Pencil, Trash2 } from "lucide-react-native";

interface GymListItemProps {
  gym: Gym;
  hasOrders: boolean;
  onEdit: (gym: Gym) => void;
  onDelete: (gym: Gym) => void;
}

export default function GymListItem({
  gym,
  hasOrders,
  onEdit,
  onDelete,
}: GymListItemProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{gym.name}</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: gym.active ? "#22c55e20" : "#ef444420",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: gym.active ? "#22c55e" : "#ef4444" },
            ]}
          >
            {gym.active ? "Activo" : "Inactivo"}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(gym)}
          style={[styles.iconButton, { backgroundColor: colors.background }]}
        >
          <Pencil size={16} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(gym)}
          disabled={hasOrders}
          style={[
            styles.iconButton,
            {
              backgroundColor: hasOrders ? colors.border : "#ef444420",
              opacity: hasOrders ? 0.4 : 1,
            },
          ]}
        >
          <Trash2 size={16} color={hasOrders ? colors.text : "#ef4444"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: FONTS.body1.fontFamily,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FONTS.body3.fontFamily,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
