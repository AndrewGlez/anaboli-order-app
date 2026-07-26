import { validateQuantity } from "@/services/productionValidation";

describe("productionValidation", () => {
  describe("validateQuantity", () => {
    it("returns 12 for valid integer 12", () => {
      const result = validateQuantity(12);
      expect(result).toBe(12);
    });

    it("returns 0 for 0", () => {
      const result = validateQuantity(0);
      expect(result).toBe(0);
    });

    it("throws for fraction 3.5", () => {
      expect(() => {
        validateQuantity(3.5);
      }).toThrow("must be an integer");
    });

    it("throws for negative -1", () => {
      expect(() => {
        validateQuantity(-1);
      }).toThrow("must be non-negative");
    });

    it("throws for null", () => {
      expect(() => {
        validateQuantity(null as unknown as number);
      }).toThrow("must be a number");
    });

    it("throws for NaN", () => {
      expect(() => {
        validateQuantity(NaN);
      }).toThrow("must be a valid number");
    });

    it("throws for string number", () => {
      expect(() => {
        validateQuantity("12" as unknown as number);
      }).toThrow("must be a number");
    });

    it("throws for undefined", () => {
      expect(() => {
        validateQuantity(undefined as unknown as number);
      }).toThrow("must be a number");
    });

    it("accepts large valid numbers", () => {
      const result = validateQuantity(999999);
      expect(result).toBe(999999);
    });
  });
});
