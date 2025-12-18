import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ArrowLeft, Plus, Trash2, PlusCircle } from "lucide-react-native";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Order, OrderStatus, ProductType, Gasto } from "@/types";
import StatusSelector from "./StatusSelector";
import ProductSelector from "./ProductSelector";
import { useThemeStore } from "@/store/themeStore";
import { useOrderStore } from "@/store/orderStore";
import { ColorSpace } from "react-native-reanimated";

interface OrderDetailsProps {
  order: Order;
  isEditing: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Partial<Order>) => void;
}

export default function OrderDetails({
  order,
  isEditing,
  onClose,
  onSave,
}: OrderDetailsProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const { gastos, addGasto, deleteGasto } = useOrderStore();

  const [gymName, setGymName] = useState(order.gymName);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [products, setProducts] = useState([...order.products]);
  const [notes, setNotes] = useState(order.notes || "");
  const [price, setPrice] = useState(order.price?.toString() || "");

  // Local gastos state for new gastos being added during edit
  const [newGastos, setNewGastos] = useState<
    Array<{ name: string; price: string }>
  >([]);

  const handleAddProduct = () => {
    setProducts([...products, { type: "A", quantity: 1 }]);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const handleUpdateProduct = (
    index: number,
    type: ProductType,
    quantity: number
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { type, quantity };
    setProducts(updatedProducts);
  };

  // Gastos handlers
  const handleAddNewGasto = () => {
    setNewGastos([...newGastos, { name: "", price: "" }]);
  };

  const handleUpdateNewGasto = (
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    const updatedGastos = [...newGastos];
    updatedGastos[index] = { ...updatedGastos[index], [field]: value };
    setNewGastos(updatedGastos);
  };

  const handleRemoveNewGasto = (index: number) => {
    const updatedGastos = [...newGastos];
    updatedGastos.splice(index, 1);
    setNewGastos(updatedGastos);
  };

  const handleDeleteExistingGasto = (id: string) => {
    deleteGasto(id);
  };

  const handleSave = () => {
    // Save new gastos
    newGastos.forEach((gasto) => {
      if (gasto.name.trim() && gasto.price) {
        const newGasto: Gasto = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: gasto.name.trim(),
          price: parseFloat(gasto.price) || 0,
          createdAt: new Date().toISOString(),
        };
        addGasto(newGasto);
      }
    });

    onSave({
      gymName,
      status,
      products,
      notes,
      price: parseFloat(price),
      updatedAt: new Date().toISOString(),
    });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.white, borderColor: colors.border },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? "Editar Orden" : "Detalles de Orden"}
        </Text>
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
            Nombre de Gym
          </Text>
          {isEditing ? (
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              value={gymName}
              onChangeText={setGymName}
              placeholder="Ingrese el nombre del gym"
              placeholderTextColor={colors.textLight}
            />
          ) : (
            <Text style={[styles.sectionContent, { color: colors.text }]}>
              {order.gymName}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
            Estado
          </Text>
          {isEditing ? (
            <StatusSelector value={status} onChange={setStatus} />
          ) : (
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(order.status) },
                ]}
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {order.status}
              </Text>
            </View>
          )}
        </View>

        {isEditing || (!isEditing && order.price) ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
              Precio
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={price}
                onChangeText={setPrice}
                placeholder="Ingresa el precio"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.sectionContent, { color: colors.text }]}>
                ${order.price?.toFixed(2)}
              </Text>
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
            Productos
          </Text>
          {products.map((product, index) => (
            <View key={index} style={styles.productRow}>
              {isEditing ? (
                <>
                  <ProductSelector
                    value={product.type}
                    onChange={(type) =>
                      handleUpdateProduct(index, type, product.quantity)
                    }
                  />
                  <TextInput
                    style={[
                      styles.quantityInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    value={product.quantity.toString()}
                    onChangeText={(text) => {
                      const quantity = parseInt(text) || 0;
                      handleUpdateProduct(index, product.type, quantity);
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveProduct(index)}
                  >
                    <Trash2 size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.productItem}>
                  <View
                    style={[
                      styles.productTypeContainer,
                      { backgroundColor: getProductColor(product.type) + "15" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.productTypeText,
                        { color: getProductColor(product.type) },
                      ]}
                    >
                      {product.type}
                    </Text>
                  </View>
                  <Text style={[styles.productDetails, { color: colors.text }]}>
                    {product.type === "A" && "Avena"}
                    {product.type === "GNY" && "Galletas"}
                    {product.type === "C" && "Cookies"}
                    {product.type === "K" && "Ketos"}
                    <Text style={styles.productQuantity}>
                      {" "}
                      x{product.quantity}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          ))}

          {isEditing && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <Plus size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Agregar Producto</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
            Notas
          </Text>
          {isEditing ? (
            <TextInput
              style={[
                styles.input,
                styles.notesInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textLight,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Agregar notas (opcional)"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[styles.sectionContent, { color: colors.textLight }]}>
              {order.notes || "No hay notas disponibles"}
            </Text>
          )}
        </View>

        {/* Gastos Section */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
              Gastos
            </Text>

            {/* Existing gastos */}
            {gastos.map((gasto) => (
              <View
                key={gasto.id}
                style={[
                  styles.gastoRow,
                  {
                    borderColor: colors.warning,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <View style={styles.gastoInfo}>
                  <Text style={[styles.gastoName, { color: colors.text }]}>
                    {gasto.name}
                  </Text>
                  <Text
                    style={[styles.gastoPrice, { color: colors.textLight }]}
                  >
                    ${gasto.price.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleDeleteExistingGasto(gasto.id)}
                >
                  <Trash2 size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            {newGastos.map((gasto, index) => (
              <View
                key={`new-${index}`}
                style={[styles.newGastoRow, { borderColor: colors.warning }]}
              >
                <TextInput
                  style={[
                    styles.gastoNameInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={gasto.name}
                  onChangeText={(text) =>
                    handleUpdateNewGasto(index, "name", text)
                  }
                  placeholder="Nombre del gasto"
                  placeholderTextColor={colors.textLight}
                />
                <TextInput
                  style={[
                    styles.gastoPriceInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={gasto.price}
                  onChangeText={(text) =>
                    handleUpdateNewGasto(index, "price", text)
                  }
                  placeholder="$0.00"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveNewGasto(index)}
                >
                  <Trash2 size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.addGastoButton,
                { backgroundColor: colors.warning },
              ]}
              onPress={handleAddNewGasto}
            >
              <PlusCircle size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Agregar Gasto</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isEditing && gastos.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
              Gastos
            </Text>
            {gastos.map((gasto) => (
              <View
                key={gasto.id}
                style={[
                  styles.gastoViewRow,
                  {
                    borderColor: colors.warning,
                    backgroundColor: colors.error + "40",
                    padding: 10,
                  },
                ]}
              >
                <View style={styles.gastoInfo}>
                  <Text style={[styles.gastoName, { color: colors.text }]}>
                    {gasto.name}
                  </Text>
                  <Text style={[styles.gastoDate, { color: colors.textLight }]}>
                    {new Date(gasto.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.gastoPriceView, { color: colors.text }]}>
                  ${gasto.price.toFixed(2)}
                </Text>
              </View>
            ))}
            <View
              style={[styles.gastosTotalRow, { borderTopColor: colors.border }]}
            >
              <Text
                style={[styles.gastosTotalLabel, { color: colors.textLight }]}
              >
                Total Gastos:
              </Text>
              <Text style={[styles.gastosTotalValue, { color: colors.text }]}>
                ${gastos.reduce((acc, g) => acc + g.price, 0).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {!isEditing && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Creado en</Text>
              <Text style={[styles.sectionContent, { color: colors.text }]}>
                {formatDate(order.createdAt)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Actualizado en</Text>
              <Text style={[styles.sectionContent, { color: colors.text }]}>
                {formatDate(order.updatedAt)}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
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

const getProductColor = (type: ProductType): string => {
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
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 20,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginLeft: 16,
    flex: 1,
  } as TextStyle,
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
  } as ViewStyle,
  saveButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
  } as TextStyle,
  content: {
    padding: 16,
  } as ViewStyle,
  section: {
    marginBottom: 20,
  } as ViewStyle,
  sectionLabel: {
    ...FONTS.body3,
    color: COLORS.textLight,
    marginBottom: 8,
  } as TextStyle,
  sectionContent: {
    ...FONTS.body2,
    color: COLORS.text,
  } as TextStyle,
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  } as ViewStyle,
  statusText: {
    ...FONTS.body2,
    color: COLORS.text,
  } as TextStyle,
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  productTypeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  } as ViewStyle,
  productTypeText: {
    ...FONTS.body3,
    fontWeight: "600",
  } as TextStyle,
  productDetails: {
    ...FONTS.body2,
    color: COLORS.text,
  } as TextStyle,
  productQuantity: {
    ...FONTS.body2,
    color: COLORS.textLight,
  } as TextStyle,
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    ...FONTS.body2,
    color: COLORS.text,
  } as TextStyle,
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  } as TextStyle,
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  } as ViewStyle,
  quantityInput: {
    width: 60,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginHorizontal: 10,
    ...FONTS.body2,
    color: COLORS.text,
    textAlign: "center",
  } as TextStyle,
  removeButton: {
    padding: 8,
  } as ViewStyle,
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 12,
    justifyContent: "center",
    marginTop: 10,
  } as ViewStyle,
  addButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
    marginLeft: 8,
  } as TextStyle,
  // Gastos styles
  gastoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  } as ViewStyle,
  gastoInfo: {
    flex: 1,
  } as ViewStyle,
  gastoName: {
    ...FONTS.body2,
  } as TextStyle,
  gastoPrice: {
    ...FONTS.body3,
    marginTop: 2,
  } as TextStyle,
  newGastoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderLeftWidth: 3,
    paddingLeft: 10,
  } as ViewStyle,
  gastoNameInput: {
    flex: 1,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 12,
    ...FONTS.body2,
  } as TextStyle,
  gastoPriceInput: {
    width: 100,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 10,
    ...FONTS.body2,
    textAlign: "center",
  } as TextStyle,
  addGastoButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SIZES.radius,
    padding: 12,
    justifyContent: "center",
    marginTop: 10,
  } as ViewStyle,
  // View mode gastos styles
  gastoViewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  } as ViewStyle,
  gastoDate: {
    ...FONTS.body3,
    marginTop: 2,
  } as TextStyle,
  gastoPriceView: {
    ...FONTS.h3,
    fontWeight: "600",
  } as TextStyle,
  gastosTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  } as ViewStyle,
  gastosTotalLabel: {
    ...FONTS.body2,
  } as TextStyle,
  gastosTotalValue: {
    ...FONTS.h3,
    fontWeight: "600",
  } as TextStyle,
});
