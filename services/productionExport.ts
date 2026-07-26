import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx";
import { ProductionReport, ProductionEntry } from "@/store/productionStore";
import { Order } from "@/types";

// Check if export capability is available
// Returns true only if sharing capability exists (file creation is always possible,
// but we need sharing/download to be meaningful)
export function canExport(): boolean {
  // Check if we're on web where file creation is supported
  // Native sharing requires expo-sharing, which may not be available
  // Using global Platform or check for window object
  const isWeb = typeof window !== "undefined";
  return isWeb;
}

// Generate XLSX workbook from production report
export function generateReportWorkbook(
  report: ProductionReport,
  orders: Order[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Production table sheet
  const productionData: Array<{ Flavor: string; Producto: string; Cantidad: number }> = [];
  report.entries.forEach((entry) => {
    productionData.push({
      Flavor: entry.flavor,
      Producto: entry.product,
      Cantidad: entry.quantity,
    });
  });

  const productionWs = XLSX.utils.json_to_sheet(productionData);
  XLSX.utils.book_append_sheet(wb, productionWs, "Producción");

  // Customer distribution sheet
  const customerData: Array<{
    Cliente: string;
    Sabor: string;
    Productos: string;
  }> = [];

  orders.forEach((order) => {
    const productsStr = order.products
      .map((p) => `${p.type}: ${p.quantity}`)
      .join(", ");
    customerData.push({
      Cliente: order.gymName,
      Sabor: order.flavor || "Sin sabor",
      Productos: productsStr,
    });
  });

  const customerWs = XLSX.utils.json_to_sheet(customerData);
  XLSX.utils.book_append_sheet(wb, customerWs, "Clientes");

  // Summary sheet
  const totalProduced = report.entries.reduce((sum, e) => sum + e.quantity, 0);
  const totalAssigned = orders.reduce(
    (sum, o) => sum + o.products.reduce((pSum, p) => pSum + p.quantity, 0),
    0
  );

  const summaryData = [
    { Concepto: "Fecha", Valor: report.date },
    { Concepto: "Versión", Valor: report.version },
    { Concepto: "Total Producción", Valor: totalProduced },
    { Concepto: "Total Asignado", Valor: totalAssigned },
    { Concepto: "Reconciliación", Valor: totalProduced - totalAssigned },
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen");

  return wb;
}

// Export report to file and share
export async function exportReport(
  report: ProductionReport,
  orders: Order[]
): Promise<{ success: boolean; message: string; fileUri?: string }> {
  try {
    const wb = generateReportWorkbook(report, orders);
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Convert to base64
    const base64 = Buffer.from(wbout).toString("base64");

    const fileDate = report.date;
    const fileName = `anaboli-production-${fileDate}-v${report.version}.xlsx`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Write file
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share if available
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: `Exportar ${fileName}`,
      });
    }

    return {
      success: true,
      message: "Reporte exportado exitosamente",
      fileUri,
    };
  } catch (error: any) {
    console.error("Error exporting report:", error);
    return {
      success: false,
      message: `Error al exportar: ${error.message}`,
    };
  }
}

// Export to data URI for web download
export function exportReportToDataURI(
  report: ProductionReport,
  orders: Order[]
): string {
  const wb = generateReportWorkbook(report, orders);
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
  return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
}
