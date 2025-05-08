import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, Calendar } from "lucide-react-native";
import { format } from "date-fns";
import { useOrderStore } from "@/store/orderStore";
import OrderCard from "@/components/OrderCard";
import FilterSheet from "@/components/FilterSheet";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import EmptyState from "@/components/EmptyState";
import { es } from "date-fns/locale";
import { useThemeStore } from "@/store/themeStore";
import UpdateButton from "@/components/UpdateButton";

export default function OrdersScreen() {
  const { orders } = useOrderStore();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    gym: "",
    product: "",
    status: "",
  });

  const today = format(new Date(), "EEEE, MMMM d, yyyy", {
    locale: es,
  });

  // Filter orders based on search query and active filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.gymName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGymFilter =
      activeFilters.gym === "" || order.gymName === activeFilters.gym;

    const matchesProductFilter =
      activeFilters.product === "" ||
      order.products.some((p) => p.type === activeFilters.product);

    const matchesStatusFilter =
      activeFilters.status === "" || order.status === activeFilters.status;

    return (
      matchesSearch &&
      matchesGymFilter &&
      matchesProductFilter &&
      matchesStatusFilter
    );
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Ordenes</Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {today}
          </Text>
        </View>
        <View style={styles.updateButtonContainer}>
          <UpdateButton />
        </View>
      </View>

      <View
        style={[
          styles.searchContainer,
          { borderColor: colors.border, padding: SIZES.padding },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.white, borderColor: colors.border },
          ]}
        >
          <Search
            size={20}
            color={colors.textLight}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.primary }]}
          onPress={() => setFilterVisible(true)}
        >
          <Filter size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {Object.values(activeFilters).some((filter) => filter !== "") && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={styles.filtersContent}
        >
          {activeFilters.gym !== "" && (
            <View
              style={[
                styles.filterChip,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                {activeFilters.gym}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveFilters({ ...activeFilters, gym: "" })}
              >
                <Text
                  style={[styles.filterChipRemove, { color: colors.primary }]}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {activeFilters.product !== "" && (
            <View
              style={[
                styles.filterChip,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                Productos: {activeFilters.product}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setActiveFilters({ ...activeFilters, product: "" })
                }
              >
                <Text
                  style={[styles.filterChipRemove, { color: colors.primary }]}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {activeFilters.status !== "" && (
            <View
              style={[
                styles.filterChip,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                Estado: {activeFilters.status}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setActiveFilters({ ...activeFilters, status: "" })
                }
              >
                <Text
                  style={[styles.filterChipRemove, { color: colors.primary }]}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {Object.values(activeFilters).some((filter) => filter !== "") && (
            <TouchableOpacity
              style={[styles.clearFiltersButton, { borderColor: colors.error }]}
              onPress={() =>
                setActiveFilters({ gym: "", product: "", status: "" })
              }
            >
              <Text style={[styles.clearFiltersText, { color: colors.error }]}>
                Limpiar filtros
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <OrderCard order={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          title="No se encontraron ordenes"
          description="Intenta cambiar tus filtros o crea una nueva orden"
          icon={<Calendar size={50} color={COLORS.textLight} />}
        />
      )}

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.padding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.h1,
  },
  subtitle: {
    ...FONTS.body3,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    height: 46,
    borderRadius: SIZES.radius,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    ...FONTS.body2,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: SIZES.radius,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filtersRow: {
    paddingLeft: SIZES.padding,
    marginBottom: 10,
  },
  filtersContent: {
    paddingRight: SIZES.padding,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    ...FONTS.body3,
  },
  filterChipRemove: {
    ...FONTS.h3,
    marginLeft: 4,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  clearFiltersText: {
    ...FONTS.body3,
  },
  listContent: {
    padding: SIZES.padding,
  },
  updateButtonContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 100,
  },
});
