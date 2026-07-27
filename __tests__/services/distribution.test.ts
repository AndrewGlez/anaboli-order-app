import {
  normalizeDate,
  parseCellInput,
  computeCellDiff,
  findOrdersForCell,
  aggregateByCell,
  aggregateMatrix,
  applyCellEdit,
  DistributionDependencies,
} from "@/services/distribution";
import { Order, Gym, ProductType, CellEditContext } from "@/types";
import { FLAVOR_CODES } from "@/constants/productionCatalog";

const ALL_PRODUCT_TYPES: readonly ProductType[] = ["A", "GNY", "C", "K"] as const;

function makeOrder(overrides: Partial<Order>): Order {
  return {
    id: "order-1",
    gymId: "gym-1",
    gymName: "Gym",
    products: [{ type: "A", quantity: 5 }],
    status: "Entregado",
    flavor: "Apple Pie",
    createdAt: "2025-07-27T12:00:00.000Z",
    updatedAt: "2025-07-27T12:00:00.000Z",
    ...overrides,
  };
}

function makeGym(overrides: Partial<Gym>): Gym {
  return {
    id: "gym-1",
    name: "Gym Alpha",
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeDeps(overrides: Partial<DistributionDependencies> = {}): DistributionDependencies {
  return {
    orders: [],
    gyms: [makeGym({})],
    checkAvailability: jest.fn(() => ({ available: true })),
    consumeProducts: jest.fn(() => ({ ok: true as const })),
    restoreProducts: jest.fn(() => ({ ok: true as const })),
    addOrder: jest.fn(() => ({ ok: true as const })),
    updateOrder: jest.fn(() => ({ ok: true as const })),
    deleteOrder: jest.fn(() => ({ ok: true as const })),
    ...overrides,
  };
}

describe("distribution service", () => {
  describe("normalizeDate", () => {
    it("converts Date to YYYY-MM-DD using local date", () => {
      const d = new Date(2025, 0, 15); // Jan 15, 2025 local
      expect(normalizeDate(d)).toBe("2025-01-15");
    });

    it("converts ISO string to YYYY-MM-DD", () => {
      expect(normalizeDate("2025-07-27T03:00:00.000Z")).toBeDefined();
      // The exact date depends on timezone, but it should be a valid DateKey
      const result = normalizeDate("2025-07-27T03:00:00.000Z");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("handles midnight date boundary", () => {
      const d = new Date(2025, 11, 31, 23, 59, 59);
      expect(normalizeDate(d)).toBe("2025-12-31");
    });
  });

  describe("parseCellInput", () => {
    it("returns 0 for empty string", () => {
      expect(parseCellInput("")).toEqual({ ok: true, value: 0 });
    });

    it("returns 0 for whitespace-only string", () => {
      expect(parseCellInput("   ")).toEqual({ ok: true, value: 0 });
    });

    it("parses valid integer", () => {
      expect(parseCellInput("42")).toEqual({ ok: true, value: 42 });
    });

    it("parses zero", () => {
      expect(parseCellInput("0")).toEqual({ ok: true, value: 0 });
    });

    it("rejects negative numbers", () => {
      const result = parseCellInput("-5");
      expect(result.ok).toBe(false);
    });

    it("rejects decimal numbers", () => {
      const result = parseCellInput("3.14");
      expect(result.ok).toBe(false);
    });

    it("rejects non-numeric strings", () => {
      const result = parseCellInput("abc");
      expect(result.ok).toBe(false);
    });

    it("rejects mixed alphanumeric", () => {
      const result = parseCellInput("12abc");
      expect(result.ok).toBe(false);
    });
  });

  describe("computeCellDiff", () => {
    it("computes positive diff", () => {
      expect(computeCellDiff(3, 7)).toBe(4);
    });

    it("computes negative diff", () => {
      expect(computeCellDiff(7, 3)).toBe(-4);
    });

    it("computes zero diff", () => {
      expect(computeCellDiff(5, 5)).toBe(0);
    });

    it("diff from zero", () => {
      expect(computeCellDiff(0, 10)).toBe(10);
    });

    it("diff to zero", () => {
      expect(computeCellDiff(10, 0)).toBe(-10);
    });
  });

  describe("findOrdersForCell", () => {
    it("finds matching orders", () => {
      const orders = [
        makeOrder({ id: "o1", gymId: "g1", flavor: "Apple Pie", createdAt: "2025-07-27T12:00:00.000Z" }),
        makeOrder({ id: "o2", gymId: "g2", flavor: "Apple Pie", createdAt: "2025-07-27T12:00:00.000Z" }),
      ];
      const result = findOrdersForCell(orders, {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("o1");
    });

    it("returns empty for no match", () => {
      const orders = [
        makeOrder({ id: "o1", gymId: "g1", flavor: "Berry Lover" }),
      ];
      const result = findOrdersForCell(orders, {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
      });
      expect(result).toHaveLength(0);
    });

    it("excludes orders without gymId", () => {
      const orders = [
        makeOrder({ id: "o1", gymId: "", flavor: "Apple Pie" }),
      ];
      const result = findOrdersForCell(orders, {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
      });
      expect(result).toHaveLength(0);
    });

    it("sorts by createdAt then id for duplicates", () => {
      const orders = [
        makeOrder({ id: "o2", gymId: "g1", flavor: "Apple Pie", createdAt: "2025-07-27T10:00:00.000Z" }),
        makeOrder({ id: "o1", gymId: "g1", flavor: "Apple Pie", createdAt: "2025-07-27T08:00:00.000Z" }),
        makeOrder({ id: "o3", gymId: "g1", flavor: "Apple Pie", createdAt: "2025-07-27T08:00:00.000Z" }),
      ];
      const result = findOrdersForCell(orders, {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
      });
      expect(result[0].id).toBe("o1");
      expect(result[1].id).toBe("o3");
      expect(result[2].id).toBe("o2");
    });

    it("filters by date using local normalization", () => {
      const orders = [
        makeOrder({ id: "o1", gymId: "g1", flavor: "Apple Pie", createdAt: "2025-07-27T03:00:00.000Z" }),
      ];
      // This should match because normalizeDate localises the date
      const result = findOrdersForCell(orders, {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: normalizeDate("2025-07-27T03:00:00.000Z"),
      });
      expect(result).toHaveLength(1);
    });
  });

  describe("aggregateByCell", () => {
    it("sums quantities across multiple orders", () => {
      const orders = [
        makeOrder({ id: "o1", gymId: "g1", flavor: "Apple Pie", products: [{ type: "A", quantity: 3 }], createdAt: "2025-07-27T08:00:00.000Z" }),
        makeOrder({ id: "o2", gymId: "g1", flavor: "Apple Pie", products: [{ type: "A", quantity: 7 }], createdAt: "2025-07-27T10:00:00.000Z" }),
      ];
      const result = aggregateByCell(orders, {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
      });
      expect(result).toBe(10);
    });

    it("returns 0 for no matching orders", () => {
      const result = aggregateByCell([], {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
      });
      expect(result).toBe(0);
    });
  });

  describe("aggregateMatrix", () => {
    it("builds full matrix with all flavors and product types", () => {
      const gyms = [makeGym({ id: "g1", name: "Alpha", active: true })];
      const orders = [
        makeOrder({
          gymId: "g1",
          flavor: "Apple Pie",
          products: [
            { type: "A", quantity: 2 },
            { type: "GNY", quantity: 3 },
          ],
          createdAt: "2025-07-27T12:00:00.000Z",
        }),
      ];

      const matrix = aggregateMatrix(orders, gyms, "2025-07-27", FLAVOR_CODES, ALL_PRODUCT_TYPES);

      expect(matrix.gyms).toHaveLength(1);
      expect(matrix.rows).toHaveLength(11); // all flavors

      const applePieRow = matrix.rows.find((r) => r.flavor === "Apple Pie");
      expect(applePieRow).toBeDefined();
      expect(applePieRow!.values["g1"].A).toBe(2);
      expect(applePieRow!.values["g1"].GNY).toBe(3);
      expect(applePieRow!.values["g1"].C).toBe(0);
      expect(applePieRow!.values["g1"].K).toBe(0);
      expect(applePieRow!.total.A).toBe(2);
      expect(applePieRow!.total.GNY).toBe(3);
    });

    it("excludes inactive gyms", () => {
      const gyms = [
        makeGym({ id: "g1", name: "Active", active: true }),
        makeGym({ id: "g2", name: "Inactive", active: false }),
      ];
      const matrix = aggregateMatrix([], gyms, "2025-07-27", FLAVOR_CODES, ALL_PRODUCT_TYPES);
      expect(matrix.gyms).toHaveLength(1);
      expect(matrix.gyms[0].id).toBe("g1");
    });

    it("excludes orders without gymId", () => {
      const gyms = [makeGym({ id: "g1", name: "Alpha", active: true })];
      const orders = [
        makeOrder({ gymId: "", products: [{ type: "A", quantity: 5 }], createdAt: "2025-07-27T12:00:00.000Z" }),
      ];
      const matrix = aggregateMatrix(orders, gyms, "2025-07-27", FLAVOR_CODES, ALL_PRODUCT_TYPES);
      const applePieRow = matrix.rows.find((r) => r.flavor === "Apple Pie")!;
      expect(applePieRow.values["g1"].A).toBe(0);
    });

    it("computes gym totals and grand total", () => {
      const gyms = [makeGym({ id: "g1", name: "Alpha", active: true })];
      const orders = [
        makeOrder({
          gymId: "g1",
          flavor: "Apple Pie",
          products: [{ type: "A", quantity: 5 }],
          createdAt: "2025-07-27T12:00:00.000Z",
        }),
        makeOrder({
          gymId: "g1",
          flavor: "Berry Lover",
          products: [{ type: "C", quantity: 3 }],
          createdAt: "2025-07-27T12:00:00.000Z",
        }),
      ];
      const matrix = aggregateMatrix(orders, gyms, "2025-07-27", FLAVOR_CODES, ALL_PRODUCT_TYPES);
      expect(matrix.gymTotals["g1"].A).toBe(5);
      expect(matrix.gymTotals["g1"].C).toBe(3);
      expect(matrix.grandTotal).toBe(8);
    });

    it("returns zero matrix for empty orders", () => {
      const gyms = [makeGym({ id: "g1", name: "Alpha", active: true })];
      const matrix = aggregateMatrix([], gyms, "2025-07-27", FLAVOR_CODES, ALL_PRODUCT_TYPES);
      expect(matrix.grandTotal).toBe(0);
      for (const row of matrix.rows) {
        expect(row.total.A).toBe(0);
        expect(row.total.GNY).toBe(0);
        expect(row.total.C).toBe(0);
        expect(row.total.K).toBe(0);
      }
    });

    it("returns empty gyms for empty gym catalog", () => {
      const matrix = aggregateMatrix([], [], "2025-07-27", FLAVOR_CODES, ALL_PRODUCT_TYPES);
      expect(matrix.gyms).toHaveLength(0);
      expect(matrix.grandTotal).toBe(0);
    });
  });

  describe("applyCellEdit", () => {
    it("returns ok with no diff when value unchanged", () => {
      const deps = makeDeps();
      const context: CellEditContext = {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 5,
        currentValue: 5,
      };
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(true);
      expect(result.diff).toBe(0);
    });

    it("creates new order for positive diff when no matching order", () => {
      const deps = makeDeps({
        orders: [],
        gyms: [makeGym({ id: "g1", name: "Gym" })],
      });
      const context: CellEditContext = {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 5,
        currentValue: 0,
      };
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(true);
      expect(result.diff).toBe(5);
      expect(deps.addOrder).toHaveBeenCalled();
      const addedOrder = (deps.addOrder as jest.Mock).mock.calls[0][0];
      expect(addedOrder.gymId).toBe("g1");
      expect(addedOrder.gymName).toBe("Gym");
      expect(addedOrder.flavor).toBe("Apple Pie");
      expect(addedOrder.products).toEqual([{ type: "A", quantity: 5 }]);
      expect(addedOrder.status).toBe("Entregado");
    });

    it("updates existing order for positive diff", () => {
      const existingOrder = makeOrder({
        id: "o1",
        gymId: "g1",
        flavor: "Apple Pie",
        products: [{ type: "A", quantity: 3 }],
        createdAt: "2025-07-27T12:00:00.000Z",
      });
      const deps = makeDeps({
        orders: [existingOrder],
        gyms: [makeGym({ id: "g1" })],
      });
      const context: CellEditContext = {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 7,
        currentValue: 3,
      };
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(true);
      expect(result.diff).toBe(4);
      expect(deps.updateOrder).toHaveBeenCalledWith("o1", {
        products: [{ type: "A", quantity: 7 }],
      });
    });

    it("returns error for non-existent gym", () => {
      const deps = makeDeps({ gyms: [] });
      const context: CellEditContext = {
        gymId: "missing",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 5,
        currentValue: 0,
      };
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("Gimnasio no encontrado");
    });

    it("returns error for inactive gym", () => {
      const deps = makeDeps({
        gyms: [makeGym({ id: "g1", active: false })],
      });
      const context: CellEditContext = {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 5,
        currentValue: 0,
      };
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("no está activo");
    });

    it("decreases existing order quantity", () => {
      const existingOrder = makeOrder({
        id: "o1",
        gymId: "g1",
        flavor: "Apple Pie",
        products: [{ type: "A", quantity: 10 }],
        createdAt: "2025-07-27T12:00:00.000Z",
      });
      const deps = makeDeps({
        orders: [existingOrder],
        gyms: [makeGym({ id: "g1" })],
      });
      const context: CellEditContext = {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 4,
        currentValue: 10,
      };
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(true);
      expect(result.diff).toBe(-6);
      expect(deps.updateOrder).toHaveBeenCalledWith("o1", {
        products: [{ type: "A", quantity: 4 }],
      });
      expect(deps.restoreProducts).toHaveBeenCalledWith(
        [{ type: "A", quantity: 6 }],
        expect.stringContaining("distribution-restore")
      );
    });

    it("deletes order when all products become zero", () => {
      const existingOrder = makeOrder({
        id: "o1",
        gymId: "g1",
        flavor: "Apple Pie",
        products: [{ type: "A", quantity: 5 }],
        createdAt: "2025-07-27T12:00:00.000Z",
      });
      const deps = makeDeps({
        orders: [existingOrder],
        gyms: [makeGym({ id: "g1" })],
      });
      const context: CellEditContext = {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 0,
        currentValue: 5,
      };
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(true);
      expect(result.diff).toBe(-5);
      expect(deps.deleteOrder).toHaveBeenCalledWith("o1");
    });

    it("returns warning when stock insufficient but still persists", () => {
      const deps = makeDeps({
        orders: [],
        gyms: [makeGym({ id: "g1" })],
        checkAvailability: jest.fn(() => ({
          available: false as const,
          shortfall: { A: 3 },
        })),
        consumeProducts: jest.fn(() => ({ ok: true as const })),
      });
      const context: CellEditContext = {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 10,
        currentValue: 0,
      };
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning!.productType).toBe("A");
      expect(result.warning!.requested).toBe(10);
      expect(result.warning!.shortfall).toBe(3);
      expect(result.warning!.available).toBe(7);
      // Order should still be created
      expect(deps.addOrder).toHaveBeenCalled();
    });

    it("handles multiple legacy orders deterministically", () => {
      const orders = [
        makeOrder({ id: "o2", gymId: "g1", flavor: "Apple Pie", products: [{ type: "A", quantity: 3 }], createdAt: "2025-07-27T12:00:00.000Z" }),
        makeOrder({ id: "o1", gymId: "g1", flavor: "Apple Pie", products: [{ type: "A", quantity: 2 }], createdAt: "2025-07-27T10:00:00.000Z" }),
      ];
      const deps = makeDeps({ orders, gyms: [makeGym({ id: "g1" })] });
      const context: CellEditContext = {
        gymId: "g1",
        flavor: "Apple Pie",
        productType: "A",
        date: "2025-07-27",
        newValue: 2,
        currentValue: 5,
      };
      // Decrease by 3 — should remove from o1 first (sorted by createdAt ASC)
      const result = applyCellEdit(context, deps);
      expect(result.ok).toBe(true);
      expect(result.diff).toBe(-3);
      // o1 had 2 → all removed → deleted; o2 had 3 → 1 removed → updated with 2
      expect(deps.deleteOrder).toHaveBeenCalledWith("o1");
      expect(deps.updateOrder).toHaveBeenCalledWith("o2", {
        products: [{ type: "A", quantity: 2 }],
      });
    });
  });
});
