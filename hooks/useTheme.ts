import { useThemeStore, type ThemeMode, type ThemeState } from "@/store/themeStore";
import { type ColorSet, type ResolvedTheme } from "@/constants/theme";

export interface UseThemeResult {
  mode: ThemeMode;
  theme: ResolvedTheme;
  resolvedColors: ColorSet;
  setMode: ThemeState["setMode"];
  toggleTheme: ThemeState["toggleTheme"];
  setSystemTheme: ThemeState["setSystemTheme"];
}

/**
 * Convenience selector over `useThemeStore` for components that want the
 * resolved colors plus the toggle/mode setters in one call.
 *
 * Prefer this hook in new code. Existing consumers that destructure
 * `{ theme }` from `useThemeStore` keep working unchanged.
 */
export function useTheme(): UseThemeResult {
  return useThemeStore();
}