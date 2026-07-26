import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { TAB_ITEMS } from './tabConfig';

export function PhoneTabs() {
  const colors = useThemeStore((state) => state.resolvedColors);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.sidebarText,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: colors.sidebar, borderColor: colors.sidebarBorder },
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
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
  },
});
