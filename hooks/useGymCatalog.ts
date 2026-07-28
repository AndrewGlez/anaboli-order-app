import { useMemo } from "react";
import { useGymStore } from "@/store/gymStore";
import { Gym } from "@/types";

export interface GymCatalogResult {
  gyms: Gym[];
  hydrated: boolean;
  error?: string;
}

export function useGymCatalog(): GymCatalogResult {
  const gyms = useGymStore((s) => s.gyms);
  const hydrated = useGymStore((s) => s.hydrated);

  const activeGyms = useMemo(() => {
    return gyms
      .filter((g) => g.active)
      .sort((a, b) => {
        const cmp = a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase());
        return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
      });
  }, [gyms]);

  return { gyms: activeGyms, hydrated };
}
