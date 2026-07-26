import { useOrderStore } from "@/store/orderStore";
import { FLAVOR_CODES } from "@/constants/productionCatalog";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

describe("orderValidation", () => {
  describe("validateFlavor", () => {
    it("passes for Apple Pie", () => {
      const result = useOrderStore.getState().validateFlavor("Apple Pie");
      expect(result).toBe("Apple Pie");
    });

    it("throws for null", () => {
      expect(() => {
        useOrderStore.getState().validateFlavor(null);
      }).toThrow("Invalid flavor");
    });

    it("throws for Mango Loco", () => {
      expect(() => {
        useOrderStore.getState().validateFlavor("Mango Loco");
      }).toThrow("Invalid flavor: Mango Loco");
    });

    it("throws for empty string", () => {
      expect(() => {
        useOrderStore.getState().validateFlavor("");
      }).toThrow("Invalid flavor");
    });

    it("throws for undefined", () => {
      expect(() => {
        useOrderStore.getState().validateFlavor(undefined);
      }).toThrow("Invalid flavor");
    });

    it("throws for non-string value", () => {
      expect(() => {
        useOrderStore.getState().validateFlavor(123);
      }).toThrow("Invalid flavor");
    });

    it("passes for all 11 valid flavors", () => {
      FLAVOR_CODES.forEach((flavor) => {
        const result = useOrderStore.getState().validateFlavor(flavor);
        expect(result).toBe(flavor);
      });
    });
  });
});
