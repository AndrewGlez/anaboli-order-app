import { useProductionStore, ProductionReport } from "@/store/productionStore";
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

describe("productionStore", () => {
  beforeEach(() => {
    // Reset store state
    useProductionStore.setState({
      reports: [],
      currentDate: new Date().toISOString().split("T")[0],
      currentVersion: null,
      isReadOnly: false,
    });
  });

  describe("saveReport", () => {
    it("creates immutable version on save", () => {
      const quantities = new Map<string, number>();
      FLAVOR_CODES.forEach((flavor) => {
        quantities.set(`${flavor}:A`, 10);
      });

      const result = useProductionStore.getState().saveReport("2024-01-15", quantities);

      expect(result.ok).toBe(true);
      expect(useProductionStore.getState().reports).toHaveLength(1);
      expect(useProductionStore.getState().reports[0].version).toBe(1);
    });

    it("creates v2 when saving same date again", () => {
      const quantities = new Map<string, number>();
      FLAVOR_CODES.forEach((flavor) => {
        quantities.set(`${flavor}:A`, 10);
      });

      // First save
      useProductionStore.getState().saveReport("2024-01-15", quantities);

      // Second save
      const quantities2 = new Map<string, number>();
      FLAVOR_CODES.forEach((flavor) => {
        quantities2.set(`${flavor}:A`, 15);
      });
      const result2 = useProductionStore.getState().saveReport("2024-01-15", quantities2);

      expect(result2.ok).toBe(true);
      expect(useProductionStore.getState().reports).toHaveLength(2);
      expect(useProductionStore.getState().reports[1].version).toBe(2);
    });

    it("blocks save when viewing historical version", () => {
      const quantities = new Map<string, number>();
      FLAVOR_CODES.forEach((flavor) => {
        quantities.set(`${flavor}:A`, 10);
      });

      // Save first version
      useProductionStore.getState().saveReport("2024-01-15", quantities);

      // Simulate opening v1 (making it read-only)
      useProductionStore.setState({ isReadOnly: true });

      // Try to save again
      const result = useProductionStore.getState().saveReport("2024-01-15", quantities);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain("historical versions");
    });

    it("rejects fractional quantities", () => {
      const quantities = new Map<string, number>();
      quantities.set("Apple Pie:A", 3.5);

      const result = useProductionStore.getState().saveReport("2024-01-15", quantities);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain("Invalid quantity");
    });

    it("rejects negative quantities", () => {
      const quantities = new Map<string, number>();
      quantities.set("Apple Pie:A", -5);

      const result = useProductionStore.getState().saveReport("2024-01-15", quantities);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain("Invalid quantity");
    });
  });

  describe("selectors", () => {
    it("selectDaySummary computes correct totals", () => {
      const { selectDaySummary } = useProductionStore.getState();

      const orders = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A" as const, quantity: 5 }],
          status: "Entregado" as const,
          flavor: "Apple Pie" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "order-2",
          gymName: "Gym B",
          products: [{ type: "GNY" as const, quantity: 3 }],
          status: "Entregado" as const,
          flavor: "Berry Lover" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const summary = selectDaySummary(orders);

      expect(summary.totalAssigned).toBe(8);
      expect(summary.flavorCounts["Apple Pie"]).toBe(1);
      expect(summary.flavorCounts["Berry Lover"]).toBe(1);
    });
  });

  describe("getVersionsForDate", () => {
    it("returns versions sorted by version number", () => {
      const quantities = new Map<string, number>();
      FLAVOR_CODES.forEach((flavor) => {
        quantities.set(`${flavor}:A`, 10);
      });

      // Save three versions
      useProductionStore.getState().saveReport("2024-01-15", quantities);
      useProductionStore.getState().saveReport("2024-01-15", quantities);
      useProductionStore.getState().saveReport("2024-01-15", quantities);

      const versions = useProductionStore.getState().getVersionsForDate("2024-01-15");

      expect(versions).toHaveLength(3);
      expect(versions[0].version).toBe(1);
      expect(versions[1].version).toBe(2);
      expect(versions[2].version).toBe(3);
    });

    it("returns empty array for date with no reports", () => {
      const versions = useProductionStore.getState().getVersionsForDate("2024-01-15");

      expect(versions).toEqual([]);
    });
  });

  describe("selectEntriesForDate", () => {
    it("returns default entries when no report exists", () => {
      const entries = useProductionStore.getState().selectEntriesForDate("2024-01-15");

      // 11 flavors × 4 products = 44 entries
      expect(entries.length).toBe(44);
      expect(entries[0].quantity).toBe(0);
    });

    it("returns entries from latest version", () => {
      const quantities = new Map<string, number>();
      quantities.set("Apple Pie:A", 25);

      useProductionStore.getState().saveReport("2024-01-15", quantities);

      const entries = useProductionStore.getState().selectEntriesForDate("2024-01-15");
      const applePieEntry = entries.find(
        (e) => e.flavor === "Apple Pie" && e.product === "A"
      );

      expect(applePieEntry?.quantity).toBe(25);
    });
  });
});
