import { FLAVOR_CODES, PRODUCTION_PRODUCT_TYPES } from "@/constants/productionCatalog";

/**
 * Human-readable labels for each production product type.
 * Source of truth: the comments in constants/theme.ts (productA=GNY...).
 * Short enough to sit beside a numeric input on a 390px-wide phone.
 */
export const PRODUCT_LABELS: Record<(typeof PRODUCTION_PRODUCT_TYPES)[number], string> = {
  A: "Avena",
  GNY: "Galletas",
  C: "Cookies",
  K: "Keto",
};

export interface MobileFlavorRow {
  flavor: string;
  cells: { product: string; label: string; key: string }[];
}

/**
 * Build the list of flavor rows for the mobile grouped layout.
 * Each flavor becomes one row; each row carries one labeled input per
 * product type so the flavor name never wraps and inputs stay tappable.
 *
 * Pure derivation over the catalog — no store, no React. Testable in isolation.
 */
export function groupFlavorsForMobile(
  flavors: readonly string[] = FLAVOR_CODES,
  products: readonly string[] = PRODUCTION_PRODUCT_TYPES
): MobileFlavorRow[] {
  return flavors.map((flavor) => ({
    flavor,
    cells: products.map((product) => ({
      product,
      label: PRODUCT_LABELS[product as (typeof PRODUCTION_PRODUCT_TYPES)[number]] ?? product,
      key: `${flavor}:${product}`,
    })),
  }));
}

/**
 * Truncate a section navigator label so it never clips at the right edge
 * on a 390px phone. Keeps the tail visible via an ellipsis when too long.
 *
 * `maxLen` defaults to 12 — enough for the current Spanish labels
 * ("Distribución" = 11, "Correcciones" = 12) while leaving room for the
 * active indicator dot and horizontal padding.
 */
export function truncateLabel(label: string, maxLen = 12): string {
  if (label.length <= maxLen) return label;
  return `${label.slice(0, maxLen - 1).trimEnd()}…`;
}