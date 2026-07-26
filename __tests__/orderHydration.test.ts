import { useOrderStore } from "@/store/orderStore";
import { RawPersistedOrder, Order, LegacyOrder } from "@/types";
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

describe("orderHydration", () => {
  describe("hydrateOrder", () => {
    it("maps valid flavor in catalog to Order", () => {
      const rawOrder: RawPersistedOrder = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "A", quantity: 3 }],
        status: "Entregado",
        flavor: "Apple Pie",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = useOrderStore.getState().hydrateOrder(rawOrder);

      // Should return an Order (not LegacyOrder)
      expect("legacyReason" in result).toBe(false);
      expect((result as Order).flavor).toBe("Apple Pie");
    });

    it("maps missing flavor to LegacyOrder with reason 'missing'", () => {
      const rawOrder: RawPersistedOrder = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "A", quantity: 3 }],
        status: "Entregado",
        // flavor is undefined
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = useOrderStore.getState().hydrateOrder(rawOrder);

      // Should return LegacyOrder
      expect("legacyReason" in result).toBe(true);
      const legacy = result as LegacyOrder;
      expect(legacy.legacyReason).toBe("missing");
      expect(legacy.legacyFlavor).toBeUndefined();
    });

    it("maps null flavor to LegacyOrder with reason 'missing'", () => {
      const rawOrder: RawPersistedOrder = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "A", quantity: 3 }],
        status: "Entregado",
        flavor: null as unknown as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = useOrderStore.getState().hydrateOrder(rawOrder);

      expect("legacyReason" in result).toBe(true);
      const legacy = result as LegacyOrder;
      expect(legacy.legacyReason).toBe("missing");
    });

    it("maps empty string flavor to LegacyOrder with reason 'missing'", () => {
      const rawOrder: RawPersistedOrder = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "A", quantity: 3 }],
        status: "Entregado",
        flavor: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = useOrderStore.getState().hydrateOrder(rawOrder);

      expect("legacyReason" in result).toBe(true);
      const legacy = result as LegacyOrder;
      expect(legacy.legacyReason).toBe("missing");
    });

    it("maps invalid flavor to LegacyOrder with reason 'invalid'", () => {
      const rawOrder: RawPersistedOrder = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "A", quantity: 3 }],
        status: "Entregado",
        flavor: "Mango Loco",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = useOrderStore.getState().hydrateOrder(rawOrder);

      expect("legacyReason" in result).toBe(true);
      const legacy = result as LegacyOrder;
      expect(legacy.legacyReason).toBe("invalid");
      expect(legacy.legacyFlavor).toBe("Mango Loco");
    });

    it("preserves all valid 11 flavors as Orders", () => {
      FLAVOR_CODES.forEach((flavor) => {
        const rawOrder: RawPersistedOrder = {
          id: `order-${flavor}`,
          gymName: "Gym Alpha",
          products: [{ type: "A", quantity: 3 }],
          status: "Entregado",
          flavor,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const result = useOrderStore.getState().hydrateOrder(rawOrder);

        expect("legacyReason" in result).toBe(false);
        expect((result as Order).flavor).toBe(flavor);
      });
    });
  });
});
