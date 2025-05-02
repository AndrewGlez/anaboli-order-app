import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActionSheetIOS,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Share2 } from "lucide-react-native";
import { useOrderStore } from "@/store/orderStore";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { ProductType, OrderStatus, Order } from "@/types";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as RNFS from "react-native-fs";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import { useThemeStore } from "@/store/themeStore";

export default function AnalyticsScreen() {
  const { orders } = useOrderStore();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  const [timeFrame, setTimeFrame] = useState<"day" | "week" | "month">("day");
  const analyticsRef = React.useRef<View>(null);

  // Filter orders based on selected time frame
  const filteredOrders = orders.filter((order) => {
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

  // Count orders by gym
  const ordersByGym = filteredOrders.reduce<Record<string, number>>(
    (acc, order) => {
      acc[order.gymName] = (acc[order.gymName] || 0) + 1;
      return acc;
    },
    {}
  );

  // Count products by type
  const productsByType = filteredOrders.reduce<Record<ProductType, number>>(
    (acc, order) => {
      order.products.forEach((product) => {
        acc[product.type] = (acc[product.type] || 0) + product.quantity;
      });
      return acc;
    },
    { A: 0, GNY: 0, C: 0, K: 0 }
  );

  // Count orders by status
  const ordersByStatus = filteredOrders.reduce<Record<string, number>>(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {}
  );

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
      wsData.push([]);

      // Products summary
      wsData.push(["PRODUCTOS POR TIPO"]);
      wsData.push(["Tipo", "Cantidad"]);
      wsData.push(["Avena (A)", productsByType.A]);
      wsData.push(["Galletas (GNY)", productsByType.GNY]);
      wsData.push(["Cookies (C)", productsByType.C]);
      wsData.push(["Ketos (K)", productsByType.K]);
      wsData.push([]);

      // Status summary
      wsData.push(["ESTADO DE ORDENES"]);
      wsData.push(["Estado", "Cantidad"]);
      Object.entries(ordersByStatus)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([status, count]) => {
          wsData.push([status, count]);
        });
      wsData.push([]);

      // Detailed orders section
      wsData.push(["DETALLE DE ORDENES"]);
      wsData.push(["Gym", "Fecha", "Estado", "Producto", "Cantidad", "Notas"]);

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

        order.products.forEach((product) => {
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
            order.notes || "",
          ]);
        });
      });

      // Create worksheet and add to workbook
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style the worksheet
      ws["!cols"] = [
        { wch: 20 }, // Gym name
        { wch: 12 }, // Date
        { wch: 15 }, // Status
        { wch: 15 }, // Product
        { wch: 10 }, // Quantity
        { wch: 30 }, // Notes
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Análisis");

      // Generate the Excel file
      const now = new Date();
      const filename = `analytics_${timeFrame}_${
        now.toISOString().split("T")[0]
      }_${now.getHours()}-${String(now.getMinutes()).padStart(2, "0")}.xlsx`;
      const tempPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

      // Write file
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      await RNFS.writeFile(tempPath, wbout, "base64");

      // Share the file
      await Sharing.shareAsync(`file://${tempPath}`, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Guardar Reporte de Análisis",
        UTI: "org.openxmlformats.spreadsheetml.sheet",
      });

      // Clean up temp file
      try {
        await RNFS.unlink(tempPath);
      } catch (cleanupError) {
        console.warn("Error cleaning up temp file:", cleanupError);
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Análisis</Text>
        <View style={styles.timeFrameContainer}>
          <TouchableOpacity
            style={[
              [styles.timeFrameButton, { backgroundColor: colors.white }],
              timeFrame === "day" && styles.activeTimeFrame,
            ]}
            onPress={() => setTimeFrame("day")}
          >
            <Text
              style={[
                [styles.timeFrameText, { color: colors.textLight }],
                timeFrame === "day" && styles.activeTimeFrameText,
              ]}
            >
              Día
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              [styles.timeFrameButton, { backgroundColor: colors.white }],
              timeFrame === "week" && styles.activeTimeFrame,
            ]}
            onPress={() => setTimeFrame("week")}
          >
            <Text
              style={[
                [styles.timeFrameText, { color: colors.textLight }],
                timeFrame === "week" && styles.activeTimeFrameText,
              ]}
            >
              Semana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              [styles.timeFrameButton, { backgroundColor: colors.white }],
              timeFrame === "month" && styles.activeTimeFrame,
            ]}
            onPress={() => setTimeFrame("month")}
          >
            <Text
              style={[
                [styles.timeFrameText, { color: colors.textLight }],
                timeFrame === "month" && styles.activeTimeFrameText,
              ]}
            >
              Mes
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Share2 size={20} color={COLORS.primary} />
          <Text style={styles.exportButtonText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View
          ref={analyticsRef}
          style={[
            styles.analyticsContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.dateContainer}>
            <Calendar size={20} color={COLORS.textLight} />
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.white }]}>
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
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.white }]}>
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
                <Text style={styles.productValue}>{productsByType.A}</Text>
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
                <Text style={styles.productValue}>{productsByType.GNY}</Text>
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
                <Text style={styles.productValue}>{productsByType.C}</Text>
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
                <Text style={styles.productValue}>{productsByType.K}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.white }]}>
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
          </View>

          {Object.keys(ordersByGym).length > 0 && (
            <View style={[styles.statsCard, { backgroundColor: colors.white }]}>
              <Text style={[styles.statsTitle, { color: colors.text }]}>
                Top Gyms
              </Text>
              {Object.entries(ordersByGym)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([gym, count], index) => (
                  <View key={gym} style={styles.gymStatItem}>
                    <Text style={[styles.gymRank, { color: colors.text }]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.gymName, { color: colors.text }]}>
                      {gym}
                    </Text>
                    <Text style={[styles.gymCount, { color: colors.text }]}>
                      {count} orden(es)
                    </Text>
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  },
  timeFrameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    marginRight: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTimeFrame: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeFrameText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  activeTimeFrameText: {
    color: COLORS.white,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignSelf: "flex-start",
  },
  exportButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 8,
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
});
