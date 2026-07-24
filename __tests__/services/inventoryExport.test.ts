import { getInventoryExportData } from "@/services/inventoryExport";
import { StockItem } from "@/types";

describe("inventoryExport", () => {
  const mockItems: StockItem[] = [
    {
      id: "1",
      name: "Whey",
      type: "GNY",
      quantity: 10,
      minThreshold: 2,
      price: 50,
      updatedAt: new Date().toISOString(),
      lastAdjustmentReason: "initial",
    },
    {
      id: "2",
      name: "BCAA",
      type: "A",
      quantity: 5,
      minThreshold: 1,
      price: 30,
      updatedAt: new Date().toISOString(),
      lastAdjustmentReason: "initial",
    },
  ];

  describe("getInventoryExportData", () => {
    it("returns correct headers", () => {
      const { headers } = getInventoryExportData(mockItems);

      expect(headers).toEqual(["name", "type", "quantity", "minThreshold", "price"]);
    });

    it("returns data sorted by normalized name", () => {
      const { data } = getInventoryExportData(mockItems);

      expect(data).toEqual([
        { name: "BCAA", type: "A", quantity: 5, minThreshold: 1, price: 30 },
        { name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 },
      ]);
    });

    it("returns headers-only for empty inventory", () => {
      const { data, headers } = getInventoryExportData([]);

      expect(headers).toEqual(["name", "type", "quantity", "minThreshold", "price"]);
      expect(data).toEqual([]);
    });

    it("creates a valid workbook", () => {
      const { workbook } = getInventoryExportData(mockItems);

      expect(workbook).toBeDefined();
      expect(workbook.SheetNames).toHaveLength(1);
      expect(workbook.Sheets["Sheet1"]).toBeDefined();
    });

    it("handles items with special characters in name", () => {
      const specialItems: StockItem[] = [
        {
          id: "1",
          name: "  Whey  ",
          type: "GNY",
          quantity: 10,
          minThreshold: 2,
          price: 50,
          updatedAt: new Date().toISOString(),
          lastAdjustmentReason: "initial",
        },
      ];

      const { data } = getInventoryExportData(specialItems);

      // Original name is preserved, sorting uses normalized form
      expect(data[0].name).toBe("  Whey  ");
    });
  });
});
