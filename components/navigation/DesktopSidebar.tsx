import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { type ColorSet } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { TAB_ITEMS } from './tabConfig';

interface DesktopSidebarProps {
  activeHref: string;
}

export function DesktopSidebar({ activeHref }: DesktopSidebarProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.resolvedColors);

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.sidebar, borderRightColor: colors.sidebarBorder }]}>
      <View style={[styles.header, { borderBottomColor: colors.sidebarBorder }]}>
        <Text style={[styles.appName, { color: colors.sidebarTitle }]}>Anaboli</Text>
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
  colors: ColorSet;
  onPress: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isHighlighted = hovered || focused;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.navItem,
        isActive && { backgroundColor: colors.primary + '14' },
        !isActive && isHighlighted && { backgroundColor: colors.primary + '0A' },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="link"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={isActive ? `${item.title} - current page` : item.title}
    >
      {isHighlighted && <View style={[styles.focusIndicator, { backgroundColor: colors.primary }]} />}
      <item.icon
        size={20}
        color={isActive ? colors.sidebarActiveText : colors.textLight}
      />
      <Text
        style={[
          styles.navLabel,
          { color: isActive ? colors.sidebarActiveText : colors.sidebarText },
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
  },
  appName: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
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
  },
});
