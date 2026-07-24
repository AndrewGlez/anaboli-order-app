import { useInventoryStore } from "@/store/inventoryStore";

export function useHydrated(): boolean {
  return useInventoryStore((state) => state.hydrated);
}
