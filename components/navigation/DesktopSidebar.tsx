import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                isActive && { backgroundColor: colors.primary + '10' },
              ]}
              onPress={() => router.push(item.href as any)}
              accessibilityRole="link"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={isActive ? `${item.title} - current page` : item.title}
            >
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
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
});
