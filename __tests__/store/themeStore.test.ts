import { useThemeStore, type ThemeMode } from "@/store/themeStore";
import { COLORS, LIGHT_COLORS, DARK_COLORS } from "@/constants/theme";

// Mock AsyncStorage (also mocked globally in jest.setup.js, redeclared here
// to keep this test file self-describing).
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

function resetStore(mode: ThemeMode = "system", systemTheme: "light" | "dark" = "light") {
  useThemeStore.setState({
    mode,
    systemTheme,
    theme: mode === "system" ? systemTheme : mode,
    resolvedColors: COLORS.themed(mode === "system" ? systemTheme : mode),
  });
}

function getPersistOptions() {
  const persistApi = (useThemeStore as any).persist;
  return persistApi?.getOptions?.() ?? {};
}

beforeEach(() => {
  resetStore("system", "light");
});

describe("themeStore", () => {
  describe("defaults", () => {
    it("initializes with mode 'system' and resolves to light when system is light", () => {
      const s = useThemeStore.getState();
      expect(s.mode).toBe("system");
      expect(s.theme).toBe("light");
      expect(s.resolvedColors).toEqual(LIGHT_COLORS);
    });

    it("exposes setMode, setSystemTheme, toggleTheme, setTheme, resolveTheme", () => {
      const s = useThemeStore.getState();
      expect(typeof s.setMode).toBe("function");
      expect(typeof s.setSystemTheme).toBe("function");
      expect(typeof s.toggleTheme).toBe("function");
      expect(typeof s.setTheme).toBe("function");
      expect(typeof s.resolveTheme).toBe("function");
    });
  });

  describe("setMode", () => {
    it("explicit light overrides system dark", () => {
      resetStore("system", "dark");
      useThemeStore.getState().setMode("light");
      const s = useThemeStore.getState();
      expect(s.mode).toBe("light");
      expect(s.theme).toBe("light");
      expect(s.resolvedColors).toEqual(LIGHT_COLORS);
    });

    it("explicit dark overrides system light", () => {
      resetStore("system", "light");
      useThemeStore.getState().setMode("dark");
      const s = useThemeStore.getState();
      expect(s.mode).toBe("dark");
      expect(s.theme).toBe("dark");
      expect(s.resolvedColors).toEqual(DARK_COLORS);
    });

    it("system mode follows systemTheme", () => {
      resetStore("light", "dark");
      useThemeStore.getState().setMode("system");
      const s = useThemeStore.getState();
      expect(s.mode).toBe("system");
      expect(s.theme).toBe("dark");
      expect(s.resolvedColors).toEqual(DARK_COLORS);
    });
  });

  describe("setSystemTheme", () => {
    it("updates resolved theme when mode is system", () => {
      resetStore("system", "light");
      useThemeStore.getState().setSystemTheme("dark");
      const s = useThemeStore.getState();
      expect(s.systemTheme).toBe("dark");
      expect(s.theme).toBe("dark");
      expect(s.resolvedColors).toEqual(DARK_COLORS);
    });

    it("does not change resolved theme when mode is explicit", () => {
      resetStore("light", "light");
      useThemeStore.getState().setSystemTheme("dark");
      const s = useThemeStore.getState();
      expect(s.systemTheme).toBe("dark");
      expect(s.mode).toBe("light");
      expect(s.theme).toBe("light");
      expect(s.resolvedColors).toEqual(LIGHT_COLORS);
    });

    it("is a no-op when the new value equals the current one", () => {
      resetStore("system", "light");
      const before = useThemeStore.getState();
      useThemeStore.getState().setSystemTheme("light");
      expect(useThemeStore.getState()).toBe(before);
    });
  });

  describe("toggleTheme", () => {
    it("flips light → dark", () => {
      resetStore("light", "light");
      useThemeStore.getState().toggleTheme();
      const s = useThemeStore.getState();
      expect(s.mode).toBe("dark");
      expect(s.theme).toBe("dark");
    });

    it("flips dark → light", () => {
      resetStore("dark", "light");
      useThemeStore.getState().toggleTheme();
      const s = useThemeStore.getState();
      expect(s.mode).toBe("light");
      expect(s.theme).toBe("light");
    });

    it("system mode collapses to dark on first toggle", () => {
      resetStore("system", "light");
      useThemeStore.getState().toggleTheme();
      const s = useThemeStore.getState();
      // theme was light → toggle goes to dark, mode becomes explicit dark.
      expect(s.mode).toBe("dark");
      expect(s.theme).toBe("dark");
    });
  });

  describe("setTheme (back-compat)", () => {
    it("sets mode and resolved theme to light", () => {
      resetStore("dark", "dark");
      useThemeStore.getState().setTheme("light");
      const s = useThemeStore.getState();
      expect(s.mode).toBe("light");
      expect(s.theme).toBe("light");
    });

    it("sets mode and resolved theme to dark", () => {
      resetStore("light", "light");
      useThemeStore.getState().setTheme("dark");
      const s = useThemeStore.getState();
      expect(s.mode).toBe("dark");
      expect(s.theme).toBe("dark");
    });
  });

  describe("resolveTheme (pure)", () => {
    it("returns light colors for mode light regardless of system", () => {
      const r = useThemeStore.getState().resolveTheme("light", "dark");
      expect(r.theme).toBe("light");
      expect(r.resolvedColors).toEqual(LIGHT_COLORS);
    });

    it("returns system colors for mode system", () => {
      const r = useThemeStore.getState().resolveTheme("system", "dark");
      expect(r.theme).toBe("dark");
      expect(r.resolvedColors).toEqual(DARK_COLORS);
    });

    it("does not mutate store state", () => {
      resetStore("light", "light");
      const before = useThemeStore.getState();
      useThemeStore.getState().resolveTheme("dark", "dark");
      expect(useThemeStore.getState()).toEqual(before);
    });
  });

  describe("persistence shape", () => {
    it("persists only `mode` (partialize)", () => {
      const opts = getPersistOptions();
      const sample = useThemeStore.getState();
      const partial = opts.partialize(sample);
      expect(Object.keys(partial)).toEqual(["mode"]);
      expect(partial.mode).toBe(sample.mode);
    });

    it("storage key is 'theme-storage'", () => {
      const opts = getPersistOptions();
      expect(opts.name).toBe("theme-storage");
    });

    it("merge rehydrates explicit mode and recomputes derived fields", () => {
      const opts = getPersistOptions();
      const current = useThemeStore.getState();
      // zustand persist unwraps `{ state, version }` before calling merge,
      // so the first arg is the persisted partial (just `{ mode }` here).
      const merged = opts.merge(
        { mode: "dark" },
        current
      ) as ReturnType<typeof useThemeStore.getState>;
      expect(merged.mode).toBe("dark");
      expect(merged.theme).toBe("dark");
      expect(merged.resolvedColors).toEqual(DARK_COLORS);
      // systemTheme comes from the in-memory (current) state, not persisted.
      expect(merged.systemTheme).toBe(current.systemTheme);
    });

    it("merge falls back to 'system' when persisted state is missing", () => {
      const opts = getPersistOptions();
      const current = useThemeStore.getState();
      const merged = opts.merge(undefined, current) as ReturnType<
        typeof useThemeStore.getState
      >;
      expect(merged.mode).toBe("system");
      expect(merged.theme).toBe(current.systemTheme);
    });

    it("merge ignores persisted derived fields and recomputes them", () => {
      const opts = getPersistOptions();
      const current = useThemeStore.getState();
      const merged = opts.merge(
        { mode: "light", theme: "dark", resolvedColors: DARK_COLORS },
        current
      ) as ReturnType<typeof useThemeStore.getState>;
      expect(merged.mode).toBe("light");
      expect(merged.theme).toBe("light");
      expect(merged.resolvedColors).toEqual(LIGHT_COLORS);
    });
  });
});