import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InventoryStore, ProductType, ImportResult } from "@/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      addItem: (input) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...input,
              id: generateId(),
              updatedAt: new Date().toISOString(),
              lastAdjustmentReason: "initial",
            },
          ],
        })),

      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...patch, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearInventory: () => set({ items: [] }),

      consumeProducts: (products, reason = "order:create") => {
        const state = get();
        const items = [...state.items];

        // Check availability first
        const shortfall: Partial<Record<ProductType, number>> = {};
        for (const product of products) {
          const item = items.find((i) => i.type === product.type);
          const available = item?.quantity ?? 0;
          if (available < product.quantity) {
            shortfall[product.type] = product.quantity - available;
          }
        }

        if (Object.keys(shortfall).length > 0) {
          return { ok: false as const, reason: "insufficient_stock", shortfall };
        }

        // Decrement quantities
        const updatedItems = items.map((item) => {
          const product = products.find((p) => p.type === item.type);
          if (product) {
            return {
              ...item,
              quantity: item.quantity - product.quantity,
              updatedAt: new Date().toISOString(),
              lastAdjustmentReason: reason,
            };
          }
          return item;
        });

        set({ items: updatedItems });
        return { ok: true as const };
      },

      restoreProducts: (products, reason = "order:delete") => {
        set((state) => ({
          items: state.items.map((item) => {
            const product = products.find((p) => p.type === item.type);
            if (product) {
              return {
                ...item,
                quantity: item.quantity + product.quantity,
                updatedAt: new Date().toISOString(),
                lastAdjustmentReason: reason,
              };
            }
            return item;
          }),
        }));
        return { ok: true as const };
      },

      checkAvailability: (products) => {
        const state = get();
        const shortfall: Partial<Record<ProductType, number>> = {};

        for (const product of products) {
          const item = state.items.find((i) => i.type === product.type);
          const available = item?.quantity ?? 0;
          if (available < product.quantity) {
            shortfall[product.type] = product.quantity - available;
          }
        }

        if (Object.keys(shortfall).length > 0) {
          return { available: false as const, shortfall };
        }
        return { available: true as const };
      },

      importItems: (rows) => {
        const state = get();
        const results: ImportResult[] = [];
        const normalizedKeysSeen = new Map<string, number>();

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const normalizedKey = normalizeName(row.name);

          // Check for duplicate normalized names within the import
          if (normalizedKeysSeen.has(normalizedKey)) {
            results.push({
              row: i + 1,
              status: "error",
              error: "Duplicate name after normalization",
            });
            continue;
          }
          normalizedKeysSeen.set(normalizedKey, i);

          results.push({ row: i + 1, status: "ok" });
        }

        // Apply valid rows
        const updatedItems = [...state.items];
        for (let i = 0; i < rows.length; i++) {
          if (results[i].status !== "ok") continue;

          const row = rows[i];
          const normalizedKey = normalizeName(row.name);
          const existingIndex = updatedItems.findIndex(
            (item) => normalizeName(item.name) === normalizedKey
          );

          if (existingIndex >= 0) {
            // Merge: overwrite quantity, minThreshold, price, type; preserve id
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              type: row.type,
              quantity: row.quantity,
              minThreshold: row.minThreshold,
              price: row.price,
              updatedAt: new Date().toISOString(),
              lastAdjustmentReason: "excel:import",
            };
          } else {
            // Add new item
            updatedItems.push({
              id: generateId(),
              name: row.name,
              type: row.type,
              quantity: row.quantity,
              minThreshold: row.minThreshold,
              price: row.price,
              updatedAt: new Date().toISOString(),
              lastAdjustmentReason: "excel:import",
            });
          }
        }

        set({ items: updatedItems });
        return results;
      },

      exportItems: async () => {
        const { exportToXlsx } = require("@/services/web/fileExport");
        const state = get();

        const sorted = [...state.items].sort((a, b) =>
          normalizeName(a.name).localeCompare(normalizeName(b.name))
        );

        const data = sorted.map((item) => ({
          name: item.name,
          type: item.type,
          quantity: item.quantity,
          minThreshold: item.minThreshold,
          price: item.price,
        }));

        await exportToXlsx(data, "inventory.xlsx");
      },
    }),
    {
      name: "inventory-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          useInventoryStore.setState({ hydrated: true });
        }
      },
    }
  )
);
