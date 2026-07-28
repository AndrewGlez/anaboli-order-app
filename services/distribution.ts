import {
  DateKey,
  CellKey,
  CellValues,
  CellEditContext,
  CellEditResult,
  DistributionMatrixModel,
  StockWarning,
  Order,
  Gym,
  ProductType,
  FlavorCode,
  Product,
} from "@/types";

// ---------- Date normalization ----------

/**
 * Convert a Date or date string to a DateKey using the LOCAL calendar date.
 * Avoids UTC-day split that shifts the day on devices with negative offsets.
 */
export function normalizeDate(value: Date | string): DateKey {
  const d = typeof value === "string" ? new Date(value) : value;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}` as DateKey;
}

// ---------- Input parsing ----------

export function parseCellInput(
  raw: string
): { ok: true; value: number } | { ok: false; reason: string } {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: true, value: 0 };
  }

  // Reject non-numeric
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, reason: "Solo se permiten números enteros no negativos" };
  }

  const value = parseInt(trimmed, 10);
  if (value < 0) {
    return { ok: false, reason: "No se permiten valores negativos" };
  }

  return { ok: true, value };
}

// ---------- Diff ----------

export function computeCellDiff(currentValue: number, newValue: number): number {
  return newValue - currentValue;
}

// ---------- Order lookup ----------

/**
 * Find orders matching a cell key. Returns in stable order: createdAt ASC, id ASC.
 * Only matches orders that have a gymId.
 */
export function findOrdersForCell(
  orders: Order[],
  key: CellKey
): Order[] {
  return orders
    .filter(
      (o) =>
        o.gymId &&
        o.gymId === key.gymId &&
        o.flavor === key.flavor &&
        normalizeDate(o.createdAt) === key.date
    )
    .sort((a, b) => {
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
    });
}

// ---------- Aggregation ----------

/**
 * Sum product quantities for one cell across matching orders.
 */
export function aggregateByCell(
  orders: Order[],
  key: CellKey
): number {
  return findOrdersForCell(orders, key).reduce((sum, order) => {
    const product = order.products.find((p) => p.type === key.productType);
    return sum + (product?.quantity ?? 0);
  }, 0);
}

/**
 * Build full distribution matrix in one indexed pass.
 */
export function aggregateMatrix(
  orders: Order[],
  gyms: Gym[],
  date: DateKey,
  allFlavors: readonly FlavorCode[],
  allProductTypes: readonly ProductType[]
): DistributionMatrixModel {
  const activeGyms = gyms.filter((g) => g.active);

  // Pre-index: build a map from "gymId|flavor|productType" → total quantity
  const index = new Map<string, number>();

  for (const order of orders) {
    if (!order.gymId) continue;
    if (normalizeDate(order.createdAt) !== date) continue;

    for (const product of order.products) {
      const key = `${order.gymId}|${order.flavor}|${product.type}`;
      index.set(key, (index.get(key) ?? 0) + product.quantity);
    }
  }

  // Build rows
  const rows: DistributionMatrixModel["rows"] = [];
  const gymTotals: Record<string, CellValues> = {};

  // Initialize gym totals
  for (const gym of activeGyms) {
    gymTotals[gym.id] = { A: 0, GNY: 0, C: 0, K: 0 };
  }

  for (const flavor of allFlavors) {
    const values: Record<string, CellValues> = {};
    const rowTotal: CellValues = { A: 0, GNY: 0, C: 0, K: 0 };

    for (const gym of activeGyms) {
      const cellValues: CellValues = { A: 0, GNY: 0, C: 0, K: 0 };
      for (const pt of allProductTypes) {
        const idxKey = `${gym.id}|${flavor}|${pt}`;
        const qty = index.get(idxKey) ?? 0;
        cellValues[pt] = qty;
        rowTotal[pt] += qty;
        gymTotals[gym.id][pt] += qty;
      }
      values[gym.id] = cellValues;
    }

    rows.push({ flavor, values, total: rowTotal });
  }

  // Grand total
  let grandTotal = 0;
  for (const pt of allProductTypes) {
    for (const gym of activeGyms) {
      grandTotal += gymTotals[gym.id][pt];
    }
  }

  return {
    date,
    gyms: activeGyms,
    rows,
    gymTotals,
    grandTotal,
  };
}

// ---------- Dependencies interface ----------

export interface DistributionDependencies {
  orders: Order[];
  gyms: Gym[];
  checkAvailability: (products: Product[]) =>
    | { available: true }
    | { available: false; shortfall: Partial<Record<ProductType, number>> };
  consumeProducts: (
    products: Product[],
    reason?: string
  ) => { ok: true } | { ok: false; reason: string; shortfall?: Partial<Record<ProductType, number>> };
  restoreProducts: (products: Product[], reason?: string) => { ok: true };
  addOrder: (order: Order) => { ok: true } | { ok: false; reason: string; shortfall?: Partial<Record<ProductType, number>> };
  updateOrder: (id: string, patch: Partial<Order>) => { ok: true } | { ok: false; reason: string; shortfall?: Partial<Record<ProductType, number>> };
  deleteOrder: (id: string) => { ok: true } | { ok: false; reason: string };
}

// ---------- Cell edit orchestration ----------

/**
 * Apply a cell edit via injected dependencies. Pure function — no Zustand imports.
 */
export function applyCellEdit(
  context: CellEditContext,
  deps: DistributionDependencies
): CellEditResult {
  const { gymId, flavor, productType, date, newValue, currentValue } = context;
  const diff = computeCellDiff(currentValue, newValue);

  // No change
  if (diff === 0) {
    return { ok: true, value: newValue, diff: 0 };
  }

  // Validate gym exists and is active
  const gym = deps.gyms.find((g) => g.id === gymId);
  if (!gym) {
    return {
      ok: false,
      value: currentValue,
      diff: 0,
      reason: "Gimnasio no encontrado",
    };
  }
  if (!gym.active) {
    return {
      ok: false,
      value: currentValue,
      diff: 0,
      reason: "El gimnasio no está activo",
    };
  }

  const matchingOrders = findOrdersForCell(deps.orders, {
    gymId,
    flavor,
    productType,
    date,
  });

  let warning: StockWarning | undefined;

  if (diff > 0) {
    // Increasing allocation — consume stock
    const productsToConsume: Product[] = [{ type: productType, quantity: diff }];
    const availability = deps.checkAvailability(productsToConsume);

    if (!availability.available) {
      const shortfallQty = availability.shortfall[productType] ?? diff;
      const availableQty = diff - shortfallQty;
      warning = {
        productType,
        requested: diff,
        available: availableQty,
        shortfall: shortfallQty,
      };
    }

    // Consume what's available (or all if stock is sufficient)
    const consumeResult = deps.consumeProducts(productsToConsume, `distribution:${gymId}:${flavor}:${date}`);

    if (matchingOrders.length > 0) {
      // Update first matching order
      const targetOrder = matchingOrders[0];
      const existingProduct = targetOrder.products.find((p) => p.type === productType);
      const newQuantity = (existingProduct?.quantity ?? 0) + diff;
      const updatedProducts = targetOrder.products.map((p) =>
        p.type === productType ? { ...p, quantity: newQuantity } : p
      );

      // If product didn't exist, add it
      if (!existingProduct) {
        updatedProducts.push({ type: productType, quantity: newQuantity });
      }

      deps.updateOrder(targetOrder.id, { products: updatedProducts });
    } else {
      // Create new order
      const newOrder: Order = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
        gymId,
        gymName: gym.name,
        products: [{ type: productType, quantity: diff }],
        status: "Entregado",
        flavor,
        createdAt: `${date}T12:00:00.000Z`,
        updatedAt: new Date().toISOString(),
      };
      deps.addOrder(newOrder);
    }

    return {
      ok: true,
      value: newValue,
      diff,
      warning,
    };
  }

  // diff < 0: decreasing allocation
  const decreaseQty = Math.abs(diff);
  let remaining = decreaseQty;

  // Decrease from matching orders in stable order
  for (const order of matchingOrders) {
    if (remaining <= 0) break;

    const existingProduct = order.products.find((p) => p.type === productType);
    if (!existingProduct || existingProduct.quantity <= 0) continue;

    const toRemove = Math.min(existingProduct.quantity, remaining);
    remaining -= toRemove;

    const updatedProducts = order.products
      .map((p) =>
        p.type === productType ? { ...p, quantity: p.quantity - toRemove } : p
      )
      .filter((p) => p.quantity > 0);

    if (updatedProducts.length === 0) {
      // All products gone — delete the order
      deps.deleteOrder(order.id);
    } else {
      deps.updateOrder(order.id, { products: updatedProducts });
    }

    // Restore stock
    deps.restoreProducts(
      [{ type: productType, quantity: toRemove }],
      `distribution-restore:${order.id}:${productType}`
    );
  }

  return {
    ok: true,
    value: newValue,
    diff,
  };
}
