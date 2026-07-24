import { useInventoryStore } from "@/store/inventoryStore";

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

// Reset store between tests
beforeEach(() => {
  useInventoryStore.setState({
    items: [],
    hydrated: false,
  });
});

describe("inventoryStore", () => {
  describe("addItem", () => {
    it("adds a new item with generated id and metadata", () => {
      const { addItem } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });

      const { items } = useInventoryStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Whey");
      expect(items[0].type).toBe("GNY");
      expect(items[0].quantity).toBe(10);
      expect(items[0].minThreshold).toBe(2);
      expect(items[0].price).toBe(50);
      expect(items[0].id).toBeTruthy();
      expect(items[0].updatedAt).toBeTruthy();
      expect(items[0].lastAdjustmentReason).toBe("initial");
    });
  });

  describe("updateItem", () => {
    it("updates item fields and refreshes updatedAt", () => {
      const { addItem, updateItem } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });

      const item = useInventoryStore.getState().items[0];
      const previousUpdatedAt = item.updatedAt;

      updateItem(item.id, { quantity: 5, lastAdjustmentReason: "manual restock" });

      const updated = useInventoryStore.getState().items[0];
      expect(updated.quantity).toBe(5);
      expect(updated.lastAdjustmentReason).toBe("manual restock");
      expect(updated.id).toBe(item.id);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(previousUpdatedAt).getTime()
      );
    });

    it("does not change id when updating", () => {
      const { addItem, updateItem } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });

      const item = useInventoryStore.getState().items[0];
      const originalId = item.id;

      updateItem(item.id, { name: "New Name" });

      expect(useInventoryStore.getState().items[0].id).toBe(originalId);
      expect(useInventoryStore.getState().items[0].name).toBe("New Name");
    });
  });

  describe("deleteItem", () => {
    it("removes the item with the given id", () => {
      const { addItem, deleteItem } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });
      addItem({ name: "BCAA", type: "A", quantity: 5, minThreshold: 1, price: 30 });

      const items = useInventoryStore.getState().items;
      deleteItem(items[0].id);

      expect(useInventoryStore.getState().items).toHaveLength(1);
      expect(useInventoryStore.getState().items[0].name).toBe("BCAA");
    });

    it("deleting a non-existent id is a no-op", () => {
      const { addItem, deleteItem } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });

      deleteItem("missing-id");

      expect(useInventoryStore.getState().items).toHaveLength(1);
    });
  });

  describe("clearInventory", () => {
    it("sets items to empty array", () => {
      const { addItem, clearInventory } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });
      addItem({ name: "BCAA", type: "A", quantity: 5, minThreshold: 1, price: 30 });
      addItem({ name: "Creatine", type: "C", quantity: 8, minThreshold: 3, price: 25 });

      clearInventory();

      expect(useInventoryStore.getState().items).toHaveLength(0);
    });
  });

  describe("checkAvailability", () => {
    it("returns available: true when stock is sufficient", () => {
      const { addItem, checkAvailability } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });

      const result = checkAvailability([{ type: "GNY", quantity: 5 }]);
      expect(result).toEqual({ available: true });
    });

    it("returns available: false with shortfall when stock is insufficient", () => {
      const { addItem, checkAvailability } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 5, minThreshold: 2, price: 50 });

      const result = checkAvailability([{ type: "GNY", quantity: 7 }]);
      expect(result).toEqual({ available: false, shortfall: { GNY: 2 } });
    });

    it("returns available: false when item does not exist", () => {
      const { checkAvailability } = useInventoryStore.getState();

      const result = checkAvailability([{ type: "GNY", quantity: 1 }]);
      expect(result).toEqual({ available: false, shortfall: { GNY: 1 } });
    });

    it("does not mutate state", () => {
      const { addItem, checkAvailability } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 5, minThreshold: 2, price: 50 });

      checkAvailability([{ type: "GNY", quantity: 7 }]);

      expect(useInventoryStore.getState().items[0].quantity).toBe(5);
    });
  });

  describe("consumeProducts", () => {
    it("decrements quantity and returns ok: true", () => {
      const { addItem, consumeProducts } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });

      const result = consumeProducts([{ type: "GNY", quantity: 3 }]);
      expect(result).toEqual({ ok: true });

      const item = useInventoryStore.getState().items[0];
      expect(item.quantity).toBe(7);
      expect(item.lastAdjustmentReason).toBe("order:create");
    });

    it("returns ok: false with shortfall when insufficient stock", () => {
      const { addItem, consumeProducts } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 5, minThreshold: 2, price: 50 });

      const result = consumeProducts([{ type: "GNY", quantity: 10 }]);
      expect(result).toEqual({ ok: false, reason: "insufficient_stock", shortfall: { GNY: 5 } });

      // Should not mutate state
      expect(useInventoryStore.getState().items[0].quantity).toBe(5);
    });

    it("sets custom reason when provided", () => {
      const { addItem, consumeProducts } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 });

      consumeProducts([{ type: "GNY", quantity: 3 }], "order:abc123");

      expect(useInventoryStore.getState().items[0].lastAdjustmentReason).toBe("order:abc123");
    });
  });

  describe("restoreProducts", () => {
    it("increments quantity and returns ok: true", () => {
      const { addItem, restoreProducts } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 5, minThreshold: 2, price: 50 });

      const result = restoreProducts([{ type: "GNY", quantity: 3 }]);
      expect(result).toEqual({ ok: true });

      const item = useInventoryStore.getState().items[0];
      expect(item.quantity).toBe(8);
      expect(item.lastAdjustmentReason).toBe("order:delete");
    });

    it("restoring a non-existent type is a no-op", () => {
      const { addItem, restoreProducts } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 5, minThreshold: 2, price: 50 });

      restoreProducts([{ type: "A", quantity: 3 }]);

      expect(useInventoryStore.getState().items[0].quantity).toBe(5);
    });

    it("sets custom reason when provided", () => {
      const { addItem, restoreProducts } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 5, minThreshold: 2, price: 50 });

      restoreProducts([{ type: "GNY", quantity: 3 }], "order:update:revert");

      expect(useInventoryStore.getState().items[0].lastAdjustmentReason).toBe("order:update:revert");
    });
  });

  describe("importItems", () => {
    it("imports new items", () => {
      const { importItems } = useInventoryStore.getState();

      const results = importItems([
        { name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 },
        { name: "BCAA", type: "A", quantity: 5, minThreshold: 1, price: 30 },
      ]);

      expect(results).toEqual([
        { row: 1, status: "ok" },
        { row: 2, status: "ok" },
      ]);
      expect(useInventoryStore.getState().items).toHaveLength(2);
    });

    it("merges by normalized name", () => {
      const { addItem, importItems } = useInventoryStore.getState();
      addItem({ name: "Whey", type: "GNY", quantity: 3, minThreshold: 2, price: 50 });

      const results = importItems([
        { name: "  WHEY ", type: "GNY", quantity: 10, minThreshold: 2, price: 50 },
      ]);

      expect(results[0].status).toBe("ok");
      const items = useInventoryStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(10);
      expect(items[0].lastAdjustmentReason).toBe("excel:import");
    });

    it("rejects duplicate normalized names in import", () => {
      const { importItems } = useInventoryStore.getState();

      const results = importItems([
        { name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 },
        { name: "whey", type: "GNY", quantity: 5, minThreshold: 1, price: 30 },
      ]);

      expect(results).toEqual([
        { row: 1, status: "ok" },
        { row: 2, status: "error", error: "Duplicate name after normalization" },
      ]);
      expect(useInventoryStore.getState().items).toHaveLength(1);
    });

    it("leaves existing items untouched when not in import", () => {
      const { addItem, importItems } = useInventoryStore.getState();
      addItem({ name: "BCAA", type: "A", quantity: 5, minThreshold: 1, price: 30 });

      importItems([
        { name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 },
      ]);

      const items = useInventoryStore.getState().items;
      expect(items).toHaveLength(2);
      expect(items.find((i) => i.name === "BCAA")?.quantity).toBe(5);
    });
  });
});
