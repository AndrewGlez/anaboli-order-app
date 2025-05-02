import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Clipboard, BarChart4, Settings, PlusCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

export default function TabLayout() {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.background, borderColor: colors.border }],
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ordenes',
          tabBarIcon: ({ color, size }) => (
            <Clipboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-order"
        options={{
          title: 'Nuevo',
          tabBarIcon: ({ color, size }) => (
            <PlusCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Análisis',
          tabBarIcon: ({ color, size }) => (
            <BarChart4 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
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
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
});