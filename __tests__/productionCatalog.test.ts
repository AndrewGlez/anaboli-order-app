import {
  FLAVOR_CODES,
  FLAVOR_COLORS,
  PRODUCTION_PRODUCT_TYPES,
  isValidFlavor,
} from "@/constants/productionCatalog";

describe("productionCatalog", () => {
  describe("FLAVOR_CODES", () => {
    it("has exactly 11 entries", () => {
      expect(FLAVOR_CODES).toHaveLength(11);
    });

    it("contains all required flavors", () => {
      const expectedFlavors = [
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
      ];

      expectedFlavors.forEach((flavor) => {
        expect(FLAVOR_CODES).toContain(flavor);
      });
    });
  });

  describe("PRODUCTION_PRODUCT_TYPES", () => {
    it("contains A, GNY, C, K", () => {
      expect(PRODUCTION_PRODUCT_TYPES).toEqual(["A", "GNY", "C", "K"]);
    });
  });

  describe("isValidFlavor", () => {
    it("returns true for all 11 valid flavors", () => {
      FLAVOR_CODES.forEach((flavor) => {
        expect(isValidFlavor(flavor)).toBe(true);
      });
    });

    it("returns false for Mango Loco", () => {
      expect(isValidFlavor("Mango Loco")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isValidFlavor("")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isValidFlavor(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isValidFlavor(undefined)).toBe(false);
    });

    it("returns false for random invalid strings", () => {
      expect(isValidFlavor("Invalid Flavor")).toBe(false);
      expect(isValidFlavor("Chocolate")).toBe(false);
    });
  });

  describe("FLAVOR_COLORS", () => {
    it("has a color entry for every flavor", () => {
      FLAVOR_CODES.forEach((flavor) => {
        expect(FLAVOR_COLORS[flavor]).toBeTruthy();
      });
    });

    it("each color is a valid 7-character hex string", () => {
      FLAVOR_CODES.forEach((flavor) => {
        const color = FLAVOR_COLORS[flavor];
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});
