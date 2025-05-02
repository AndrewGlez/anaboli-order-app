import { useThemeStore } from "@/store/themeStore";

export function useColorScheme() {
  const { theme } = useThemeStore();
  return theme;
}
