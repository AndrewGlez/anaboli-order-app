import { parseExcelImport, getImportRows } from "@/services/web/fileImport";

describe("fileImport", () => {
  describe("parseExcelImport", () => {
    it("parses a valid xlsx file", async () => {
      const XLSX = require("xlsx");

      // Create a workbook with valid data
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ["name", "type", "quantity", "minThreshold", "price"],
        ["Whey", "GNY", 10, 2, 50],
        ["BCAA", "A", 5, 1, 30],
      ]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Write to buffer
      const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      // Mock FileReader to return the buffer
      const originalFileReader = (global as any).FileReader;
      (global as any).FileReader = class {
        result: ArrayBuffer | null = null;
        onload: ((e: any) => void) | null = null;
        readAsArrayBuffer(f: File) {
          setTimeout(() => {
            this.result = buf;
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      };

      const file = new File([buf], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const results = await parseExcelImport(file);

      expect(results).toEqual([
        { row: 1, status: "ok" },
        { row: 2, status: "ok" },
      ]);

      (global as any).FileReader = originalFileReader;
    });

    it("rejects missing headers", async () => {
      const XLSX = require("xlsx");

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ["name", "type", "quantity"], // Missing minThreshold and price
        ["Whey", "GNY", 10],
      ]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      // Mock FileReader
      const originalFileReader = (global as any).FileReader;
      (global as any).FileReader = class {
        result: ArrayBuffer | null = null;
        onload: ((e: any) => void) | null = null;
        readAsArrayBuffer(f: File) {
          setTimeout(() => {
            this.result = buf;
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      };

      const file = new File([buf], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const results = await parseExcelImport(file);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe("error");
      expect(results[0].error).toContain("Missing required headers");

      (global as any).FileReader = originalFileReader;
    });

    it("validates per-row errors", async () => {
      const XLSX = require("xlsx");

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ["name", "type", "quantity", "minThreshold", "price"],
        ["Whey", "GNY", 10, 2, 50],
        ["BCAA", "INVALID", 5, 1, 30], // Invalid type
        ["Creatine", "C", "abc", 2, 25], // Invalid quantity
      ]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      // Mock FileReader
      const originalFileReader = (global as any).FileReader;
      (global as any).FileReader = class {
        result: ArrayBuffer | null = null;
        onload: ((e: any) => void) | null = null;
        readAsArrayBuffer(f: File) {
          setTimeout(() => {
            this.result = buf;
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      };

      const file = new File([buf], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const results = await parseExcelImport(file);

      expect(results).toEqual([
        { row: 1, status: "ok" },
        { row: 2, status: "error", error: "Invalid type: INVALID. Must be one of: A, GNY, C, K" },
        { row: 3, status: "error", error: "quantity must be a number" },
      ]);

      (global as any).FileReader = originalFileReader;
    });
  });

  describe("getImportRows", () => {
    it("extracts rows from valid xlsx", async () => {
      const XLSX = require("xlsx");

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ["name", "type", "quantity", "minThreshold", "price"],
        ["Whey", "GNY", 10, 2, 50],
        ["BCAA", "A", 5, 1, 30],
      ]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      // Mock FileReader
      const originalFileReader = (global as any).FileReader;
      (global as any).FileReader = class {
        result: ArrayBuffer | null = null;
        onload: ((e: any) => void) | null = null;
        readAsArrayBuffer(f: File) {
          setTimeout(() => {
            this.result = buf;
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      };

      const file = new File([buf], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const rows = await getImportRows(file);

      expect(rows).toEqual([
        { name: "Whey", type: "GNY", quantity: 10, minThreshold: 2, price: 50 },
        { name: "BCAA", type: "A", quantity: 5, minThreshold: 1, price: 30 },
      ]);

      (global as any).FileReader = originalFileReader;
    });
  });
});
