import { useState, useCallback, useRef } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useGymStore } from "@/store/gymStore";
import { useInventoryStore } from "@/store/inventoryStore";
import {
  applyCellEdit,
  parseCellInput,
  aggregateByCell,
  findOrdersForCell,
} from "@/services/distribution";
import {
  DateKey,
  FlavorCode,
  ProductType,
  CellEditResult,
  StockWarning,
} from "@/types";

export interface CellEditController {
  value: number;
  isSaving: boolean;
  warning?: StockWarning;
  error?: string;
  commit: (rawValue: string) => Promise<CellEditResult>;
  rollback: () => void;
}

export function useCellEdit(
  gymId: string,
  flavor: FlavorCode,
  productType: ProductType,
  date: DateKey
): CellEditController {
  const [isSaving, setIsSaving] = useState(false);
  const [warning, setWarning] = useState<StockWarning | undefined>();
  const [error, setError] = useState<string | undefined>();
  const commitLockRef = useRef(false);

  // Derive current value from store state
  const currentValue = (() => {
    const orders = useOrderStore.getState().orders;
    return aggregateByCell(orders, { gymId, flavor, productType, date });
  })();

  const [localValue, setLocalValue] = useState<number>(currentValue);

  const commit = useCallback(
    async (rawValue: string): Promise<CellEditResult> => {
      if (commitLockRef.current) {
        return { ok: false, value: localValue, diff: 0, reason: "Save in progress" };
      }

      commitLockRef.current = true;
      setIsSaving(true);
      setError(undefined);
      setWarning(undefined);

      try {
        const parsed = parseCellInput(rawValue);
        if (!parsed.ok) {
          setError(parsed.reason);
          return { ok: false, value: localValue, diff: 0, reason: parsed.reason };
        }

        const newValue = parsed.value;
        if (newValue === localValue) {
          return { ok: true, value: newValue, diff: 0 };
        }

        // Compute diff from current store value
        const storeOrders = useOrderStore.getState().orders;
        const storeValue = aggregateByCell(storeOrders, { gymId, flavor, productType, date });

        const gyms = useGymStore.getState().gyms;
        const inventoryStore = useInventoryStore.getState();

        const result = applyCellEdit(
          {
            gymId,
            flavor,
            productType,
            date,
            newValue,
            currentValue: storeValue,
          },
          {
            orders: storeOrders,
            gyms,
            checkAvailability: inventoryStore.checkAvailability,
            consumeProducts: inventoryStore.consumeProducts,
            restoreProducts: inventoryStore.restoreProducts,
            addOrder: useOrderStore.getState().addOrderDistributable,
            updateOrder: useOrderStore.getState().updateOrder,
            deleteOrder: useOrderStore.getState().deleteOrder,
          }
        );

        if (result.ok) {
          setLocalValue(newValue);
          setWarning(result.warning);
        } else {
          setLocalValue(storeValue);
          setError(result.reason);
        }

        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        setError(msg);
        return { ok: false, value: localValue, diff: 0, reason: msg };
      } finally {
        setIsSaving(false);
        commitLockRef.current = false;
      }
    },
    [gymId, flavor, productType, date, localValue]
  );

  const rollback = useCallback(() => {
    const storeOrders = useOrderStore.getState().orders;
    const storeValue = aggregateByCell(storeOrders, { gymId, flavor, productType, date });
    setLocalValue(storeValue);
    setError(undefined);
    setWarning(undefined);
  }, [gymId, flavor, productType, date]);

  return {
    value: localValue,
    isSaving,
    warning,
    error,
    commit,
    rollback,
  };
}
