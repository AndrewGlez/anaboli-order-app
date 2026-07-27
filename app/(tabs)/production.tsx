import React, { useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { useGymStore } from "@/store/gymStore";
import { DateKey } from "@/types";
import { normalizeDate } from "@/services/distribution";
import DistributionHeader from "@/components/DistributionHeader";
import DistributionMatrix from "@/components/DistributionMatrix";

export default function ProductionScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const gymHydrated = useGymStore((s) => s.hydrated);

  const [selectedDate, setSelectedDate] = useState<DateKey>(
    normalizeDate(new Date())
  );

  const handlePreviousDay = useCallback(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const prev = new Date(y, m - 1, d - 1);
    setSelectedDate(normalizeDate(prev));
  }, [selectedDate]);

  const handleNextDay = useCallback(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    setSelectedDate(normalizeDate(next));
  }, [selectedDate]);

  const handleGymManagement = useCallback(() => {
    router.push("/gyms");
  }, [router]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <DistributionHeader
        selectedDate={selectedDate}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onGymManagement={handleGymManagement}
      />
      <DistributionMatrix
        selectedDate={selectedDate}
        gymHydrated={gymHydrated}
        orderHydrated={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
