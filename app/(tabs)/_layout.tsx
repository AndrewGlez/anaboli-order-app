import { usePathname } from "expo-router";
import { Tabs, TabSlot, TabTrigger, TabList } from "expo-router/ui";
import { StyleSheet, View } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { PhoneTabs } from "@/components/navigation/PhoneTabs";
import { TabletTopNav } from "@/components/navigation/TabletTopNav";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";

export default function TabLayout() {
  const colors = useThemeStore((state) => state.resolvedColors);
  const breakpoint = useBreakpoint();
  const pathname = usePathname();

  // Map pathname to active href
  const getActiveHref = () => {
    if (pathname.includes("/production")) return "/production";
    if (pathname.includes("/inventory")) return "/inventory";
    if (pathname.includes("/settings")) return "/settings";
    return "/production";
  };

  // Desktop: sidebar layout. Use the headless Tabs from expo-router/ui so no
  // default bottom tab bar is rendered; DesktopSidebar handles navigation.
  if (breakpoint === "desktop") {
    return (
      <Tabs asChild>
        <View style={styles.tabs}>
          <View style={styles.desktopContainer}>
            <DesktopSidebar activeHref={getActiveHref()} />
            <View style={styles.content}>
              <TabSlot />
            </View>
          </View>
          <TabList>
            <TabTrigger name="inventory" href="/inventory" />
            <TabTrigger name="production" href="/production" />
            <TabTrigger name="settings" href="/settings" />
          </TabList>
        </View>
      </Tabs>
    );
  }

  // Tablet: top navigation. Same headless Tabs as desktop.
  if (breakpoint === "tablet") {
    return (
      <Tabs asChild>
        <View style={styles.tabs}>
          <View style={styles.tabletContainer}>
            <TabletTopNav activeHref={getActiveHref()} />
            <View style={styles.content}>
              <TabSlot />
            </View>
          </View>
          <TabList>
            <TabTrigger name="inventory" href="/inventory" />
            <TabTrigger name="production" href="/production" />
            <TabTrigger name="settings" href="/settings" />
          </TabList>
        </View>
      </Tabs>
    );
  }

  // Phone: bottom tabs. PhoneTabs is the single <Tabs> with the styled bar.
  return <PhoneTabs />;
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
    minHeight: 0,
  },
  desktopContainer: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
  },
  tabletContainer: {
    flex: 1,
    minHeight: 0,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
