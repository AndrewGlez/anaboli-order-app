import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order, FlavorCode, ProductType } from "@/types";
import { FLAVOR_CODES, PRODUCTION_PRODUCT_TYPES } from "@/constants/productionCatalog";
import {
  selectDaySummary,
  selectCustomerDistribution,
  selectReconciliation,
  DaySummary,
  CustomerDistribution,
  ReconciliationResult,
} from "@/services/productionSelectors";

export interface ProductionEntry {
  flavor: FlavorCode;
  product: ProductType;
  quantity: number;
}

export interface ProductionReport {
  date: string;
  version: number;
  entries: ProductionEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionStore {
  // State
  reports: ProductionReport[];
  currentDate: string;
  currentVersion: number | null;
  isReadOnly: boolean;

  // Actions
  saveReport: (date: string, quantities: Map<string, number>) => { ok: true } | { ok: false; reason: string };
  loadVersion: (date: string, version: number) => ProductionReport | null;
  setCurrentDate: (date: string) => void;
  getVersionsForDate: (date: string) => ProductionReport[];

  // Selectors (computed)
  selectDaySummary: (orders: Order[]) => DaySummary;
  selectCustomerDistribution: (orders: Order[]) => CustomerDistribution[];
  selectReconciliation: (produced: number, assigned: number) => ReconciliationResult;
  selectEntriesForDate: (date: string) => ProductionEntry[];
  selectCurrentReport: () => ProductionReport | null;
}

// Create a unique key for an entry
function createEntryKey(flavor: FlavorCode, product: ProductType): string {
  return `${flavor}:${product}`;
}

// Parse entry key back to flavor and product
function parseEntryKey(key: string): { flavor: FlavorCode; product: ProductType } | null {
  const parts = key.split(":");
  if (parts.length !== 2) return null;
  const [flavor, product] = parts;
  if (!FLAVOR_CODES.includes(flavor as FlavorCode)) return null;
  if (!PRODUCTION_PRODUCT_TYPES.includes(product as ProductType)) return null;
  return { flavor: flavor as FlavorCode, product: product as ProductType };
}

// Generate default entries for a date (all zeros)
function createDefaultEntries(): ProductionEntry[] {
  const entries: ProductionEntry[] = [];
  FLAVOR_CODES.forEach((flavor) => {
    PRODUCTION_PRODUCT_TYPES.forEach((product) => {
      entries.push({
        flavor,
        product,
        quantity: 0,
      });
    });
  });
  return entries;
}

// Get today's date as YYYY-MM-DD
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export const useProductionStore = create<ProductionStore>()(
  persist(
    (set, get) => ({
      reports: [],
      currentDate: getToday(),
      currentVersion: null,
      isReadOnly: false,

      saveReport: (date: string, quantities: Map<string, number>) => {
        try {
          const state = get();

          // Cannot save if viewing a historical version
          if (state.isReadOnly) {
            return { ok: false, reason: "Cannot modify historical versions" };
          }

          // Validate all quantities are non-negative integers
          for (const [key, qty] of quantities) {
            if (!Number.isInteger(qty) || qty < 0) {
              return { ok: false, reason: `Invalid quantity for ${key}: must be a non-negative integer` };
            }
          }

          // Get next version number for this date
          const versionsForDate = state.reports.filter((r) => r.date === date);
          const nextVersion = versionsForDate.length > 0
            ? Math.max(...versionsForDate.map((r) => r.version)) + 1
            : 1;

          // Convert quantities map to entries
          const entries: ProductionEntry[] = [];
          quantities.forEach((quantity, key) => {
            const parsed = parseEntryKey(key);
            if (parsed) {
              entries.push({
                flavor: parsed.flavor,
                product: parsed.product,
                quantity,
              });
            }
          });

          // Ensure all entries are present (fill missing with 0)
          const existingKeys = new Set(quantities.keys());
          FLAVOR_CODES.forEach((flavor) => {
            PRODUCTION_PRODUCT_TYPES.forEach((product) => {
              const key = createEntryKey(flavor, product);
              if (!existingKeys.has(key)) {
                entries.push({ flavor, product, quantity: 0 });
              }
            });
          });

          const newReport: ProductionReport = {
            date,
            version: nextVersion,
            entries,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((s) => ({
            reports: [...s.reports, newReport],
            currentVersion: nextVersion,
            isReadOnly: false,
          }));

          return { ok: true };
        } catch (error) {
          return { ok: false, reason: String(error) };
        }
      },

      loadVersion: (date: string, version: number) => {
        const state = get();
        const report = state.reports.find(
          (r) => r.date === date && r.version === version
        );

        if (report) {
          const versionsForDate = state.reports.filter((r) => r.date === date);
          const latestVersion = Math.max(...versionsForDate.map((r) => r.version));

          set({
            currentDate: date,
            currentVersion: version,
            isReadOnly: version !== latestVersion,
          });
        }

        return report || null;
      },

      setCurrentDate: (date: string) => {
        const state = get();
        const versionsForDate = state.reports.filter((r) => r.date === date);

        if (versionsForDate.length > 0) {
          // Load latest version
          const latest = versionsForDate.reduce((latest, current) =>
            current.version > latest.version ? current : latest
          );
          set({
            currentDate: date,
            currentVersion: latest.version,
            isReadOnly: false,
          });
        } else {
          // No existing reports for this date
          set({
            currentDate: date,
            currentVersion: null,
            isReadOnly: false,
          });
        }
      },

      getVersionsForDate: (date: string) => {
        const state = get();
        return state.reports
          .filter((r) => r.date === date)
          .sort((a, b) => a.version - b.version);
      },

      // Selectors
      selectDaySummary: (orders: Order[]) => selectDaySummary(orders),

      selectCustomerDistribution: (orders: Order[]) =>
        selectCustomerDistribution(orders),

      selectReconciliation: (produced: number, assigned: number) =>
        selectReconciliation(produced, assigned),

      selectEntriesForDate: (date: string) => {
        const state = get();
        const reports = state.reports.filter((r) => r.date === date);
        if (reports.length === 0) {
          return createDefaultEntries();
        }
        const latest = reports.reduce((latest, current) =>
          current.version > latest.version ? current : latest
        );
        return latest.entries;
      },

      selectCurrentReport: () => {
        const state = get();
        if (!state.currentVersion) return null;
        return (
          state.reports.find(
            (r) => r.date === state.currentDate && r.version === state.currentVersion
          ) || null
        );
      },
    }),
    {
      name: "production-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
