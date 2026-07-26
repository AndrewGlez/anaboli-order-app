import {
  groupFlavorsForMobile,
  truncateLabel,
  PRODUCT_LABELS,
} from "@/components/production/mobileProductionLayout";
import { FLAVOR_CODES, PRODUCTION_PRODUCT_TYPES } from "@/constants/productionCatalog";

describe("mobileProductionLayout", () => {
  describe("PRODUCT_LABELS", () => {
    it("maps every production product type to a human label", () => {
      PRODUCTION_PRODUCT_TYPES.forEach((product) => {
        expect(PRODUCT_LABELS[product]).toBeTruthy();
        expect(typeof PRODUCT_LABELS[product]).toBe("string");
      });
    });

    it("uses the canonical names from constants/theme.ts", () => {
      expect(PRODUCT_LABELS.A).toBe("Avena");
      expect(PRODUCT_LABELS.GNY).toBe("Galletas");
      expect(PRODUCT_LABELS.C).toBe("Cookies");
      expect(PRODUCT_LABELS.K).toBe("Keto");
    });
  });

  describe("groupFlavorsForMobile", () => {
    it("returns one row per flavor in catalog order", () => {
      const rows = groupFlavorsForMobile();
      expect(rows).toHaveLength(FLAVOR_CODES.length);
      rows.forEach((row, i) => {
        expect(row.flavor).toBe(FLAVOR_CODES[i]);
      });
    });

    it("gives each row one labeled cell per product type", () => {
      const rows = groupFlavorsForMobile();
      rows.forEach((row) => {
        expect(row.cells).toHaveLength(PRODUCTION_PRODUCT_TYPES.length);
        row.cells.forEach((cell, j) => {
          expect(cell.product).toBe(PRODUCTION_PRODUCT_TYPES[j]);
          expect(cell.label).toBe(
            PRODUCT_LABELS[PRODUCTION_PRODUCT_TYPES[j] as keyof typeof PRODUCT_LABELS]
          );
        });
      });
    });

    it("builds composite keys as flavor:product for store lookups", () => {
      const rows = groupFlavorsForMobile();
      const first = rows[0];
      first.cells.forEach((cell) => {
        expect(cell.key).toBe(`${first.flavor}:${cell.product}`);
      });
    });

    it("respects explicit flavor/product arguments", () => {
      const rows = groupFlavorsForMobile(["Apple Pie", "Berry Lover"], ["A", "K"]);
      expect(rows).toHaveLength(2);
      expect(rows[0].flavor).toBe("Apple Pie");
      expect(rows[0].cells).toHaveLength(2);
      expect(rows[0].cells[0].product).toBe("A");
      expect(rows[0].cells[0].label).toBe("Avena");
      expect(rows[0].cells[1].product).toBe("K");
      expect(rows[0].cells[1].label).toBe("Keto");
    });

    it("falls back to product code when label missing", () => {
      const rows = groupFlavorsForMobile(["Apple Pie"], ["UNKNOWN" as "A"]);
      expect(rows[0].cells[0].label).toBe("UNKNOWN");
    });

    it("returns empty array for empty flavors", () => {
      expect(groupFlavorsForMobile([], [])).toEqual([]);
    });
  });

  describe("truncateLabel", () => {
    it("returns short labels unchanged", () => {
      expect(truncateLabel("Fecha")).toBe("Fecha");
      expect(truncateLabel("Resumen")).toBe("Resumen");
    });

    it("returns labels at exactly maxLen unchanged", () => {
      expect(truncateLabel("Correcciones", 12)).toBe("Correcciones");
    });

    it("truncates labels longer than maxLen with an ellipsis", () => {
      const out = truncateLabel("Distribución General", 12);
      expect(out.length).toBeLessThanOrEqual(12);
      expect(out.endsWith("…")).toBe(true);
    });

    it("honors a custom maxLen", () => {
      expect(truncateLabel("Producción", 4)).toBe("Pro…");
    });

    it("does not mutate the default for callers that pass maxLen", () => {
      expect(truncateLabel("Distribución")).toBe("Distribución");
    });
  });
});