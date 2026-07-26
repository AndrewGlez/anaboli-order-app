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

// Mock inventory store
jest.mock("@/store/inventoryStore", () => ({
  useInventoryStore: {
    getState: jest.fn(() => ({
      hydrated: true,
      checkAvailability: jest.fn(() => ({ available: true })),
      consumeProducts: jest.fn(),
      restoreProducts: jest.fn(),
    })),
  },
}));

describe("JSON Import", () => {
  beforeEach(() => {
    useOrderStore.setState({ orders: [], gastos: [], lastUpdated: 0 });
  });

  describe("importOrdersFromJSON", () => {
    it("accepts valid orders with all required flavors", () => {
      const validOrders = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A", quantity: 5 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "order-2",
          gymName: "Gym B",
          products: [{ type: "GNY", quantity: 3 }],
          status: "Entregado",
          flavor: "Berry Lover",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = useOrderStore.getState().importOrdersFromJSON(JSON.stringify(validOrders));

      expect(result.success).toBe(true);
      expect(result.message).toContain("2 pedidos importados");
    });

    it("rejects orders with invalid flavors", () => {
      const invalidOrders = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A", quantity: 5 }],
          status: "Entregado",
          flavor: "Mango Loco",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = useOrderStore.getState().importOrdersFromJSON(JSON.stringify(invalidOrders));

      expect(result.success).toBe(false);
      expect(result.message).toContain("Flavor inválido");
    });

    it("rejects orders with missing flavors", () => {
      const invalidOrders = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A", quantity: 5 }],
          status: "Entregado",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = useOrderStore.getState().importOrdersFromJSON(JSON.stringify(invalidOrders));

      expect(result.success).toBe(false);
      expect(result.message).toContain("Flavor inválido");
    });

    it("rejects orders with invalid product types", () => {
      const invalidOrders = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "INVALID", quantity: 5 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = useOrderStore.getState().importOrdersFromJSON(JSON.stringify(invalidOrders));

      expect(result.success).toBe(false);
      expect(result.message).toContain("Tipo de producto inválido");
    });

    it("rejects orders with negative quantity", () => {
      const invalidOrders = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A", quantity: -1 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = useOrderStore.getState().importOrdersFromJSON(JSON.stringify(invalidOrders));

      expect(result.success).toBe(false);
      expect(result.message).toContain("Cantidad inválida");
    });

    it("rejects orders with fractional quantity", () => {
      const invalidOrders = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A", quantity: 3.5 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = useOrderStore.getState().importOrdersFromJSON(JSON.stringify(invalidOrders));

      expect(result.success).toBe(false);
      expect(result.message).toContain("Cantidad inválida");
    });

    it("accepts all 11 valid flavor codes", () => {
      const validOrders = FLAVOR_CODES.map((flavor, index) => ({
        id: `order-${index}`,
        gymName: `Gym ${index}`,
        products: [{ type: "A", quantity: 1 }],
        status: "Entregado" as const,
        flavor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const result = useOrderStore.getState().importOrdersFromJSON(JSON.stringify(validOrders));

      expect(result.success).toBe(true);
      expect(result.message).toContain("11 pedidos importados");
    });
  });
});
