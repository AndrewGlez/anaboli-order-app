export const FLAVOR_CODES = [
  "Apple Pie",
  "Berry Lover",
  "Maracuyá Citrus",
  "Higo Toffee",
  "Piña Coconut",
  "Maní Crunch",
  "Expreso Coffee",
  "Choco Power",
  "Banana Coffee",
  "Choco Nuts",
  "Choco Menta",
] as const;

export type FlavorCode = (typeof FLAVOR_CODES)[number];

export const PRODUCTION_PRODUCT_TYPES = ["A", "GNY", "C", "K"] as const;

export function isValidFlavor(flavor: unknown): flavor is FlavorCode {
  if (typeof flavor !== "string") return false;
  return FLAVOR_CODES.includes(flavor as FlavorCode);
}

export function assertFlavor(flavor: unknown): FlavorCode {
  if (!isValidFlavor(flavor)) {
    throw new Error(`Invalid flavor: ${flavor}. Must be one of: ${FLAVOR_CODES.join(", ")}`);
  }
  return flavor;
}
