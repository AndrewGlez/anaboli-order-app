import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { X } from "lucide-react-native";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { OrderStatus, ProductType } from "@/types";
import { useOrderStore } from "@/store/orderStore";
import { useThemeStore } from "@/store/themeStore";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  activeFilters: {
    gym: string;
    product: string;
    status: string;
  };
  setActiveFilters: React.Dispatch<
    React.SetStateAction<{
      gym: string;
      product: string;
      status: string;
    }>
  >;
}

export default function FilterSheet({
  visible,
  onClose,
  activeFilters,
  setActiveFilters,
}: FilterSheetProps) {
  const { orders } = useOrderStore();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  // Animated drawer state
  const translateY = useRef(new Animated.Value(400)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(sheetHeight || 400);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 190,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 190,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: sheetHeight || 400,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible, sheetHeight]);

  // Get unique gym names
  const gymNames = [...new Set(orders.map((order) => order.gymName))];

  // Product types
  const productTypes: { type: ProductType; label: string }[] = [
    { type: "A", label: "Avena" },
    { type: "GNY", label: "Galletas" },
    { type: "C", label: "Cookies" },
    { type: "K", label: "Ketos" },
  ];

  // Status types
  const statusTypes: OrderStatus[] = [
    "Entregado",
    "Entregado + P",
    "Entregado + TRF",
  ];

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY }], backgroundColor: colors.background },
        ]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h && h !== sheetHeight) setSheetHeight(h);
        }}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Filtrar Ordenes
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={[styles.content, { backgroundColor: colors.background }]}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Gym
            </Text>
            <View style={styles.optionsContainer}>
              {gymNames.map((gym) => (
                <TouchableOpacity
                  key={gym}
                  style={[
                    styles.optionButton,
                    ,
                    activeFilters.gym === gym && styles.activeOption,
                  ]}
                  onPress={() =>
                    setActiveFilters({
                      ...activeFilters,
                      gym: activeFilters.gym === gym ? "" : gym,
                    })
                  }
                >
                  <Text
                    style={[
                      { color: colors.textLight },
                      activeFilters.gym === gym && styles.activeOptionText,
                    ]}
                  >
                    {gym}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={[styles.section, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tipos de productos
            </Text>
            <View style={styles.optionsContainer}>
              {productTypes.map((product) => (
                <TouchableOpacity
                  key={product.type}
                  style={[
                    styles.optionButton,
                    activeFilters.product === product.type &&
                      styles.activeOption,
                  ]}
                  onPress={() =>
                    setActiveFilters({
                      ...activeFilters,
                      product:
                        activeFilters.product === product.type
                          ? ""
                          : product.type,
                    })
                  }
                >
                  <Text
                    style={[
                      { color: colors.textLight },
                      activeFilters.product === product.type &&
                        styles.activeOptionText,
                    ]}
                  >
                    {product.label} ({product.type})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={[styles.section, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Estado
            </Text>
            <View style={styles.optionsContainer}>
              {statusTypes.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.optionButton,
                    activeFilters.status === status && styles.activeOption,
                  ]}
                  onPress={() =>
                    setActiveFilters({
                      ...activeFilters,
                      status: activeFilters.status === status ? "" : status,
                    })
                  }
                >
                  <Text
                    style={[
                      { color: colors.textLight },
                      activeFilters.status === status &&
                        styles.activeOptionText,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() =>
              setActiveFilters({ gym: "", product: "", status: "" })
            }
          >
            <Text style={{ color: colors.text }}>Reiniciar Filtros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  content: {
    padding: 16,
    maxHeight: "90%",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },
  activeOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  activeOptionText: {
    color: COLORS.white,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginRight: 8,
  },
  resetButtonText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginLeft: 8,
  },
  applyButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
  },
});
