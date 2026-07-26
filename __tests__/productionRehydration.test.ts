import { useProductionStore, ProductionEntry } from "@/store/productionStore";
import { FLAVOR_CODES, PRODUCTION_PRODUCT_TYPES } from "@/constants/productionCatalog";

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

describe("productionRehydration", () => {
  const testDate = "2024-01-15";

  beforeEach(() => {
    // Reset store state
    useProductionStore.setState({
      reports: [],
      currentDate: new Date().toISOString().split("T")[0],
      currentVersion: null,
      isReadOnly: false,
    });
  });

  describe("selectEntriesForDate", () => {
    it("returns default entries when no report exists for date", () => {
      const entries = useProductionStore.getState().selectEntriesForDate(testDate);

      // Should have 11 flavors × 4 products = 44 entries
      expect(entries.length).toBe(44);

      // All quantities should be 0
      entries.forEach((entry: ProductionEntry) => {
        expect(entry.quantity).toBe(0);
      });
    });

    it("returns persisted entries when report exists", () => {
      // First, save a report with some quantities
      const quantities = new Map<string, number>();
      quantities.set("Apple Pie:A", 25);
      quantities.set("Berry Lover:GNY", 15);

      useProductionStore.getState().saveReport(testDate, quantities);

      // Now get entries for that date
      const entries = useProductionStore.getState().selectEntriesForDate(testDate);

      // Should have persisted values
      const applePieA = entries.find(
        (e: ProductionEntry) => e.flavor === "Apple Pie" && e.product === "A"
      );
      const berryLoverGNY = entries.find(
        (e: ProductionEntry) => e.flavor === "Berry Lover" && e.product === "GNY"
      );

      expect(applePieA?.quantity).toBe(25);
      expect(berryLoverGNY?.quantity).toBe(15);
    });

    it("rehydrates all 11 flavors correctly", () => {
      const quantities = new Map<string, number>();
      FLAVOR_CODES.forEach((flavor, index) => {
        quantities.set(`${flavor}:A`, index + 1);
      });

      useProductionStore.getState().saveReport(testDate, quantities);

      const entries = useProductionStore.getState().selectEntriesForDate(testDate);

      // Check each flavor is persisted
      FLAVOR_CODES.forEach((flavor, index) => {
        const entry = entries.find(
          (e: ProductionEntry) => e.flavor === flavor && e.product === "A"
        );
        expect(entry?.quantity).toBe(index + 1);
      });
    });
  });

  describe("date switching", () => {
    it("prevents stale overwrite when switching dates", () => {
      const date1 = "2024-01-15";
      const date2 = "2024-01-16";

      // Save different quantities for each date
      const quantities1 = new Map<string, number>();
      quantities1.set("Apple Pie:A", 100);
      useProductionStore.getState().saveReport(date1, quantities1);

      const quantities2 = new Map<string, number>();
      quantities2.set("Apple Pie:A", 200);
      useProductionStore.getState().saveReport(date2, quantities2);

      // Load entries for date1
      const entriesDate1 = useProductionStore.getState().selectEntriesForDate(date1);
      const entryDate1 = entriesDate1.find(
        (e: ProductionEntry) => e.flavor === "Apple Pie" && e.product === "A"
      );
      expect(entryDate1?.quantity).toBe(100);

      // Load entries for date2
      const entriesDate2 = useProductionStore.getState().selectEntriesForDate(date2);
      const entryDate2 = entriesDate2.find(
        (e: ProductionEntry) => e.flavor === "Apple Pie" && e.product === "A"
      );
      expect(entryDate2?.quantity).toBe(200);
    });
  });
});
