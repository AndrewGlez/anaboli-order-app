import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { TAB_ITEMS } from './tabConfig';

interface TabletTopNavProps {
  activeHref: string;
}

export function TabletTopNav({ activeHref }: TabletTopNavProps) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {TAB_ITEMS.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <TouchableOpacity
            key={item.name}
            style={[styles.tab, isActive && { borderBottomColor: colors.primary }]}
            onPress={() => router.push(item.href as any)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <item.icon
              size={20}
              color={isActive ? colors.primary : colors.textLight}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.textLight },
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  label: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
});
