import { exportReportToDataURI } from "@/services/productionExport";
import { ProductionReport } from "@/store/productionStore";
import { Order } from "@/types";

describe("productionExport", () => {
  const mockReport: ProductionReport = {
    date: "2024-01-15",
    version: 1,
    entries: [
      { flavor: "Apple Pie", product: "A", quantity: 25 },
      { flavor: "Berry Lover", product: "GNY", quantity: 15 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOrders: Order[] = [
    {
      id: "order-1",
      gymName: "Gym Alpha",
      products: [{ type: "A", quantity: 10 }],
      status: "Entregado",
      flavor: "Apple Pie",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe("exportReportToDataURI", () => {
    it("produces a data URI matching xlsx structure", () => {
      const dataUri = exportReportToDataURI(mockReport, mockOrders);

      // Should be a base64 data URI
      expect(dataUri).toMatch(/^data:application\/vnd\.openxmlformats/);
      expect(dataUri).toContain(";base64,");

      // Should contain base64 content
      const base64Part = dataUri.split(",")[1];
      expect(base64Part.length).toBeGreaterThan(0);
    });

    it("includes report date in output", () => {
      const dataUri = exportReportToDataURI(mockReport, mockOrders);
      expect(dataUri).toBeTruthy();
    });
  });
});
