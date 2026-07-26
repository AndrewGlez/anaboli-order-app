export type ResolvedTheme = "light" | "dark";

export const LIGHT_COLORS = {
  // Brand
  primary: "#7cb342",
  secondary: "#8bc34a",
  accent: "#689f38",

  // Semantic
  success: "#7cb342",
  warning: "#ff9800",
  error: "#f44336",

  // Text
  text: "#1a1a1a",
  textLight: "#757575",
  textOnDark: "#ffffff",

  // Surfaces
  background: "#f5f5f5",
  surface: "#ffffff",
  white: "#ffffff",
  border: "#e0e0e0",
  onPrimary: "#ffffff",

  // Sidebar (theme-independent dark chrome)
  sidebar: "#1a1a1a",
  sidebarBorder: "#333333",
  sidebarText: "#a3a3a3",
  sidebarActiveText: "#8bc34a",
  sidebarTitle: "#ffffff",

  // Product colors (brand-specific, outside theme system)
  productA: "#4361ee",
  productGNY: "#fb7185",
  productC: "#fb923c",
  productK: "#a78bfa",

  // Status colors
  statusVisto: "#757575",
  statusVistoP: "#7cb342",
  statusVistoTRF: "#06b6d4",
  statusObservacion: "#ff9800",
  statusVistoSP: "#ff9800",
  statusVistoTRFSP: "#8b5cf6",
};

export const DARK_COLORS = {
  // Brand (brighter for dark backgrounds)
  primary: "#8bc34a",
  secondary: "#7cb342",
  accent: "#aed581",

  // Semantic
  success: "#8bc34a",
  warning: "#ffb74d",
  error: "#ef5350",

  // Text
  text: "#f5f5f5",
  textLight: "#b0b0b0",
  textOnDark: "#ffffff",

  // Surfaces
  background: "#121212",
  surface: "#1e1e1e",
  white: "#1e1e1e",
  border: "#333333",
  onPrimary: "#ffffff",

  // Sidebar (theme-independent dark chrome)
  sidebar: "#111111",
  sidebarBorder: "#262626",
  sidebarText: "#a3a3a3",
  sidebarActiveText: "#8bc34a",
  sidebarTitle: "#f5f5f5",

  // Product colors (brand-specific, outside theme system)
  productA: "#4361ee",
  productGNY: "#fb7185",
  productC: "#fb923c",
  productK: "#a78bfa",

  // Status colors
  statusVisto: "#757575",
  statusVistoP: "#7cb342",
  statusVistoTRF: "#06b6d4",
  statusObservacion: "#ff9800",
  statusVistoSP: "#ff9800",
  statusVistoTRFSP: "#8b5cf6",
};

export type ColorSet = typeof LIGHT_COLORS;

// Static tokens that are theme-independent (product colors, status colors, sidebar)
// Theme-dependent tokens should be accessed via COLORS.themed(theme)
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
