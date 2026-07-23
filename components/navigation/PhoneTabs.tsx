import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { TAB_ITEMS } from './tabConfig';

export function PhoneTabs() {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: colors.background, borderColor: colors.border },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            tabBarIcon: ({ color, size }) => (
              <item.icon size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
  },
});
