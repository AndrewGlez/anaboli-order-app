import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActionSheetIOS,
  Platform,
  Alert,
  Pressable,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Share2 } from "lucide-react-native";
import { useOrderStore } from "@/store/orderStore";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { ProductType, OrderStatus, Order, Gasto } from "@/types";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { saveXlsxToFile, removeTempFile } from "@/services/web/fileExport";
import { useThemeStore } from "@/store/themeStore";
import { useFocusEffect } from "@react-navigation/native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnalyticsScreen() {
  const { orders, gastos, lastUpdated } = useOrderStore();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  const [timeFrame, setTimeFrame] = useState<"day" | "week" | "month">("day");
  const [refreshKey, setRefreshKey] = useState(0);
  const analyticsRef = React.useRef<View>(null);

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Trigger refresh when screen comes into focus
      setRefreshKey((prev) => prev + 1);
      return () => {};
    }, [])
  );

  // Monitor changes to the orders array
  useEffect(() => {
    // This will trigger when orders change (including imports)
    setRefreshKey((prev) => prev + 1);
  }, [orders]);

  // Filter orders based on selected time frame using useMemo for performance
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();

      if (timeFrame === "day") {
        return orderDate.toDateString() === now.toDateString();
      } else if (timeFrame === "week") {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return orderDate >= oneWeekAgo;
      } else {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return orderDate >= oneMonthAgo;
      }
    });
  }, [orders, timeFrame, refreshKey, lastUpdated]);

  // Count orders by gym
  const ordersByGym = useMemo(() => {
    return filteredOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.gymName] = (acc[order.gymName] || 0) + 1;
      return acc;
    }, {});
  }, [filteredOrders]);

  // Count products by type
  const productsByType = useMemo(() => {
    return filteredOrders.reduce<Record<ProductType, number>>(
      (acc, order) => {
        order.products.forEach((product) => {
          acc[product.type] = (acc[product.type] || 0) + product.quantity;
        });
        return acc;
      },
      { A: 0, GNY: 0, C: 0, K: 0 }
    );
  }, [filteredOrders]);

  // Count orders by status
  const ordersByStatus = useMemo(() => {
    return filteredOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }, [filteredOrders]);

  // Calculate total price from Entregado + P orders
  const totalPrice = useMemo(() => {
    return filteredOrders.reduce((acc, order) => acc + (order.price || 0), 0);
  }, [filteredOrders]);

  // Filter gastos - only show gastos from the same day they were registered
  const filteredGastos = useMemo(() => {
    return (gastos || []).filter((gasto) => {
      const gastoDate = new Date(gasto.createdAt);
      const now = new Date();

      // Always filter gastos to only show same day
      return gastoDate.toDateString() === now.toDateString();
    });
  }, [gastos, refreshKey, lastUpdated]);

  // Calculate total gastos
  const totalGastos = useMemo(() => {
    return filteredGastos.reduce((acc, gasto) => acc + (gasto.price || 0), 0);
  }, [filteredGastos]);

  const handleExportImage = async () => {
    if (analyticsRef.current) {
      try {
        const uri = await captureRef(analyticsRef, {
          format: "jpg",
          quality: 0.8,
        });

        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share Analytics Report",
        });
      } catch (error) {
        console.error("Error exporting image:", error);
      }
    }
  };

  const handleExport = async () => {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const wsData = [];

      // Add title and metadata
      wsData.push(["REPORTE DE ANÁLISIS"]);
      wsData.push(["Fecha:", formatDate()]);
      wsData.push([
        "Periodo:",
        timeFrame === "day" ? "Día" : timeFrame === "week" ? "Semana" : "Mes",
      ]);
      wsData.push([]);

      // Summary statistics
      wsData.push(["RESUMEN"]);
      wsData.push(["Total Ordenes:", filteredOrders.length]);
      wsData.push(["Total Gyms:", Object.keys(ordersByGym).length]);
      wsData.push([
        "Total Productos:",
        Object.values(productsByType).reduce((a, b) => a + b, 0),
      ]);
      wsData.push([
        "Total Pagado (Entregado + P):",
        `$${totalPrice.toFixed(2)}`,
      ]);
      wsData.push([]);

      // Products summary
      wsData.push(["PRODUCTOS POR TIPO"]);
      wsData.push(["Tipo", "Cantidad"]);
      wsData.push(["Avena (A)", productsByType.A]);
      wsData.push(["Galletas (GNY)", productsByType.GNY]);
      wsData.push(["Cookies (C)", productsByType.C]);
      wsData.push(["Ketos (K)", productsByType.K]);
      wsData.push([]);

      // Status summary with prices
      wsData.push(["ESTADO DE ORDENES"]);
      wsData.push(["Estado", "Cantidad", "Total Pagado"]);
      Object.entries(ordersByStatus)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([status, count]) => {
          const statusPrice = filteredOrders
            .filter((order) => order.status === status && order.price)
            .reduce((acc, order) => acc + (order.price || 0), 0);
          wsData.push([
            status,
            count,
            statusPrice > 0 ? `$${statusPrice.toFixed(2)}` : "-",
          ]);
        });
      wsData.push([]);

      // Detailed orders section
      wsData.push(["DETALLE DE ORDENES"]);
      wsData.push([
        "Gym",
        "Fecha",
        "Estado",
        "Producto",
        "Cantidad",
        "Precio",
        "Notas",
      ]);

      // Sort orders by date and gym
      const sortedOrders = [...filteredOrders].sort((a, b) => {
        const dateCompare =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.gymName.localeCompare(b.gymName);
      });

      // Add detailed order information
      sortedOrders.forEach((order) => {
        const date = new Date(order.createdAt).toLocaleDateString("es-ES");
        const orderPrice = order.price ? `$${order.price.toFixed(2)}` : "-";

        order.products.forEach((product, index) => {
          const productName =
            product.type === "A"
              ? "Avena"
              : product.type === "GNY"
              ? "Galletas"
              : product.type === "C"
              ? "Cookies"
              : product.type === "K"
              ? "Ketos"
              : "";

          wsData.push([
            order.gymName,
            date,
            order.status,
            productName,
            product.quantity,
            index === 0 ? orderPrice : "", // Only show price on the first product row
            order.notes || "",
          ]);
        });
      });

      // Track row for gastos table styling
      const gastosStartRow = wsData.length + 1;

      // Add Gastos (Expenses) section
      wsData.push([]);
      wsData.push([]);
      wsData.push(["GASTOS"]);
      const gastosHeaderRow = wsData.length;
      wsData.push(["Nombre", "Precio", "Fecha"]);

      // Sort gastos by date
      const sortedGastos = [...filteredGastos].sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      // Add gastos data
      sortedGastos.forEach((gasto) => {
        const date = new Date(gasto.createdAt).toLocaleDateString("es-ES");
        wsData.push([gasto.name, `$${gasto.price.toFixed(2)}`, date]);
      });

      // Add total gastos row
      wsData.push([]);
      wsData.push(["TOTAL GASTOS:", `$${totalGastos.toFixed(2)}`, ""]);

      // Create worksheet and add to workbook
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style the worksheet
      ws["!cols"] = [
        { wch: 20 }, // Gym name / Gasto name
        { wch: 12 }, // Date / Price
        { wch: 15 }, // Status / Date
        { wch: 15 }, // Product
        { wch: 10 }, // Quantity
        { wch: 10 }, // Price
        { wch: 30 }, // Notes
      ];

      // Helper function to create cell style with background color
      const createCellStyle = (
        bgColor: string,
        fontColor: string = "000000",
        bold: boolean = false
      ) => ({
        fill: { fgColor: { rgb: bgColor } },
        font: { color: { rgb: fontColor }, bold },
        alignment: { horizontal: "center" },
      });

      // Apply styling to header rows and gastos section
      // Note: xlsx library has limited styling support, we'll set basic properties
      // For full styling support, consider using xlsx-style or exceljs

      // Style specific cells for gastos section
      const gastosHeaderCellStyle = {
        fill: { patternType: "solid", fgColor: { rgb: "FBBF24" } }, // Warning/Yellow color
        font: { bold: true, color: { rgb: "000000" } },
      };

      const gastosTitleCellStyle = {
        fill: { patternType: "solid", fgColor: { rgb: "F97316" } }, // Orange color
        font: { bold: true, color: { rgb: "FFFFFF" } },
      };

      const gastosTotalCellStyle = {
        fill: { patternType: "solid", fgColor: { rgb: "EF4444" } }, // Red/Error color
        font: { bold: true, color: { rgb: "FFFFFF" } },
      };

      // Apply cell styles if the worksheet supports it
      // GASTOS title row styling
      if (ws[`A${gastosHeaderRow}`]) {
        ws[`A${gastosHeaderRow}`].s = gastosTitleCellStyle;
      }
      if (ws[`A${gastosHeaderRow + 1}`]) {
        ws[`A${gastosHeaderRow + 1}`].s = gastosHeaderCellStyle;
        ws[`B${gastosHeaderRow + 1}`].s = gastosHeaderCellStyle;
        ws[`C${gastosHeaderRow + 1}`].s = gastosHeaderCellStyle;
      }

      // Style total gastos row
      const totalGastosRow = wsData.length;
      if (ws[`A${totalGastosRow}`]) {
        ws[`A${totalGastosRow}`].s = gastosTotalCellStyle;
        ws[`B${totalGastosRow}`].s = gastosTotalCellStyle;
      }

      XLSX.utils.book_append_sheet(wb, ws, "Análisis");

      // Generate the Excel file
      const now = new Date();
      const filename = `analytics_${timeFrame}_${
        now.toISOString().split("T")[0]
      }_${now.getHours()}-${String(now.getMinutes()).padStart(2, "0")}.xlsx`;

      // Write file via platform-aware service
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const filePath = await saveXlsxToFile(wbout, filename);

      // Share the file (native only — web download already triggered)
      if (filePath) {
        await Sharing.shareAsync(`file://${filePath}`, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Guardar Reporte de Análisis",
          UTI: "org.openxmlformats.spreadsheetml.sheet",
        });

        // Clean up temp file
        await removeTempFile(filePath);
      }
    } catch (error) {
      console.error("Error exporting Excel:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al exportar el archivo Excel. Por favor intente nuevamente."
      );
    }
  };

  const formatDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    if (timeFrame === "day") {
      return now.toLocaleDateString("es-ES", options);
    } else if (timeFrame === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return `${oneWeekAgo.toLocaleDateString(
        "es-ES",
        options
      )} - ${now.toLocaleDateString("es-ES", options)}`;
    } else {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return `${oneMonthAgo.toLocaleDateString(
        "es-ES",
        options
      )} - ${now.toLocaleDateString("es-ES", options)}`;
    }
  };

  const tabIndicatorPosition = useSharedValue(0);

  const handleTimeFrameChange = (newTimeFrame: "day" | "week" | "month") => {
    const positions = { day: 0, week: 1, month: 2 };
    tabIndicatorPosition.value = withSpring(positions[newTimeFrame], {
      damping: 15,
      stiffness: 150,
    });
    setTimeFrame(newTimeFrame);
  };

  const tabIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            tabIndicatorPosition.value,
            [0, 1, 2],
            [0, 100, 200]
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border, paddingBottom: 0 },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>📊 Análisis</Text>
        <View
          style={[
            styles.timeFrameContainer,
            { backgroundColor: colors.border },
          ]}
        >
          <Animated.View
            style={[
              styles.tabIndicator,
              { backgroundColor: colors.primary },
              tabIndicatorStyle,
            ]}
          />
          <AnimatedPressable
            style={styles.timeFrameButton}
            onPress={() => handleTimeFrameChange("day")}
          >
            <Animated.Text
              style={[
                styles.timeFrameText,
                {
                  color: timeFrame === "day" ? COLORS.white : colors.textLight,
                },
              ]}
            >
              Día
            </Animated.Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={styles.timeFrameButton}
            onPress={() => handleTimeFrameChange("week")}
          >
            <Animated.Text
              style={[
                styles.timeFrameText,
                {
                  color: timeFrame === "week" ? COLORS.white : colors.textLight,
                },
              ]}
            >
              Semana
            </Animated.Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={styles.timeFrameButton}
            onPress={() => handleTimeFrameChange("month")}
          >
            <Animated.Text
              style={[
                styles.timeFrameText,
                {
                  color:
                    timeFrame === "month" ? COLORS.white : colors.textLight,
                },
              ]}
            >
              Mes
            </Animated.Text>
          </AnimatedPressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View
          ref={analyticsRef}
          style={[
            styles.analyticsContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Animated.View
            style={styles.dateContainer}
            entering={FadeIn.duration(300)}
          >
            <Calendar size={20} color={COLORS.textLight} />
            <Text style={styles.dateText}>{formatDate()}</Text>
          </Animated.View>

          <Animated.View
            style={[styles.statsCard, { backgroundColor: colors.white }]}
            entering={FadeInDown.delay(100).springify().damping(15)}
          >
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Resumen
            </Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{filteredOrders.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>
                  Ordenes totales
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Object.keys(ordersByGym).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>
                  Gyms atendidos
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Object.values(productsByType).reduce((a, b) => a + b, 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>
                  Productos totales
                </Text>
              </View>
            </View>
            <View style={[styles.statItem, { paddingTop: 24 }]}>
              <Text style={styles.statValue}>${totalPrice.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>
                Total pagado
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.statsCard, { backgroundColor: colors.white }]}
            entering={FadeInDown.delay(200).springify().damping(15)}
          >
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Productos por tipo
            </Text>
            <View style={[styles.productStats]}>
              <View style={styles.productStatItem}>
                <View
                  style={[
                    styles.productIndicator,
                    { backgroundColor: COLORS.productA },
                  ]}
                />
                <Text style={[styles.productLabel, { color: colors.text }]}>
                  Avena (A)
                </Text>
                <Text style={[styles.productValue, { color: colors.text }]}>
                  {productsByType.A}
                </Text>
              </View>
              <View style={styles.productStatItem}>
                <View
                  style={[
                    styles.productIndicator,
                    { backgroundColor: COLORS.productGNY },
                  ]}
                />
                <Text style={[styles.productLabel, { color: colors.text }]}>
                  Galletas (GNY)
                </Text>
                <Text style={[styles.productValue, { color: colors.text }]}>
                  {productsByType.GNY}
                </Text>
              </View>
              <View style={styles.productStatItem}>
                <View
                  style={[
                    styles.productIndicator,
                    { backgroundColor: COLORS.productC },
                  ]}
                />
                <Text style={[styles.productLabel, { color: colors.text }]}>
                  Cookies (C)
                </Text>
                <Text style={[styles.productValue, { color: colors.text }]}>
                  {productsByType.C}
                </Text>
              </View>
              <View style={styles.productStatItem}>
                <View
                  style={[
                    styles.productIndicator,
                    { backgroundColor: COLORS.productK },
                  ]}
                />
                <Text style={[styles.productLabel, { color: colors.text }]}>
                  Ketos (K)
                </Text>
                <Text style={[styles.productValue, { color: colors.text }]}>
                  {productsByType.K}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.statsCard, { backgroundColor: colors.white }]}
            entering={FadeInDown.delay(300).springify().damping(15)}
          >
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Estado de ordenes
            </Text>
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <View key={status} style={styles.statusStatItem}>
                <View
                  style={[
                    styles.statusBarContainer,
                    { backgroundColor: colors.white },
                  ]}
                >
                  <View
                    style={[
                      styles.statusBar,
                      {
                        width: `${(count / filteredOrders.length) * 100}%`,
                        backgroundColor: getStatusColor(status as OrderStatus),
                      },
                    ]}
                  />
                </View>
                <View style={styles.statusLabelContainer}>
                  <Text style={[styles.statusLabel, { color: colors.text }]}>
                    {status}
                  </Text>
                  <Text style={[styles.statusValue, { color: colors.text }]}>
                    {count}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {Object.keys(ordersByGym).length > 0 && (
            <Animated.View
              style={[styles.statsCard, { backgroundColor: colors.white }]}
              entering={FadeInDown.delay(400).springify().damping(15)}
            >
              <Text style={[styles.statsTitle, { color: colors.text }]}>
                Top Gyms
              </Text>
              {Object.entries(ordersByGym)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([gym, count], index) => (
                  <Animated.View
                    key={gym}
                    style={styles.gymStatItem}
                    entering={FadeIn.delay(450 + index * 50)}
                  >
                    <Text style={[styles.gymRank, { color: colors.text }]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.gymName, { color: colors.text }]}>
                      {gym}
                    </Text>
                    <Text style={[styles.gymCount, { color: colors.text }]}>
                      {count} orden(es)
                    </Text>
                  </Animated.View>
                ))}
            </Animated.View>
          )}

          {/* Gastos Section */}
          <Animated.View
            style={[styles.statsCard, { backgroundColor: colors.white }]}
            entering={FadeInDown.delay(500).springify().damping(15)}
          >
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Gastos
            </Text>
            {filteredGastos.length > 0 ? (
              <>
                {filteredGastos.map((gasto, index) => (
                  <Animated.View
                    key={gasto.id}
                    style={styles.gastoItem}
                    entering={FadeIn.delay(550 + index * 50)}
                  >
                    <View
                      style={[
                        styles.gastoIndicator,
                        { backgroundColor: COLORS.warning },
                      ]}
                    />
                    <Text style={[styles.gastoName, { color: colors.text }]}>
                      {gasto.name}
                    </Text>
                    <Text style={[styles.gastoPrice, { color: colors.error }]}>
                      -${gasto.price.toFixed(2)}
                    </Text>
                  </Animated.View>
                ))}
                <View
                  style={[
                    styles.gastoTotalContainer,
                    { borderTopColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.gastoTotalLabel, { color: colors.text }]}
                  >
                    Total Gastos:
                  </Text>
                  <Text
                    style={[styles.gastoTotalValue, { color: colors.error }]}
                  >
                    -${totalGastos.toFixed(2)}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={[styles.noGastosText, { color: colors.textLight }]}>
                No hay gastos registrados
              </Text>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(600).springify().damping(15)}
        style={styles.floatingButtonContainer}
      >
        <TouchableOpacity
          style={[
            styles.floatingExportButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleExport}
          activeOpacity={0.8}
        >
          <Share2 size={24} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "Entregado":
      return COLORS.statusVisto;
    case "Entregado + P":
      return COLORS.statusVistoP;
    case "Entregado + TRF":
      return COLORS.statusVistoTRF;

    default:
      return COLORS.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
  },
  title: {
    ...FONTS.h1,
    marginBottom: 16,
  },
  timeFrameContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: SIZES.radius,
    padding: 4,
    position: "relative",
    overflow: "hidden",
    alignSelf: "center",
  },
  tabIndicator: {
    position: "absolute",
    width: 100,
    height: "100%",
    borderRadius: SIZES.radius - 2,
    top: 4,
    left: 4,
  },
  timeFrameButton: {
    width: 100,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timeFrameText: {
    ...FONTS.body1,
    fontWeight: "600",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  floatingExportButton: {
    width: 64,
    height: 64,
    borderRadius: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  analyticsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    ...FONTS.body2,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    ...FONTS.h1,
    color: COLORS.primary,
  },
  statLabel: {
    ...FONTS.body3,
    color: COLORS.textLight,
    textAlign: "center",
  },
  productStats: {
    marginTop: 10,
  },
  productStatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  productIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  productLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    flex: 1,
  },
  productValue: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  statusStatItem: {
    marginBottom: 16,
  },
  statusBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 4,
    overflow: "hidden",
  },
  statusBar: {
    height: "100%",
    borderRadius: 4,
  },
  statusLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusLabel: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  statusValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: "600",
  },
  gymStatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gymRank: {
    ...FONTS.h3,
    color: COLORS.primary,
    width: 30,
  },
  gymName: {
    ...FONTS.body2,
    color: COLORS.text,
    flex: 1,
  },
  gymCount: {
    ...FONTS.body3,
    color: COLORS.textLight,
  },
  // Gastos styles
  gastoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gastoIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  gastoName: {
    ...FONTS.body2,
    flex: 1,
  },
  gastoPrice: {
    ...FONTS.h3,
    fontWeight: "600",
  },
  gastoTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
  },
  gastoTotalLabel: {
    ...FONTS.h3,
    fontWeight: "600",
  },
  gastoTotalValue: {
    ...FONTS.h3,
  },
  noGastosText: {
    ...FONTS.body2,
    textAlign: "center",
    paddingVertical: 20,
  },
});
