import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { useGymStore } from "@/store/gymStore";
import { useOrderStore } from "@/store/orderStore";
import { Gym } from "@/types";
import GymListItem from "@/components/GymListItem";
import GymForm from "@/components/GymForm";
import GymDeleteDialog from "@/components/GymDeleteDialog";
import { Plus, PlusCircle } from "lucide-react-native";

export default function GymsScreen() {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const { gyms, hydrated, addGym, updateGym, toggleGymActive, deleteGym } =
    useGymStore();
  const orders = useOrderStore((s) => s.orders);

  const [formVisible, setFormVisible] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [deleteDialogGym, setDeleteDialogGym] = useState<Gym | null>(null);

  // Sort: active first, then alphabetical
  const sortedGyms = useMemo(() => {
    return [...gyms].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      const cmp = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
    });
  }, [gyms]);

  const hasOrders = (gymId: string) => orders.some((o) => o.gymId === gymId);

  if (!hydrated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Gimnasios</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            setEditingGym(null);
            setFormVisible(true);
          }}
        >
          <Plus size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {sortedGyms.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            No hay gimnasios. Toca + para agregar uno.
          </Text>
        </View>
      ) : (
        <ScrollView>
          {sortedGyms.map((gym) => (
            <GymListItem
              key={gym.id}
              gym={gym}
              hasOrders={hasOrders(gym.id)}
              onEdit={(g) => {
                setEditingGym(g);
                setFormVisible(true);
              }}
              onDelete={(g) => setDeleteDialogGym(g)}
            />
          ))}
        </ScrollView>
      )}

      <GymForm
        visible={formVisible}
        gym={editingGym}
        onClose={() => {
          setFormVisible(false);
          setEditingGym(null);
        }}
        onSubmit={(name) => {
          if (editingGym) {
            return updateGym(editingGym.id, { name });
          }
          return addGym({ name, active: true });
        }}
      />

      <GymDeleteDialog
        visible={deleteDialogGym !== null}
        gym={deleteDialogGym}
        hasOrders={deleteDialogGym ? hasOrders(deleteDialogGym.id) : false}
        onClose={() => setDeleteDialogGym(null)}
        onConfirmDelete={() => {
          if (deleteDialogGym) {
            deleteGym(deleteDialogGym.id);
          }
          setDeleteDialogGym(null);
        }}
        onConfirmDeactivate={() => {
          if (deleteDialogGym) {
            toggleGymActive(deleteDialogGym.id);
          }
          setDeleteDialogGym(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.h2.fontFamily,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.body2.fontFamily,
    textAlign: "center",
  },
});
