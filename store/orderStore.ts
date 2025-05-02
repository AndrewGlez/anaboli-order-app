import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order, OrderStore } from "@/types";

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [...state.orders, order],
        })),

      updateOrder: (id, updatedOrder) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  ...updatedOrder,
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
        })),

      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        })),

      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: "orders-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
