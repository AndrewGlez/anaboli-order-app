import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, type ColorSet, type ResolvedTheme } from "@/constants/theme";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeState {
  // User-selected preference: explicit light/dark, or follow the OS.
  mode: ThemeMode;
  // System preference supplied by the host (RN useColorScheme / Appearance).
  // Defaults to "light" until the host reports otherwise. Kept in state so
  // the resolved values recompute reactively when the OS theme changes.
  systemTheme: ResolvedTheme;
  // Resolved effective theme: `mode` overrides `systemTheme` unless `system`.
  theme: ResolvedTheme;
  // Resolved active color set, derived from `theme`.
  resolvedColors: ColorSet;
  // Set the user preference explicitly.
  setMode: (mode: ThemeMode) => void;
  // Override the OS-reported preference (called from the root layout).
  setSystemTheme: (system: ResolvedTheme) => void;
  // Resolve `mode` + `systemTheme` → effective theme + colors.
  resolveTheme: (mode: ThemeMode, system: ResolvedTheme) => {
    theme: ResolvedTheme;
    resolvedColors: ColorSet;
  };
  // Quick toggle between light and dark. `system` collapses to dark.
  toggleTheme: () => void;
  // Back-compat: explicit set of the resolved theme. Maps to a `mode`.
  setTheme: (theme: ResolvedTheme) => void;
}

const STORAGE_KEY = "theme-storage";

function resolve(mode: ThemeMode, system: ResolvedTheme): { theme: ResolvedTheme; resolvedColors: ColorSet } {
  const theme: ResolvedTheme = mode === "system" ? system : mode;
  return { theme, resolvedColors: COLORS.themed(theme) };
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      systemTheme: "light",
      ...resolve("system", "light"),

      setMode: (mode) => {
        const next = resolve(mode, get().systemTheme);
        set({ mode, ...next });
      },

      setSystemTheme: (system) => {
        const cur = get();
        if (cur.systemTheme === system) return;
        const next = resolve(cur.mode, system);
        set({ systemTheme: system, ...next });
      },

      resolveTheme: (mode, system) => resolve(mode, system),

      toggleTheme: () => {
        const cur = get();
        const nextMode: ThemeMode = cur.theme === "light" ? "dark" : "light";
        set({ mode: nextMode, ...resolve(nextMode, cur.systemTheme) });
      },

      setTheme: (theme) => {
        set({ mode: theme, ...resolve(theme, get().systemTheme) });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only the user preference; derived fields are recomputed on
      // rehydration and whenever the OS preference changes.
      partialize: (state) => ({ mode: state.mode }),
      merge: (persisted, current) => {
        const base = current as ThemeState;
        const partial = (persisted ?? {}) as Partial<ThemeState>;
        const mode: ThemeMode = partial.mode ?? base.mode;
        const system = base.systemTheme;
        return { ...base, mode, systemTheme: system, ...resolve(mode, system) };
      },
    }
  )
);