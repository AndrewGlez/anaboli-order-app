import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MoreVertical, Pencil, Trash2 } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  SlideInRight,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Layout,
} from "react-native-reanimated";
import { Order, ProductType, OrderStatus } from "@/types";
import { COLORS, FONTS, SHADOWS, SIZES } from "@/constants/theme";
import StatusBadge from "./StatusBadge";
import OrderDetails from "./OrderDetails";
import { useOrderStore } from "@/store/orderStore";
import { useThemeStore } from "@/store/themeStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OrderCardProps {
  order: Order;
  index?: number;
  onFix?: (id: string) => void;
  isLegacy?: boolean;
  legacyReason?: string;
}

export default function OrderCard({ order, index = 0, onFix, isLegacy, legacyReason }: OrderCardProps) {
  const { theme } = useThemeStore();

  const colors = COLORS.themed(theme);
  const { updateOrder, deleteOrder } = useOrderStore();
  const [showDetails, setShowDetails] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Animation values
  const scale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const getProductIcon = (type: ProductType) => {
    switch (type) {
      case "A":
        return { color: COLORS.productA, label: "A" };
      case "GNY":
        return { color: COLORS.productGNY, label: "G" };
      case "C":
        return { color: COLORS.productC, label: "C" };
      case "K":
        return { color: COLORS.productK, label: "K" };
    }
  };

  const handleSaveEdit = (updatedOrder: Partial<Order>) => {
    updateOrder(order.id, updatedOrder);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteOrder(order.id);
    setShowOptions(false);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
    if (showOptions) setShowOptions(false);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .springify()
        .damping(15)}
      layout={Layout.springify().damping(15)}
      style={[
        styles.container,
        { backgroundColor: colors.white, borderColor: colors.border },
        cardAnimatedStyle,
      ]}
    >
      <AnimatedPressable
        onPress={toggleDetails}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
         <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.gymName, { color: colors.text }]}>
            {order.gymName}
          </Text>
          <View style={styles.headerRight}>
            {isLegacy && (
              <View
                style={[styles.legacyBadge, { backgroundColor: colors.warning + "20" }]}
                accessibilityLabel="Datos legacy"
              >
                <Text style={[styles.legacyBadgeText, { color: colors.warning }]}>
                  Datos legacy
                </Text>
              </View>
            )}
            <StatusBadge status={order.status} />
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={() => setShowOptions(!showOptions)}
            >
              <MoreVertical size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.productsContainer}>
          {order.products.map((product, idx) => {
            const icon = getProductIcon(product.type);
            return (
              <Animated.View
                key={idx}
                style={styles.productItem}
                entering={FadeIn.delay(100 + idx * 50)}
              >
                <View
                  style={[
                    styles.productIcon,
                    { backgroundColor: icon.color + "15" },
                  ]}
                >
                  <Text style={[styles.productIconText, { color: icon.color }]}>
                    {icon.label}
                  </Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]}>
                    {product.type === "A" && "Avena"}
                    {product.type === "GNY" && "Galletas"}
                    {product.type === "C" && "Cookies"}
                    {product.type === "K" && "Ketos"}
                  </Text>
                  <Text
                    style={[
                      styles.productQuantity,
                      { color: colors.textLight },
                    ]}
                  >
                    x{product.quantity}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {order.notes && (
          <View style={styles.notesContainer}>
            <Text
              style={[styles.notesText, { color: colors.textLight }]}
              numberOfLines={2}
            >
              {order.notes}
            </Text>
          </View>
        )}

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.dateText, { color: colors.textLight }]}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
          <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
            {showDetails ? "Ocultar Detalles" : "Ver Detalles"}
          </Text>
        </View>
      </AnimatedPressable>

      {showOptions && (
        <Animated.View
          entering={FadeIn.duration(150).springify()}
          exiting={FadeOut.duration(100)}
          style={[
            styles.optionsMenu,
            { backgroundColor: colors.white, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setIsEditing(true);
              setShowOptions(false);
              setShowDetails(true);
            }}
          >
            <Pencil
              size={16}
              color={colors.primary}
              style={styles.optionIcon}
            />
            <Text style={[styles.optionText, { color: colors.text }]}>
              Editar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={handleDelete}>
            <Trash2 size={16} color={colors.error} style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: colors.error }]}>
              Eliminar
            </Text>
          </TouchableOpacity>
          {isLegacy && onFix && (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                onFix(order.id);
                setShowOptions(false);
              }}
            >
              <Pencil
                size={16}
                color={colors.warning}
                style={styles.optionIcon}
              />
              <Text style={[styles.optionText, { color: colors.warning }]}>
                Corregir Sabor
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {showDetails && (
        <Animated.View
          entering={FadeInDown.duration(250).springify().damping(15)}
          exiting={FadeOut.duration(150)}
        >
          <OrderDetails
            order={order}
            isEditing={isEditing}
            onClose={() => {
              setShowDetails(false);
              setIsEditing(false);
            }}
            onSave={handleSaveEdit}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    ...SHADOWS.small,
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gymName: {
    ...FONTS.h3,
    color: COLORS.text,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionsButton: {
    padding: 4,
    marginLeft: 8,
  },
  productsContainer: {
    padding: 16,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productIconText: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  productInfo: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  productQuantity: {
    ...FONTS.body2,
    color: COLORS.textLight,
  },
  notesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  notesText: {
    ...FONTS.body3,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateText: {
    ...FONTS.body3,
    color: COLORS.textLight,
  },
  viewDetailsText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  optionsMenu: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 8,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  legacyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  legacyBadgeText: {
    ...FONTS.body3,
    fontWeight: "600",
  },
});
