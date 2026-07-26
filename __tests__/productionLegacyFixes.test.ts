import { LegacyOrder, Order } from "@/types";
import { isLegacyOrder, getLegacyFixLabel, makeEligibleForReconciliation } from "@/components/production/legacyFixes";

describe("productionLegacyFixes", () => {
  describe("isLegacyOrder", () => {
    it("returns true for order without flavor", () => {
      const order = {
        id: "order-1",
        gymName: "Gym A",
        products: [{ type: "A" as const, quantity: 5 }],
        status: "Entregado" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Missing flavor
      };
      expect(isLegacyOrder(order as Order)).toBe(true);
    });

    it("returns true for order with null flavor", () => {
      const order = {
        id: "order-1",
        gymName: "Gym A",
        products: [{ type: "A" as const, quantity: 5 }],
        status: "Entregado" as const,
        flavor: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isLegacyOrder(order as unknown as Order)).toBe(true);
    });

    it("returns false for order with valid flavor", () => {
      const order: Order = {
        id: "order-1",
        gymName: "Gym A",
        products: [{ type: "A", quantity: 5 }],
        status: "Entregado",
        flavor: "Apple Pie",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isLegacyOrder(order)).toBe(false);
    });

    it("returns true for order with invalid flavor value", () => {
      const order = {
        id: "order-1",
        gymName: "Gym A",
        products: [{ type: "A" as const, quantity: 5 }],
        status: "Entregado" as const,
        flavor: "Mango Loco",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isLegacyOrder(order as unknown as Order)).toBe(true);
    });
  });

  describe("getLegacyFixLabel", () => {
    it("returns fix action label", () => {
      expect(getLegacyFixLabel()).toBe("Corregir Sabor");
    });
  });

  describe("makeEligibleForReconciliation", () => {
    it("makes legacy order eligible when flavor is fixed", () => {
      const legacyOrder: Order = {
        id: "order-1",
        gymName: "Gym A",
        products: [{ type: "A", quantity: 5 }],
        status: "Entregado",
        // missing flavor
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Order;

      const fixedOrder = makeEligibleForReconciliation(legacyOrder, "Apple Pie");

      expect(fixedOrder.flavor).toBe("Apple Pie");
      expect(fixedOrder.id).toBe(legacyOrder.id);
      expect(fixedOrder.products).toEqual(legacyOrder.products);
    });

    it("preserves order ID when fixing", () => {
      const legacyOrder: Order = {
        id: "legacy-123",
        gymName: "Gym B",
        products: [{ type: "GNY", quantity: 3 }],
        status: "Entregado",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Order;

      const fixedOrder = makeEligibleForReconciliation(legacyOrder, "Berry Lover");

      expect(fixedOrder.id).toBe("legacy-123");
    });

    it("updates timestamp when fixing", () => {
      const legacyOrder: Order = {
        id: "order-1",
        gymName: "Gym A",
        products: [{ type: "A", quantity: 5 }],
        status: "Entregado",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      } as Order;

      const fixedOrder = makeEligibleForReconciliation(legacyOrder, "Choco Power");
      const now = new Date().toISOString();

      // The updatedAt should be different from original
      expect(fixedOrder.updatedAt).not.toBe(legacyOrder.updatedAt);
    });
  });

  describe("filterLegacyOrdersForDate", () => {
    it("returns only legacy orders for a specific date", () => {
      const { filterLegacyOrdersForDate } = require("@/components/production/legacyFixes");
      const orders: Order[] = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A", quantity: 5 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "order-2",
          gymName: "Gym B",
          products: [{ type: "GNY", quantity: 3 }],
          status: "Entregado",
          createdAt: "2024-01-15T11:00:00Z",
          updatedAt: "2024-01-15T11:00:00Z",
        } as Order, // Missing flavor - legacy
      ];

      const legacyOrders = filterLegacyOrdersForDate(orders, "2024-01-15");
      expect(legacyOrders).toHaveLength(1);
      expect(legacyOrders[0].id).toBe("order-2");
    });

    it("returns empty array when no legacy orders exist", () => {
      const { filterLegacyOrdersForDate } = require("@/components/production/legacyFixes");
      const orders: Order[] = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A", quantity: 5 }],
          status: "Entregado",
          flavor: "Apple Pie",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
      ];

      const legacyOrders = filterLegacyOrdersForDate(orders, "2024-01-15");
      expect(legacyOrders).toHaveLength(0);
    });

    it("filters by date correctly", () => {
      const { filterLegacyOrdersForDate } = require("@/components/production/legacyFixes");
      const orders: Order[] = [
        {
          id: "order-1",
          gymName: "Gym A",
          products: [{ type: "A", quantity: 5 }],
          status: "Entregado",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        } as Order,
        {
          id: "order-2",
          gymName: "Gym B",
          products: [{ type: "GNY", quantity: 3 }],
          status: "Entregado",
          createdAt: "2024-01-16T11:00:00Z",
          updatedAt: "2024-01-16T11:00:00Z",
        } as Order,
      ];

      const legacyOrders = filterLegacyOrdersForDate(orders, "2024-01-15");
      expect(legacyOrders).toHaveLength(1);
      expect(legacyOrders[0].id).toBe("order-1");
    });
  });

  describe("getLegacyBadgeLabel", () => {
    it("returns appropriate badge text", () => {
      const { getLegacyBadgeLabel } = require("@/components/production/legacyFixes");
      expect(getLegacyBadgeLabel()).toContain("Datos");
      expect(getLegacyBadgeLabel()).toContain("legacy");
    });
  });
});
