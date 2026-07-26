import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrderStore, Order, RawPersistedOrder, LegacyOrder, FlavorCode } from "@/types";
import { useInventoryStore } from "./inventoryStore";
import { isValidFlavor, assertFlavor, FLAVOR_CODES } from "@/constants/productionCatalog";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// Extended store interface with flavor validation
export interface ExtendedOrderStore extends OrderStore {
  hydrateOrder: (raw: RawPersistedOrder) => Order | LegacyOrder;
  validateFlavor: (flavor: unknown) => FlavorCode;
  fixOrderFlavor: (id: string, flavor: FlavorCode) => { ok: true } | { ok: false; reason: string };
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      gastos: [],
      lastUpdated: Date.now(),

      addOrder: (order) => {
        const inventoryStore = useInventoryStore.getState();
        if (!inventoryStore.hydrated) {
          return { ok: false, reason: "Inventory not hydrated" };
        }

        const availability = inventoryStore.checkAvailability(order.products);
        if (!availability.available) {
          return { ok: false, reason: "insufficient_stock", shortfall: availability.shortfall };
        }

        inventoryStore.consumeProducts(order.products, `order:${order.id}`);

        set((state) => ({
          orders: [...state.orders, order],
          lastUpdated: Date.now(),
        }));
        return { ok: true };
      },

      updateOrder: (id, updatedOrder) => {
        const state = get();
        const existingOrder = state.orders.find((o) => o.id === id);
        if (!existingOrder) return { ok: false, reason: "Order not found" };

        const inventoryStore = useInventoryStore.getState();
        if (!inventoryStore.hydrated) {
          return { ok: false, reason: "Inventory not hydrated" };
        }

        // Restore old products
        inventoryStore.restoreProducts(
          existingOrder.products,
          `order-update-restore:${id}`
        );

        // Check availability for new products
        const newProducts = updatedOrder.products || existingOrder.products;
        const availability = inventoryStore.checkAvailability(newProducts);

        if (!availability.available) {
          // Note: restore is NOT rolled back (documented atomicity gap)
          return { ok: false, reason: "insufficient_stock", shortfall: availability.shortfall };
        }

        // Consume new products
        inventoryStore.consumeProducts(newProducts, `order:update:${id}`);

        set((s) => ({
          orders: s.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  ...updatedOrder,
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
          lastUpdated: Date.now(),
        }));
        return { ok: true };
      },

      deleteOrder: (id) => {
        const state = get();
        const order = state.orders.find((o) => o.id === id);
        if (!order) return { ok: false, reason: "Order not found" };

        const inventoryStore = useInventoryStore.getState();
        if (!inventoryStore.hydrated) {
          return { ok: false, reason: "Inventory not hydrated" };
        }

        // Restore products
        inventoryStore.restoreProducts(order.products, `order:delete:${id}`);

        set((s) => ({
          orders: s.orders.filter((o) => o.id !== id),
          lastUpdated: Date.now(),
        }));
        return { ok: true };
      },

      clearOrders: () => set({ orders: [], lastUpdated: Date.now() }),

      setOrders: (orders) => set({ orders, lastUpdated: Date.now() }),

      // Gastos (expenses) management
      addGasto: (gasto) =>
        set((state) => ({
          gastos: [...state.gastos, gasto],
          lastUpdated: Date.now(),
        })),

      updateGasto: (id, updatedGasto) =>
        set((state) => ({
          gastos: state.gastos.map((gasto) =>
            gasto.id === id
              ? {
                  ...gasto,
                  ...updatedGasto,
                }
              : gasto
          ),
          lastUpdated: Date.now(),
        })),

      deleteGasto: (id) =>
        set((state) => ({
          gastos: state.gastos.filter((gasto) => gasto.id !== id),
          lastUpdated: Date.now(),
        })),

      clearGastos: () => set({ gastos: [], lastUpdated: Date.now() }),

      getOrdersAsJSON: () => {
        try {
          const orders = get().orders;
          return JSON.stringify(orders, null, 2);
        } catch (error) {
          console.error("Error getting orders as JSON:", error);
          return "[]";
        }
      },

      importOrdersFromJSON: (json) => {
        try {
          const parsedOrders = JSON.parse(json);

          // Validate that it's an array
          if (!Array.isArray(parsedOrders)) {
            return {
              success: false,
              message:
                "Formato JSON inválido. Se esperaba un array de pedidos.",
            };
          }

          // Validate basic structure of each order
          for (const order of parsedOrders) {
            if (!order.id || !order.gymName || !Array.isArray(order.products)) {
              return {
                success: false,
                message:
                  "Formato de pedidos inválido. Faltan campos requeridos.",
              };
            }

            // Validate flavor - must be a valid FlavorCode
            if (!isValidFlavor(order.flavor)) {
              return {
                success: false,
                message: `Flavor inválido para el pedido ${order.id}: '${order.flavor}'. Debe ser uno de: ${FLAVOR_CODES.join(", ")}`,
              };
            }

            // Validate products - each product must have valid type and quantity
            for (const product of order.products) {
              const validTypes = ["A", "GNY", "C", "K"];
              if (!validTypes.includes(product.type)) {
                return {
                  success: false,
                  message: `Tipo de producto inválido para el pedido ${order.id}: '${product.type}'. Debe ser uno de: ${validTypes.join(", ")}`,
                };
              }
              if (typeof product.quantity !== "number" || product.quantity < 0 || !Number.isInteger(product.quantity)) {
                return {
                  success: false,
                  message: `Cantidad inválida para el pedido ${order.id}: '${product.quantity}'. Debe ser un entero no negativo.`,
                };
              }
            }
          }

          // Import the orders using a state update function to ensure reactivity
          set((state) => {
            // Force a complete state replacement to ensure subscribers update
            return {
              ...state,
              orders: [...parsedOrders],
              lastUpdated: Date.now(),
            };
          });

          return {
            success: true,
            message: `${parsedOrders.length} pedidos importados correctamente.`,
          };
        } catch (error: any) {
          console.error("Error importing orders from JSON:", error);
          return {
            success: false,
            message: `Error al importar: ${error.message}`,
          };
        }
      },

      exportOrdersToShare: async () => {
        try {
          const orders = get().orders;
          const fileDate = new Date().toISOString().split("T")[0];
          const fileName = `anaboli-orders-${fileDate}.json`;
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;

          await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(orders, null, 2),
            { encoding: FileSystem.EncodingType.UTF8 }
          );

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
            return {
              success: true,
              message: "Pedidos exportados exitosamente",
            };
          } else {
            return {
              success: false,
              message:
                "La función de compartir no está disponible en este dispositivo",
            };
          }
        } catch (error: any) {
          console.error("Error exporting orders:", error);
          return {
            success: false,
            message: `Error al exportar: ${error.message}`,
          };
        }
      },

      // Hydration: converts raw persisted order to Order or LegacyOrder
      hydrateOrder: (raw: RawPersistedOrder): Order | LegacyOrder => {
        // Check if flavor exists and is valid
        if (!raw.flavor || !isValidFlavor(raw.flavor)) {
          // Destructure to exclude the flavor property
          const { flavor: _flavor, ...orderWithoutFlavor } = raw;
          const legacyOrder: LegacyOrder = {
            order: orderWithoutFlavor as Omit<Order, "flavor">,
            legacyFlavor: raw.flavor,
            legacyReason: raw.flavor === null || raw.flavor === undefined || raw.flavor === "" ? "missing" : "invalid",
          };
          return legacyOrder;
        }

        // Valid order with flavor
        const order: Order = {
          ...raw,
          flavor: raw.flavor as FlavorCode,
        };
        return order;
      },

      // Validate flavor and return FlavorCode or throw
      validateFlavor: (flavor: unknown): FlavorCode => {
        return assertFlavor(flavor);
      },

      // Fix an order's flavor (migrate legacy order to valid order)
      fixOrderFlavor: (id: string, flavor: FlavorCode): { ok: true } | { ok: false; reason: string } => {
        try {
          const state = get();
          const existingOrder = state.orders.find((o) => o.id === id);
          if (!existingOrder) return { ok: false, reason: "Order not found" };

          // Update the order with the new valid flavor
          set((s) => ({
            orders: s.orders.map((order) =>
              order.id === id
                ? { ...order, flavor, updatedAt: new Date().toISOString() }
                : order
            ),
            lastUpdated: Date.now(),
          }));
          return { ok: true };
        } catch (error) {
          return { ok: false, reason: String(error) };
        }
      },
    }),
    {
      name: "orders-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
