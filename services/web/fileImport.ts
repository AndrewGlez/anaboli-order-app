import { ImportRow, ImportResult, ProductType } from "@/types";

const REQUIRED_HEADERS = ["name", "type", "quantity", "minthreshold", "price"];
const VALID_TYPES: ProductType[] = ["A", "GNY", "C", "K"];

export async function parseExcelImport(
  file: File
): Promise<ImportResult[]> {
  const XLSX = require("xlsx");

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve([{ row: 0, status: "error", error: "No sheets found" }]);
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          resolve([{ row: 0, status: "error", error: "Empty sheet" }]);
          return;
        }

        // Check headers
        const headers = (jsonData[0] as string[]).map((h) =>
          String(h).trim().toLowerCase()
        );
        const missingHeaders = REQUIRED_HEADERS.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          resolve([
            {
              row: 0,
              status: "error",
              error: `Missing required headers: ${missingHeaders.join(", ")}`,
            },
          ]);
          return;
        }

        // Validate rows
        const results: ImportResult[] = [];
        const dataRows = jsonData.slice(1);

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i] as any[];
          const rowNumber = i + 1;

          // Get values by header index
          const nameIdx = headers.indexOf("name");
          const typeIdx = headers.indexOf("type");
          const quantityIdx = headers.indexOf("quantity");
          const minThresholdIdx = headers.indexOf("minthreshold");
          const priceIdx = headers.indexOf("price");

          const name = row[nameIdx];
          const type = row[typeIdx];
          const quantity = row[quantityIdx];
          const minThreshold = row[minThresholdIdx];
          const price = row[priceIdx];

          // Validate name
          if (!name || typeof name !== "string" || name.trim() === "") {
            results.push({ row: rowNumber, status: "error", error: "Name is required" });
            continue;
          }

          // Validate type
          if (!type || !VALID_TYPES.includes(type as ProductType)) {
            results.push({
              row: rowNumber,
              status: "error",
              error: `Invalid type: ${type}. Must be one of: ${VALID_TYPES.join(", ")}`,
            });
            continue;
          }

          // Validate quantity
          if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) < 0) {
            results.push({ row: rowNumber, status: "error", error: "quantity must be a number" });
            continue;
          }

          // Validate minThreshold
          if (minThreshold === undefined || minThreshold === null || isNaN(Number(minThreshold)) || Number(minThreshold) < 0) {
            results.push({ row: rowNumber, status: "error", error: "minThreshold must be a number" });
            continue;
          }

          // Validate price
          if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
            results.push({ row: rowNumber, status: "error", error: "price must be a number" });
            continue;
          }

          results.push({ row: rowNumber, status: "ok" });
        }

        resolve(results);
      } catch (error: any) {
        resolve([
          { row: 0, status: "error", error: `Parse error: ${error.message}` },
        ]);
      }
    };

    reader.onerror = () => {
      resolve([{ row: 0, status: "error", error: "Failed to read file" }]);
    };

    reader.readAsArrayBuffer(file);
  });
}

export function getImportRows(
  file: File
): Promise<ImportRow[]> {
  const XLSX = require("xlsx");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = (jsonData[0] as string[]).map((h) =>
          String(h).trim().toLowerCase()
        );

        const dataRows = jsonData.slice(1);
        const rows: ImportRow[] = [];

        for (const row of dataRows) {
          const r = row as any[];
          const nameIdx = headers.indexOf("name");
          const typeIdx = headers.indexOf("type");
          const quantityIdx = headers.indexOf("quantity");
          const minThresholdIdx = headers.indexOf("minthreshold");
          const priceIdx = headers.indexOf("price");

          rows.push({
            name: String(r[nameIdx]).trim(),
            type: r[typeIdx] as ProductType,
            quantity: Number(r[quantityIdx]),
            minThreshold: Number(r[minThresholdIdx]),
            price: Number(r[priceIdx]),
          });
        }

        resolve(rows);
      } catch (error: any) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}
