import {
  selectProductionByFlavor,
  selectReconciliation,
  selectDaySummary,
  selectCustomerDistribution,
  selectLegacyOrders,
  selectValidOrders,
} from "@/services/productionSelectors";
import { Order, LegacyOrder, FlavorCode } from "@/types";

describe("productionSelectors", () => {
  const mockOrders: Order[] = [
    {
      id: "order-1",
      gymName: "Gym A",
      products: [
        { type: "A", quantity: 5 },
        { type: "C", quantity: 3 },
      ],
      status: "Entregado",
      flavor: "Apple Pie",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "order-2",
      gymName: "Gym B",
      products: [{ type: "GNY", quantity: 2 }],
      status: "Entregado",
      flavor: "Berry Lover",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "order-3",
      gymName: "Gym C",
      products: [{ type: "A", quantity: 10 }],
      status: "Entregado",
      flavor: "Apple Pie",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe("selectProductionByFlavor", () => {
    it("returns only Apple Pie orders", () => {
      const result = selectProductionByFlavor(mockOrders, "Apple Pie" as FlavorCode);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("order-1");
      expect(result[1].id).toBe("order-3");
    });

    it("returns empty array for flavor with no orders", () => {
      const result = selectProductionByFlavor(mockOrders, "Choco Power" as FlavorCode);
      expect(result).toHaveLength(0);
    });
  });

  describe("selectReconciliation", () => {
    it("returns balanced when produced equals assigned", () => {
      const result = selectReconciliation(100, 100);
      expect(result.balanced).toBe(true);
      expect(result.delta).toBe(0);
    });

    it("returns unbalanced when produced > assigned", () => {
      const result = selectReconciliation(100, 80);
      expect(result.balanced).toBe(false);
      expect(result.delta).toBe(20);
    });

    it("returns unbalanced when produced < assigned", () => {
      const result = selectReconciliation(80, 100);
      expect(result.balanced).toBe(false);
      expect(result.delta).toBe(-20);
    });

    it("blocks save when delta is not zero", () => {
      const result = selectReconciliation(100, 90);
      expect(result.balanced).toBe(false);
    });
  });

  describe("selectDaySummary", () => {
    it("computes correct totals", () => {
      const result = selectDaySummary(mockOrders);
      expect(result.totalAssigned).toBe(20); // 5+3+2+10
      expect(result.flavorCounts["Apple Pie"]).toBe(2);
      expect(result.flavorCounts["Berry Lover"]).toBe(1);
    });

    it("initializes all flavors to zero", () => {
      const result = selectDaySummary([]);
      expect(result.totalAssigned).toBe(0);
      expect(result.flavorCounts["Apple Pie"]).toBe(0);
    });
  });

  describe("selectCustomerDistribution", () => {
    it("returns sorted customer distribution", () => {
      const result = selectCustomerDistribution(mockOrders);
      expect(result).toHaveLength(3);
      expect(result[0].customer).toBe("Gym A");
      expect(result[0].flavor).toBe("Apple Pie");
    });
  });

  describe("selectLegacyOrders", () => {
    it("filters only legacy orders from mixed array", () => {
      const { flavor: _f1, ...orderWithoutFlavor1 } = mockOrders[0];
      const mixed: Array<Order | LegacyOrder> = [
        mockOrders[0],
        {
          order: orderWithoutFlavor1 as Omit<Order, "flavor">,
          legacyFlavor: null,
          legacyReason: "missing",
        },
        mockOrders[1],
      ];

      const result = selectLegacyOrders(mixed);
      expect(result).toHaveLength(1);
      expect(result[0].legacyReason).toBe("missing");
    });
  });

  describe("selectValidOrders", () => {
    it("filters only valid orders from mixed array", () => {
      const { flavor: _f2, ...orderWithoutFlavor2 } = mockOrders[0];
      const mixed: Array<Order | LegacyOrder> = [
        mockOrders[0],
        {
          order: orderWithoutFlavor2 as Omit<Order, "flavor">,
          legacyFlavor: null,
          legacyReason: "missing",
        },
        mockOrders[1],
      ];

      const result = selectValidOrders(mixed);
      expect(result).toHaveLength(2);
    });
  });
});
