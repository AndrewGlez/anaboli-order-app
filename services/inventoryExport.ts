import { StockItem } from "@/types";
import { saveXlsxToFile } from "./web/fileExport";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export async function exportInventoryToXlsx(
  items: StockItem[],
  filename: string = "inventory.xlsx"
): Promise<void> {
  const XLSX = require("xlsx");

  // Sort items by normalized name
  const sorted = [...items].sort((a, b) =>
    normalizeName(a.name).localeCompare(normalizeName(b.name))
  );

  // Create headers
  const headers = ["name", "type", "quantity", "minThreshold", "price"];

  // Create data rows
  const data = sorted.map((item) => ({
    name: item.name,
    type: item.type,
    quantity: item.quantity,
    minThreshold: item.minThreshold,
    price: item.price,
  }));

  // Create worksheet with explicit headers
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Generate base64
  const base64 = XLSX.write(wb, {
    bookType: "xlsx",
    type: "base64",
  });

  // Save file
  await saveXlsxToFile(base64, filename);
}

export function getInventoryExportData(items: StockItem[]) {
  const XLSX = require("xlsx");

  // Sort items by normalized name
  const sorted = [...items].sort((a, b) =>
    normalizeName(a.name).localeCompare(normalizeName(b.name))
  );

  // Create headers
  const headers = ["name", "type", "quantity", "minThreshold", "price"];

  // Create data rows
  const data = sorted.map((item) => ({
    name: item.name,
    type: item.type,
    quantity: item.quantity,
    minThreshold: item.minThreshold,
    price: item.price,
  }));

  // Create worksheet with explicit headers
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  return { workbook: wb, worksheet: ws, headers, data };
}
