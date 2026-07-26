import { Order, FlavorCode, ProductType, LegacyOrder } from "@/types";
import { FLAVOR_CODES } from "@/constants/productionCatalog";

export interface ProductionKey {
  flavor: FlavorCode;
  product: ProductType;
  customer: string;
}

export interface ProductionEntry {
  key: ProductionKey;
  produced: number;
  assigned: number;
}

export interface ReconciliationResult {
  balanced: boolean;
  delta: number;
}

export interface DaySummary {
  totalProduced: number;
  totalAssigned: number;
  flavorCounts: Record<FlavorCode, number>;
  productCounts: Record<ProductType, number>;
}

export interface CustomerDistribution {
  customer: string;
  flavor: FlavorCode;
  products: Array<{ type: ProductType; quantity: number }>;
}

// Select orders by flavor
export function selectProductionByFlavor(
  orders: Order[],
  flavor: FlavorCode
): Order[] {
  return orders.filter((order) => order.flavor === flavor);
}

// Calculate reconciliation between produced and assigned quantities
export function selectReconciliation(
  produced: number,
  assigned: number
): ReconciliationResult {
  const delta = produced - assigned;
  return {
    balanced: delta === 0,
    delta,
  };
}

// Calculate day summary from orders
export function selectDaySummary(orders: Order[]): DaySummary {
  const flavorCounts: Record<string, number> = {};
  const productCounts: Partial<Record<ProductType, number>> = {};
  let totalAssigned = 0;

  // Initialize flavor counts
  FLAVOR_CODES.forEach((flavor) => {
    flavorCounts[flavor] = 0;
  });

  orders.forEach((order) => {
    // Count by flavor
    if (order.flavor) {
      flavorCounts[order.flavor] = (flavorCounts[order.flavor] || 0) + 1;
    }

    // Count by product
    order.products.forEach((product) => {
      productCounts[product.type] = (productCounts[product.type] || 0) + product.quantity;
      totalAssigned += product.quantity;
    });
  });

  return {
    totalProduced: 0, // Will be set from production records
    totalAssigned,
    flavorCounts: flavorCounts as Record<FlavorCode, number>,
    productCounts: productCounts as Record<ProductType, number>,
  };
}

// Calculate customer distribution
export function selectCustomerDistribution(orders: Order[]): CustomerDistribution[] {
  const distribution: CustomerDistribution[] = orders.map((order) => ({
    customer: order.gymName,
    flavor: order.flavor,
    products: order.products,
  }));

  // Sort by customer name
  return distribution.sort((a, b) => a.customer.localeCompare(b.customer));
}

// Select legacy orders from a hydrated list
export function selectLegacyOrders(
  items: Array<Order | LegacyOrder>
): LegacyOrder[] {
  return items.filter((item): item is LegacyOrder => "legacyReason" in item);
}

// Check if there are any legacy orders
export function hasLegacyOrders(
  items: Array<Order | LegacyOrder>
): boolean {
  return items.some((item) => "legacyReason" in item);
}

// Filter valid orders (non-legacy)
export function selectValidOrders(
  items: Array<Order | LegacyOrder>
): Order[] {
  return items.filter((item): item is Order => !("legacyReason" in item));
}

// Get distribution summary
export function selectDistributionSummary(orders: Order[]) {
  const total = orders.length;
  const byFlavor: Record<string, number> = {};

  orders.forEach((order) => {
    const flavor = order.flavor || "Unknown";
    byFlavor[flavor] = (byFlavor[flavor] || 0) + 1;
  });

  return {
    total,
    byFlavor,
  };
}
