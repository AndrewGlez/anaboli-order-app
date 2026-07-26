import { Order, FlavorCode } from "@/types";
import { isValidFlavor } from "@/constants/productionCatalog";

export function isLegacyOrder(order: Order): boolean {
  // Check if flavor is missing, null, undefined, or invalid
  if (!order.flavor) return true;
  return !isValidFlavor(order.flavor);
}

export function getLegacyFixLabel(): string {
  return "Corregir Sabor";
}

export function getLegacyBadgeLabel(): string {
  return "Datos legacy";
}

export function makeEligibleForReconciliation(order: Order, newFlavor: FlavorCode): Order {
  return {
    ...order,
    flavor: newFlavor,
    updatedAt: new Date().toISOString(),
  };
}

export function filterLegacyOrdersForDate(orders: Order[], dateStr: string): Order[] {
  return orders.filter((order) => {
    // Check if order is for the specified date
    const orderDate = order.createdAt.split("T")[0];
    if (orderDate !== dateStr) return false;

    // Check if it's a legacy order
    return isLegacyOrder(order);
  });
}
