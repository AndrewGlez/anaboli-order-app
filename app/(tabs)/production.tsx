import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Printer, Share2, Save, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { useOrderStore } from "@/store/orderStore";
import { useProductionStore } from "@/store/productionStore";
import { FLAVOR_CODES, PRODUCTION_PRODUCT_TYPES } from "@/constants/productionCatalog";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { canPrint, printReport } from "@/services/web/productionPrint";
import { canExport, exportReport } from "@/services/productionExport";
import Animated, { FadeInDown } from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProductionScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "phone";

  // Store hooks
  const { orders } = useOrderStore();
  const productionStore = useProductionStore();

  // Local state
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [quantities, setQuantities] = useState<Map<string, number>>(() => {
    // Initialize with zeros
    const map = new Map<string, number>();
    FLAVOR_CODES.forEach((flavor) => {
      PRODUCTION_PRODUCT_TYPES.forEach((product) => {
        map.set(`${flavor}:${product}`, 0);
      });
    });
    return map;
  });

  // Get orders for selected date
  const ordersForDate = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = order.createdAt.split("T")[0];
      return orderDate === selectedDate;
    });
  }, [orders, selectedDate]);

  // Calculate totals
  const { totalProduced, totalAssigned, isBalanced } = useMemo(() => {
    let produced = 0;
    quantities.forEach((qty) => {
      produced += qty;
    });

    let assigned = 0;
    ordersForDate.forEach((order) => {
      order.products.forEach((product) => {
        assigned += product.quantity;
      });
    });

    return {
      totalProduced: produced,
      totalAssigned: assigned,
      isBalanced: produced === assigned,
    };
  }, [quantities, ordersForDate]);

  // Handle quantity change
  const handleQuantityChange = (flavor: string, product: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;

    setQuantities((prev) => {
      const next = new Map(prev);
      next.set(`${flavor}:${product}`, numValue);
      return next;
    });
  };

  // Handle save
  const handleSave = async () => {
    const result = productionStore.saveReport(selectedDate, quantities);
    if (result.ok) {
      Alert.alert("Éxito", "Reporte guardado correctamente");
    } else {
      Alert.alert("Error", result.reason);
    }
  };

  // Handle print (web only)
  const handlePrint = () => {
    if (canPrint()) {
      printReport();
    }
  };

  // Handle export
  const handleExport = async () => {
    const report = productionStore.selectCurrentReport();
    if (!report) {
      Alert.alert("Error", "No hay reporte para exportar");
      return;
    }

    const result = await exportReport(report, ordersForDate);
    if (result.success) {
      Alert.alert("Éxito", result.message);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  // Date navigation
  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Producción Diaria</Text>
        <View style={styles.headerActions}>
          {canPrint() && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.primary + "20" }]}
              onPress={handlePrint}
            >
              <Printer size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {canExport() && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.primary + "20" }]}
              onPress={handleExport}
            >
              <Share2 size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Date Selector */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.dateSelector, { backgroundColor: colors.white }]}
        >
          <TouchableOpacity
            style={styles.dateNavButton}
            onPress={() => changeDate(-1)}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.dateDisplay}>
            <Calendar size={20} color={colors.primary} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(selectedDate)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dateNavButton}
            onPress={() => changeDate(1)}
          >
            <ChevronRight size={24} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.summaryLabel, { color: colors.textLight }]} totalProduced={totalProduced} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalProduced}</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.summaryLabel, { color: colors.textLight }]} totalAssigned={totalAssigned} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalAssigned}</Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: isBalanced ? colors.success + "20" : colors.error + "20",
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.textLight }]} delta={totalProduced - totalAssigned} />
            <Text
              style={[
                styles.summaryValue,
                { color: isBalanced ? colors.success : colors.error },
              ]}
            >
              {totalProduced - totalAssigned}
            </Text>
          </View>
        </View>

        {/* Production Table */}
        <View style={[styles.section, { backgroundColor: colors.white }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]} delta={totalProduced - totalAssigned} />

          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.tableHeaderCell, styles.flavorCell, { color: colors.text }]} />
              {PRODUCTION_PRODUCT_TYPES.map((product) => (
                <Text
                  key={product}
                  style={[styles.tableHeaderCell, styles.productCell, { color: colors.text }]}
                >
                  {product}
                </Text>
              ))}
            </View>

            {/* Table Body */}
            {FLAVOR_CODES.map((flavor) => (
              <View
                key={flavor}
                style={[styles.tableRow, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.flavorCell, { color: colors.text }]}>{flavor}</Text>
                {PRODUCTION_PRODUCT_TYPES.map((product) => {
                  const key = `${flavor}:${product}`;
                  const value = quantities.get(key) || 0;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.quantityCell,
                        { borderColor: colors.border, backgroundColor: colors.background },
                      ]}
                    >
                      <Text style={[styles.quantityText, { color: colors.text }]}>
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Customer Distribution */}
        <View style={[styles.section, { backgroundColor: colors.white }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]} totalOrders={ordersForDate.length} />

          {ordersForDate.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textLight }]} />
          ) : (
            ordersForDate.map((order) => (
              <View
                key={order.id}
                style={[styles.customerRow, { borderBottomColor: colors.border }]}
              >
                <View>
                  <Text style={[styles.customerName, { color: colors.text }]}>
                    {order.gymName}
                  </Text>
                  <Text style={[styles.customerFlavor, { color: colors.textLight }]} />
                </View>
                <View style={styles.customerProducts}>
                  {order.products.map((product, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.productBadge,
                        { backgroundColor: getProductColor(product.type) + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.productBadgeText,
                          { color: getProductColor(product.type) },
                        ]}
                      >
                        {product.type}: {product.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: isBalanced ? colors.success : colors.error,
              opacity: isBalanced ? 1 : 0.7,
            },
          ]}
          onPress={handleSave}
          disabled={!isBalanced}
        >
          <Save size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>
            {isBalanced ? "Guardar Reporte" : "Reconciliación pendiente"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function getProductColor(type: string): string {
  switch (type) {
    case "A":
      return COLORS.productA;
    case "GNY":
      return COLORS.productGNY;
    case "C":
      return COLORS.productC;
    case "K":
      return COLORS.productK;
    default:
      return COLORS.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding,
    borderBottomWidth: 1,
  },
  title: {
    ...FONTS.h2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: SIZES.radius,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  dateNavButton: {
    padding: 8,
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    ...FONTS.body2,
    fontWeight: "600",
  },
  summaryCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: "center",
  },
  summaryLabel: {
    ...FONTS.body3,
    marginBottom: 4,
  },
  summaryValue: {
    ...FONTS.h2,
    fontWeight: "700",
  },
  section: {
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 12,
  },
  tableContainer: {
    borderRadius: SIZES.radius,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    padding: 12,
  },
  tableHeaderCell: {
    ...FONTS.body3,
    fontWeight: "600",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  flavorCell: {
    flex: 2,
    ...FONTS.body3,
  },
  productCell: {
    flex: 1,
    textAlign: "center",
  },
  quantityCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  quantityText: {
    ...FONTS.body2,
    fontWeight: "600",
  },
  emptyText: {
    ...FONTS.body2,
    textAlign: "center",
    padding: 24,
  },
  customerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  customerName: {
    ...FONTS.body2,
    fontWeight: "600",
  },
  customerFlavor: {
    ...FONTS.body3,
    marginTop: 2,
  },
  customerProducts: {
    flexDirection: "row",
    gap: 8,
  },
  productBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  productBadgeText: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 32,
    gap: 8,
  },
  saveButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: "600",
  },
});
