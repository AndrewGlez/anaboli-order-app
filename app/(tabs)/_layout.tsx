import { Tabs, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { PhoneTabs } from "@/components/navigation/PhoneTabs";
import { TabletTopNav } from "@/components/navigation/TabletTopNav";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";

export default function TabLayout() {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const breakpoint = useBreakpoint();
  const pathname = usePathname();

  // Map pathname to active href
  const getActiveHref = () => {
    if (pathname.includes("/new-order")) return "/new-order";
    if (pathname.includes("/analytics")) return "/analytics";
    if (pathname.includes("/settings")) return "/settings";
    return "/";
  };

  // Desktop: sidebar layout
  if (breakpoint === "desktop") {
    return (
      <View style={styles.desktopContainer}>
        <DesktopSidebar activeHref={getActiveHref()} />
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.background },
          }}
        >
          <Tabs.Screen name="index" options={{ title: "Ordenes" }} />
          <Tabs.Screen name="new-order" options={{ title: "Nuevo" }} />
          <Tabs.Screen name="analytics" options={{ title: "Análisis" }} />
          <Tabs.Screen name="settings" options={{ title: "Ajustes" }} />
        </Tabs>
      </View>
    );
  }

  // Tablet: top navigation
  if (breakpoint === "tablet") {
    return (
      <View style={styles.tabletContainer}>
        <TabletTopNav activeHref={getActiveHref()} />
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.background },
          }}
        >
          <Tabs.Screen name="index" options={{ title: "Ordenes" }} />
          <Tabs.Screen name="new-order" options={{ title: "Nuevo" }} />
          <Tabs.Screen name="analytics" options={{ title: "Análisis" }} />
          <Tabs.Screen name="settings" options={{ title: "Ajustes" }} />
        </Tabs>
      </View>
    );
  }

  // Phone: bottom tabs
  return <PhoneTabs />;
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: "row",
  },
  tabletContainer: {
    flex: 1,
  },
});
