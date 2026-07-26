import { DistributionSummaryEntry } from "@/services/productionSelectors";
import { ProductType } from "@/types";

export function formatShare(share: number): string {
  return `${share.toFixed(1)}%`;
}

export function formatAssigned(total: number): string {
  return String(total);
}

export function sortEntriesByAssignedDesc(entries: DistributionSummaryEntry[]): DistributionSummaryEntry[] {
  return [...entries].sort((a, b) => b.assignedTotal - a.assignedTotal);
}

export function getCustomerRank(entries: DistributionSummaryEntry[], customerId: string): number {
  return entries.findIndex((e) => e.customer === customerId) + 1;
}

export function getProductCount(
  entry: DistributionSummaryEntry,
  productType: ProductType
): number {
  return entry.productCounts[productType] || 0;
}

export function isTopEntry(entry: DistributionSummaryEntry, rank = 1): boolean {
  return entry.assignedTotal > 0 && rank === 1;
}

export function getShareColor(share: number, primary: string, textLight: string): string {
  return share >= 25 ? primary : textLight;
}