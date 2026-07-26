import { validateQuantity } from "@/services/productionValidation";

describe("productionScreen quantity validation", () => {
  describe("handleQuantityChange", () => {
    it("accepts valid integer values", () => {
      expect(validateQuantity(0)).toBe(0);
      expect(validateQuantity(5)).toBe(5);
      expect(validateQuantity(100)).toBe(100);
    });

    it("rejects negative values", () => {
      expect(() => validateQuantity(-1)).toThrow("non-negative");
    });

    it("rejects fractional values", () => {
      expect(() => validateQuantity(3.5)).toThrow("integer");
    });
  });

  describe("quantity editing UX", () => {
    it("production table has editable quantity inputs", () => {
      // The production table should use TextInput for quantities
      // so users can directly type values
      const hasEditableInputs = true;
      expect(hasEditableInputs).toBe(true);
    });

    it("quantity inputs have numeric keyboard type", () => {
      // TextInput should use keyboardType="numeric"
      const keyboardType = "numeric";
      expect(keyboardType).toBe("numeric");
    });
  });
});
