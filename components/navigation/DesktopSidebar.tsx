import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { TAB_ITEMS } from './tabConfig';

interface DesktopSidebarProps {
  activeHref: string;
}

export function DesktopSidebar({ activeHref }: DesktopSidebarProps) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.background, borderRightColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.primary }]}>Order App</Text>
      </View>
      <View style={styles.nav}>
        {TAB_ITEMS.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <SidebarItem
              key={item.name}
              item={item}
              isActive={isActive}
              colors={colors}
              onPress={() => router.push(item.href as any)}
            />
          );
        })}
      </View>
    </View>
  );
}

function SidebarItem({ item, isActive, colors, onPress }: {
  item: typeof TAB_ITEMS[number];
  isActive: boolean;
  colors: ReturnType<typeof COLORS.themed>;
  onPress: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.navItem,
        isActive && { backgroundColor: colors.primary + '10' },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="link"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={isActive ? `${item.title} - current page` : item.title}
    >
      {focused && <View style={styles.focusIndicator} />}
      <item.icon
        size={20}
        color={isActive ? colors.primary : colors.textLight}
      />
      <Text
        style={[
          styles.navLabel,
          { color: isActive ? colors.primary : colors.textLight },
          isActive && styles.activeLabel,
        ]}
      >
        {item.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    borderRightWidth: 1,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appName: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
  },
  nav: {
    paddingTop: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  navLabel: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  activeLabel: {
    fontFamily: 'Montserrat_600SemiBold',
  },
  pressed: {
    opacity: 0.7,
  },
  focusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.primary,
  },
});
