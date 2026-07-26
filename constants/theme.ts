export type ResolvedTheme = "light" | "dark";

export const LIGHT_COLORS = {
  primary: "#22c55e",
  secondary: "#16a34a",
  accent: "#10b981",

  success: "#4ade80",
  warning: "#fbbf24",
  error: "#ef4444",

  text: "#1e293b",
  textLight: "#64748b",

  background: "#f8fafc",
  white: "#ffffff",
  border: "#e2e8f0",
  onPrimary: "#ffffff",

  // Sidebar (reference design: black sidebar, theme-independent)
  sidebar: "#0f0f0f",
  sidebarBorder: "#262626",
  sidebarText: "#a3a3a3",
  sidebarActiveText: "#4ade80",
  sidebarTitle: "#f8fafc",

  // Product colors
  productA: "#4361ee", // Avena - Blue
  productGNY: "#fb7185", // Galletas - Pink
  productC: "#fb923c", // Cookies - Orange
  productK: "#a78bfa", // Ketos - Purple

  // Status colors
  statusVisto: "#64748b", // Gray
  statusVistoP: "#84cc16", // Green
  statusVistoTRF: "#06b6d4", // Cyan
  statusObservacion: "#fbbf24", // Yellow
  statusVistoSP: "#f97316", // Orange
  statusVistoTRFSP: "#8b5cf6", // Purple
};

export const DARK_COLORS = {
  primary: "#22c55e",
  secondary: "#16a34a",
  accent: "#10b981",

  success: "#4ade80",
  warning: "#fbbf24",
  error: "#ef4444",

  text: "#f8fafc",
  textLight: "#94a3b8",

  background: "#0f172a",
  white: "#1e293b",
  border: "#334155",
  onPrimary: "#ffffff",

  // Sidebar (reference design: black sidebar, theme-independent)
  sidebar: "#0f0f0f",
  sidebarBorder: "#262626",
  sidebarText: "#a3a3a3",
  sidebarActiveText: "#4ade80",
  sidebarTitle: "#f8fafc",

  // Product colors remain the same for consistency
  productA: "#4361ee",
  productGNY: "#fb7185",
  productC: "#fb923c",
  productK: "#a78bfa",

  // Status colors remain the same for consistency
  statusVisto: "#64748b",
  statusVistoP: "#84cc16",
  statusVistoTRF: "#06b6d4",
  statusObservacion: "#fbbf24",
  statusVistoSP: "#f97316",
  statusVistoTRFSP: "#8b5cf6",
};

export type ColorSet = typeof LIGHT_COLORS;

// Dynamic colors based on theme
export const COLORS = {
  ...LIGHT_COLORS,
  themed: (theme: ResolvedTheme): ColorSet => {
    return theme === "light" ? LIGHT_COLORS : DARK_COLORS;
  },
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 8,
  padding: 16,

  // Font sizes
  largeTitle: 32,
  h1: 24,
  h2: 20,
  h3: 18,
  h4: 16,
  body1: 16,
  body2: 14,
  body3: 12,
  small: 10,
};

export const FONTS = {
  largeTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: SIZES.largeTitle,
    lineHeight: 48,
  },
  h1: { fontFamily: "Montserrat_700Bold", fontSize: SIZES.h1, lineHeight: 36 },
  h2: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: SIZES.h2,
    lineHeight: 30,
  },
  h3: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: SIZES.h3,
    lineHeight: 28,
  },
  h4: {
    fontFamily: "Montserrat_500Medium",
    fontSize: SIZES.h4,
    lineHeight: 26,
  },
  body1: {
    fontFamily: "Montserrat_400Regular",
    fontSize: SIZES.body1,
    lineHeight: 26,
  },
  body2: {
    fontFamily: "Montserrat_400Regular",
    fontSize: SIZES.body2,
    lineHeight: 24,
  },
  body3: {
    fontFamily: "Montserrat_400Regular",
    fontSize: SIZES.body3,
    lineHeight: 20,
  },
  small: {
    fontFamily: "Montserrat_400Regular",
    fontSize: SIZES.small,
    lineHeight: 18,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};
