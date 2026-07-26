import {
  selectProductionByFlavor,
  selectReconciliation,
  selectDaySummary,
  selectCustomerDistribution,
  selectDistributionSummary,
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

  describe("selectDistributionSummary", () => {
    it("aggregates per-customer assigned totals and overall totals", () => {
      const result = selectDistributionSummary(mockOrders);
      // mockOrders assigned: Gym A (5+3=8), Gym B (2), Gym C (10) => total 20
      expect(result.totalCustomers).toBe(3);
      expect(result.totalAssigned).toBe(20);
      expect(result.entries).toHaveLength(3);
    });

    it("computes each customer's share of the overall total", () => {
      const result = selectDistributionSummary(mockOrders);
      // Gym A: 8/20 = 40%, Gym C: 10/20 = 50%, Gym B: 2/20 = 10%
      const gymA = result.entries.find((e) => e.customer === "Gym A");
      const gymB = result.entries.find((e) => e.customer === "Gym B");
      const gymC = result.entries.find((e) => e.customer === "Gym C");
      expect(gymA?.share).toBeCloseTo(40, 5);
      expect(gymB?.share).toBeCloseTo(10, 5);
      expect(gymC?.share).toBeCloseTo(50, 5);
    });

    it("sorts entries by assigned total descending", () => {
      const result = selectDistributionSummary(mockOrders);
      // Gym C (10) > Gym A (8) > Gym B (2)
      expect(result.entries[0].customer).toBe("Gym C");
      expect(result.entries[1].customer).toBe("Gym A");
      expect(result.entries[2].customer).toBe("Gym B");
    });

    it("breaks down per-product counts for each customer", () => {
      const result = selectDistributionSummary(mockOrders);
      const gymA = result.entries.find((e) => e.customer === "Gym A");
      // Gym A ordered A:5 and C:3
      expect(gymA?.productCounts["A"]).toBe(5);
      expect(gymA?.productCounts["C"]).toBe(3);
    });

    it("returns zero totals and empty entries for empty orders", () => {
      const result = selectDistributionSummary([]);
      expect(result.totalCustomers).toBe(0);
      expect(result.totalAssigned).toBe(0);
      expect(result.entries).toEqual([]);
    });

    it("assigns zero share to each customer when total assigned is zero", () => {
      const zeroOrders: Order[] = [
        {
          id: "z1",
          gymName: "Gym Z",
          products: [{ type: "A", quantity: 0 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      const result = selectDistributionSummary(zeroOrders);
      expect(result.totalAssigned).toBe(0);
      expect(result.entries[0].share).toBe(0);
    });

    it("preserves customer flavor in each entry", () => {
      const result = selectDistributionSummary(mockOrders);
      const gymB = result.entries.find((e) => e.customer === "Gym B");
      expect(gymB?.flavor).toBe("Berry Lover");
    });
  });
});
