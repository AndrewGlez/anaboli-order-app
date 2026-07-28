import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gym, GymInput, GymPatch, MutationResult, GymStore } from "@/types";
import { useOrderStore } from "./orderStore";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export const useGymStore = create<GymStore>()(
  persist(
    (set, get) => ({
      gyms: [],
      hydrated: false,

      addGym: (input: GymInput) => {
        const trimmedName = input.name.trim();
        if (!trimmedName) {
          return { ok: false as const, reason: "El nombre no puede estar vacío" };
        }

        const existing = get().gyms.find(
          (g) => normalizeName(g.name) === normalizeName(trimmedName)
        );
        if (existing) {
          return { ok: false as const, reason: "Ya existe un gimnasio con ese nombre" };
        }

        const id = generateId();
        const now = new Date().toISOString();
        const gym: Gym = {
          id,
          name: trimmedName,
          active: input.active,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ gyms: [...state.gyms, gym] }));
        return { ok: true as const, id };
      },

      updateGym: (id, patch: GymPatch) => {
        const state = get();
        const gym = state.gyms.find((g) => g.id === id);
        if (!gym) return { ok: false, reason: "Gimnasio no encontrado" };

        if (patch.name !== undefined) {
          const trimmedName = patch.name.trim();
          if (!trimmedName) {
            return { ok: false, reason: "El nombre no puede estar vacío" };
          }
          const duplicate = state.gyms.find(
            (g) =>
              g.id !== id &&
              normalizeName(g.name) === normalizeName(trimmedName)
          );
          if (duplicate) {
            return { ok: false, reason: "Ya existe un gimnasio con ese nombre" };
          }
          patch = { ...patch, name: trimmedName };
        }

        set((s) => ({
          gyms: s.gyms.map((g) =>
            g.id === id
              ? { ...g, ...patch, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
        return { ok: true };
      },

      toggleGymActive: (id) => {
        const state = get();
        const gym = state.gyms.find((g) => g.id === id);
        if (!gym) return { ok: false, reason: "Gimnasio no encontrado" };

        set((s) => ({
          gyms: s.gyms.map((g) =>
            g.id === id
              ? { ...g, active: !g.active, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
        return { ok: true };
      },

      deleteGym: (id) => {
        const state = get();
        const gym = state.gyms.find((g) => g.id === id);
        if (!gym) return { ok: false, reason: "Gimnasio no encontrado" };

        const orders = useOrderStore.getState().orders;
        const hasOrders = orders.some((o) => o.gymId === id);
        if (hasOrders) {
          return {
            ok: false,
            reason: "No se puede eliminar: hay pedidos que referencian este gimnasio",
          };
        }

        set((s) => ({ gyms: s.gyms.filter((g) => g.id !== id) }));
        return { ok: true };
      },

      getActiveGyms: () => {
        return get()
          .gyms.filter((g) => g.active)
          .sort((a, b) => {
            const cmp = normalizeName(a.name).localeCompare(normalizeName(b.name));
            return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
          });
      },

      getGymById: (id) => {
        return get().gyms.find((g) => g.id === id);
      },

      getGymByName: (name) => {
        const normalized = normalizeName(name);
        return get().gyms.find((g) => normalizeName(g.name) === normalized);
      },
    }),
    {
      name: "gym-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          useGymStore.setState({ hydrated: true });
        }
      },
    }
  )
);
