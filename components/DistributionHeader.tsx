import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { DateKey } from "@/types";
import { useThemeStore } from "@/store/themeStore";
import { Users, ChevronLeft, ChevronRight } from "lucide-react-native";

interface DistributionHeaderProps {
  selectedDate: DateKey;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onGymManagement: () => void;
}

export default function DistributionHeader({
  selectedDate,
  onPreviousDay,
  onNextDay,
  onGymManagement,
}: DistributionHeaderProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  // Format date for display
  const [year, month, day] = selectedDate.split("-");
  const formattedDate = `${day}/${month}/${year}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onPreviousDay} style={styles.navButton}>
          <ChevronLeft size={20} color={colors.onPrimary} />
        </TouchableOpacity>

        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: colors.onPrimary }]}>
            {formattedDate}
          </Text>
        </View>

        <TouchableOpacity onPress={onNextDay} style={styles.navButton}>
          <ChevronRight size={20} color={colors.onPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onGymManagement}
          style={styles.gymButton}
        >
          <Users size={18} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { color: colors.onPrimary }]}>
        DISTRIBUCIÓN POR CLIENTES
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  navButton: {
    padding: 6,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontFamily: FONTS.h4.fontFamily,
  },
  gymButton: {
    padding: 6,
    marginLeft: 8,
  },
  title: {
    fontSize: 13,
    fontFamily: FONTS.body3.fontFamily,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
