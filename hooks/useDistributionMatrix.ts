import { useMemo } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useGymStore } from "@/store/gymStore";
import { aggregateMatrix } from "@/services/distribution";
import { DateKey, DistributionMatrixModel } from "@/types";
import { FLAVOR_CODES } from "@/constants/productionCatalog";

const ALL_PRODUCT_TYPES = ["A", "GNY", "C", "K"] as const;

export function useDistributionMatrix(selectedDate: DateKey): DistributionMatrixModel {
  const orders = useOrderStore((s) => s.orders);
  const gyms = useGymStore((s) => s.gyms);

  return useMemo(
    () => aggregateMatrix(orders, gyms, selectedDate, FLAVOR_CODES, ALL_PRODUCT_TYPES),
    [orders, gyms, selectedDate]
  );
}
