import { usePathname } from "expo-router";
import { Tabs, TabSlot, TabTrigger, TabList } from "expo-router/ui";
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
    if (pathname.includes("/production")) return "/production";
    if (pathname.includes("/analytics")) return "/analytics";
    if (pathname.includes("/inventory")) return "/inventory";
    if (pathname.includes("/settings")) return "/settings";
    return "/";
  };

  // Desktop: sidebar layout. Use the headless Tabs from expo-router/ui so no
  // default bottom tab bar is rendered; DesktopSidebar handles navigation.
  if (breakpoint === "desktop") {
    return (
      <Tabs>
        <View style={styles.desktopContainer}>
          <DesktopSidebar activeHref={getActiveHref()} />
          <View style={styles.content}>
            <TabSlot />
          </View>
        </View>
        <TabList>
          <TabTrigger name="index" href="/" />
          <TabTrigger name="new-order" href="/new-order" />
          <TabTrigger name="production" href="/production" />
          <TabTrigger name="analytics" href="/analytics" />
          <TabTrigger name="inventory" href="/inventory" />
          <TabTrigger name="settings" href="/settings" />
        </TabList>
      </Tabs>
    );
  }

  // Tablet: top navigation. Same headless Tabs as desktop.
  if (breakpoint === "tablet") {
    return (
      <Tabs>
        <View style={styles.tabletContainer}>
          <TabletTopNav activeHref={getActiveHref()} />
          <View style={styles.content}>
            <TabSlot />
          </View>
        </View>
        <TabList>
          <TabTrigger name="index" href="/" />
          <TabTrigger name="new-order" href="/new-order" />
          <TabTrigger name="production" href="/production" />
          <TabTrigger name="analytics" href="/analytics" />
          <TabTrigger name="inventory" href="/inventory" />
          <TabTrigger name="settings" href="/settings" />
        </TabList>
      </Tabs>
    );
  }

  // Phone: bottom tabs. PhoneTabs is the single <Tabs> with the styled bar.
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
  content: {
    flex: 1,
  },
});
