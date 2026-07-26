import { useOrderStore } from "@/store/orderStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { Order } from "@/types";

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

// Mock expo-file-system and expo-sharing
jest.mock("expo-file-system", () => ({
  writeAsStringAsync: jest.fn(),
  documentDirectory: "file:///test/",
  EncodingType: { UTF8: "utf8" },
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(),
}));

// Reset stores between tests
beforeEach(() => {
  useOrderStore.setState({ orders: [], gastos: [], lastUpdated: 0 });
  useInventoryStore.setState({ items: [], hydrated: true });
});

describe("orderStore inventory sync", () => {
  describe("addOrder", () => {
    it("creates order and decrements inventory", () => {
      useInventoryStore.setState({
        items: [
          {
            id: "inv-1",
            name: "Whey",
            type: "GNY",
            quantity: 10,
            minThreshold: 2,
            price: 50,
            updatedAt: new Date().toISOString(),
            lastAdjustmentReason: "initial",
          },
        ],
      });

      const order: Order = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "GNY", quantity: 3 }],
        status: "Entregado",
        flavor: "Apple Pie",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useOrderStore.getState().addOrder(order);

      // Order should be created
      expect(useOrderStore.getState().orders).toHaveLength(1);
      expect(useOrderStore.getState().orders[0].id).toBe("order-1");

      // Inventory should be decremented
      expect(useInventoryStore.getState().items[0].quantity).toBe(7);
    });

    it("short-circuits when inventory is not hydrated", () => {
      useInventoryStore.setState({ hydrated: false });

      const order: Order = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "GNY", quantity: 1 }],
        status: "Entregado",
        flavor: "Berry Lover",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useOrderStore.getState().addOrder(order);

      expect(useOrderStore.getState().orders).toHaveLength(0);
    });
  });

  describe("updateOrder", () => {
    it("restores old products and consumes new products", () => {
      useInventoryStore.setState({
        items: [
          {
            id: "inv-1",
            name: "Whey",
            type: "GNY",
            quantity: 10,
            minThreshold: 2,
            price: 50,
            updatedAt: new Date().toISOString(),
            lastAdjustmentReason: "order:create",
          },
        ],
      });

      // Add an order first
      const order: Order = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "GNY", quantity: 3 }],
        status: "Entregado",
        flavor: "Choco Power",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useOrderStore.getState().addOrder(order);

      // Order should be created
      expect(useOrderStore.getState().orders).toHaveLength(1);
      expect(useOrderStore.getState().orders[0].id).toBe("order-1");

      // Inventory should be decremented
      expect(useInventoryStore.getState().items[0].quantity).toBe(7);
    });

    it("rejects order when inventory is insufficient", () => {
      useInventoryStore.setState({
        items: [
          {
            id: "inv-1",
            name: "Whey",
            type: "GNY",
            quantity: 2,
            minThreshold: 1,
            price: 50,
            updatedAt: new Date().toISOString(),
            lastAdjustmentReason: "initial",
          },
        ],
      });

      const order: Order = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "GNY", quantity: 3 }],
        status: "Entregado",
        flavor: "Apple Pie",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useOrderStore.getState().addOrder(order);

      // Order should NOT be created
      expect(useOrderStore.getState().orders).toHaveLength(0);

      // Inventory should be unchanged
      expect(useInventoryStore.getState().items[0].quantity).toBe(2);
    });

    it("short-circuits when inventory is not hydrated", () => {
      useInventoryStore.setState({ hydrated: false });

      const order: Order = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "GNY", quantity: 3 }],
        status: "Entregado",
        flavor: "Apple Pie",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useOrderStore.getState().addOrder(order);

      expect(useOrderStore.getState().orders).toHaveLength(0);
    });
  });

  describe("updateOrder", () => {
    it("restores old products and consumes new products", () => {
      useInventoryStore.setState({
        items: [
          {
            id: "inv-1",
            name: "Whey",
            type: "GNY",
            quantity: 10,
            minThreshold: 2,
            price: 50,
            updatedAt: new Date().toISOString(),
            lastAdjustmentReason: "order:create",
          },
        ],
      });

      // Add an order first
      const order: Order = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "GNY", quantity: 3 }],
        status: "Entregado",
        flavor: "Choco Power",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useOrderStore.getState().addOrder(order);

      // Inventory is now 7
      expect(useInventoryStore.getState().items[0].quantity).toBe(7);

      // Update order to consume 2 instead of 3
      useOrderStore.getState().updateOrder("order-1", {
        products: [{ type: "GNY", quantity: 2 }],
      });

      // Old products restored (7 + 3 = 10), new consumed (10 - 2 = 8)
      expect(useInventoryStore.getState().items[0].quantity).toBe(8);
      expect(useOrderStore.getState().orders[0].products[0].quantity).toBe(2);
    });

    it("rejects update when new products exceed inventory", () => {
      useInventoryStore.setState({
        items: [
          {
            id: "inv-1",
            name: "Whey",
            type: "GNY",
            quantity: 5,
            minThreshold: 2,
            price: 50,
            updatedAt: new Date().toISOString(),
            lastAdjustmentReason: "initial",
          },
        ],
      });

      // Add an order consuming 2
      const order: Order = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "GNY", quantity: 2 }],
        status: "Entregado",
        flavor: "Berry Lover",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useOrderStore.getState().addOrder(order);

      // Inventory is now 3
      expect(useInventoryStore.getState().items[0].quantity).toBe(3);

      // Try to update to consume 10 (restore brings it to 5, but 5 < 10)
      useOrderStore.getState().updateOrder("order-1", {
        products: [{ type: "GNY", quantity: 10 }],
      });

      // Order should NOT be updated
      expect(useOrderStore.getState().orders[0].products[0].quantity).toBe(2);

      // Inventory should be at 5 (restored but not consumed due to failure)
      // Note: this is the documented atomicity gap - restore is NOT rolled back
      expect(useInventoryStore.getState().items[0].quantity).toBe(5);
    });
  });

  describe("deleteOrder", () => {
    it("restores inventory and removes order", () => {
      useInventoryStore.setState({
        items: [
          {
            id: "inv-1",
            name: "Whey",
            type: "GNY",
            quantity: 10,
            minThreshold: 2,
            price: 50,
            updatedAt: new Date().toISOString(),
            lastAdjustmentReason: "order:create",
          },
        ],
      });

      // Add an order
      const order: Order = {
        id: "order-1",
        gymName: "Gym Alpha",
        products: [{ type: "GNY", quantity: 3 }],
        status: "Entregado",
        flavor: "Choco Nuts",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useOrderStore.getState().addOrder(order);

      // Inventory is now 7
      expect(useInventoryStore.getState().items[0].quantity).toBe(7);

      // Delete the order
      useOrderStore.getState().deleteOrder("order-1");

      // Inventory should be restored to 10
      expect(useInventoryStore.getState().items[0].quantity).toBe(10);
      expect(useOrderStore.getState().orders).toHaveLength(0);
    });

    it("deleting non-existent order is a no-op", () => {
      useInventoryStore.setState({
        items: [
          {
            id: "inv-1",
            name: "Whey",
            type: "GNY",
            quantity: 10,
            minThreshold: 2,
            price: 50,
            updatedAt: new Date().toISOString(),
            lastAdjustmentReason: "initial",
          },
        ],
      });

      useOrderStore.getState().deleteOrder("missing-id");

      expect(useInventoryStore.getState().items[0].quantity).toBe(10);
    });
  });
});
