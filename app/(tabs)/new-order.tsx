import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useOrderStore } from "@/store/orderStore";
import { ProductType, OrderStatus, Gasto, FlavorCode } from "@/types";
import { FLAVOR_CODES } from "@/constants/productionCatalog";
import ProductSelector from "@/components/ProductSelector";
import StatusSelector from "@/components/StatusSelector";
import { useThemeStore } from "@/store/themeStore";
import { toast } from "sonner";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NewOrderScreen() {
  const router = useRouter();
  const { addOrder, addGasto } = useOrderStore();
  const { theme } = useThemeStore();

  const colors = COLORS.themed(theme);

  const [gymName, setGymName] = useState("");
  const [products, setProducts] = useState<
    Array<{ type: ProductType; quantity: number }>
  >([]);
  const [status, setStatus] = useState<OrderStatus>("Entregado");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [flavor, setFlavor] = useState<FlavorCode | null>(null);
  const [flavorError, setFlavorError] = useState<string | null>(null);

  // Gastos (expenses) state
  const [gastos, setGastos] = useState<Array<{ name: string; price: string }>>(
    []
  );

  const handleAddProduct = () => {
    setProducts([...products, { type: "A", quantity: 1 }]);
    toast.success("Producto agregado", {
      description: "Selecciona el tipo y la cantidad del producto.",
    });
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

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  // Gastos handlers
  const handleAddGasto = () => {
    setGastos([...gastos, { name: "", price: "" }]);
  };

  const handleUpdateGasto = (
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    const updatedGastos = [...gastos];
    updatedGastos[index] = { ...updatedGastos[index], [field]: value };
    setGastos(updatedGastos);
  };

  const handleRemoveGasto = (index: number) => {
    const updatedGastos = [...gastos];
    updatedGastos.splice(index, 1);
    setGastos(updatedGastos);
  };

  const handleSubmit = () => {
    console.debug("[order:create] submit started", {
      hasGymName: Boolean(gymName.trim()),
      productCount: products.length,
      hasFlavor: Boolean(flavor),
    });

    if (!gymName.trim()) {
      console.debug("[order:create] validation failed: missing gym name");
      Alert.alert("Error", "Por favor ingresa el nombre del gimnasio");
      return;
    }

    if (products.length === 0) {
      console.debug("[order:create] validation failed: no products");
      Alert.alert("Error", "Por favor agrega al menos un producto");
      return;
    }

    if (!flavor) {
      console.debug("[order:create] validation failed: missing flavor");
      Alert.alert("Error", "Por favor selecciona un sabor");
      setFlavorError("El sabor es obligatorio");
      return;
    }

    const newOrder = {
      id: Date.now().toString(),
      gymName,
      products,
      status,
      notes,
      flavor,
      ...(price ? { price: parseFloat(price) } : {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.debug("[order:create] submitting order", {
      orderId: newOrder.id,
      productTypes: products.map((product) => product.type),
      productCount: products.length,
      flavor: newOrder.flavor,
    });

    const result = addOrder(newOrder);

    if (!result.ok) {
      console.warn("[order:create] rejected by store", {
        orderId: newOrder.id,
        reason: result.reason,
        shortfall: result.shortfall,
      });
      if (result.reason === "insufficient_stock") {
        const shortfall = result.shortfall
          ? Object.entries(result.shortfall)
              .map(([type, qty]) => `${type} (faltan ${qty})`)
              .join(", ")
          : "";
        Alert.alert(
          "Stock insuficiente",
          `No hay suficiente stock para esta orden${shortfall ? `: ${shortfall}` : ""}`
        );
      } else {
        Alert.alert("Error", `No se pudo crear la orden: ${result.reason}`);
      }
      return;
    }

    console.debug("[order:create] order persisted", { orderId: newOrder.id });

    // Save gastos
    gastos.forEach((gasto) => {
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

    Alert.alert("Éxito", "Orden creada con éxito");

    // Reset form
    setGymName("");
    setProducts([]);
    setStatus("Entregado");
    setNotes("");
    setPrice("");
    setGastos([]);

    // Navigate back to orders
    console.debug("[order:create] navigating to orders", { orderId: newOrder.id });
    router.push("/");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Animated.View style={styles.header} entering={FadeInDown.duration(300)}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Crear nueva orden
        </Text>
      </Animated.View>

      <ScrollView style={styles.form}>
        <Animated.View
          style={styles.formGroup}
          entering={FadeInDown.delay(100).springify()}
        >
          <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.white,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={gymName}
            onChangeText={setGymName}
            placeholder="Ingresa el nombre del gym"
            placeholderTextColor={colors.textLight}
          />
        </Animated.View>

        <Animated.View
          style={styles.formGroup}
          entering={FadeInDown.delay(150).springify()}
        >
          <Text style={[styles.label, { color: colors.text }]}>Productos</Text>
          {products.map((product, index) => (
            <Animated.View
              key={index}
              style={[styles.productRow, { borderColor: colors.primary }]}
              entering={SlideInRight.springify().damping(15)}
              exiting={SlideOutRight.springify()}
              layout={Layout.springify()}
            >
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
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    color: colors.text,
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
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </Animated.View>
          ))}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddProduct}
          >
            <PlusCircle size={20} color={colors.onPrimary} />
            <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>
              Agregar Productos
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Flavor Selector - Mandatory */}
        <Animated.View
          style={styles.formGroup}
          entering={FadeInDown.delay(175).springify()}
        >
          <Text style={[styles.label, { color: colors.text }]}>
            Sabor *
          </Text>
          <View style={styles.flavorSelector}>
            {FLAVOR_CODES.map((flavorCode) => (
              <TouchableOpacity
                key={flavorCode}
                style={[
                  styles.flavorOption,
                  {
                    borderColor: flavorError ? colors.error : colors.border,
                    backgroundColor:
                      flavor === flavorCode
                        ? colors.primary
                        : colors.white,
                  },
                ]}
                onPress={() => {
                  setFlavor(flavorCode as FlavorCode);
                  setFlavorError(null);
                }}
              >
                <Text
                  style={{
                    color:
                      flavor === flavorCode ? colors.white : colors.text,
                    fontSize: 12,
                    fontWeight: flavor === flavorCode ? "600" : "400",
                  }}
                >
                  {flavorCode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {flavorError && (
            <Text style={{ color: colors.error, marginTop: 8, fontSize: 14 }}>
              {flavorError}
            </Text>
          )}
        </Animated.View>

        <Animated.View
          style={styles.formGroup}
          entering={FadeInDown.delay(200).springify()}
        >
          <Text style={[styles.label, { color: colors.text }]}>Estado</Text>
          <StatusSelector value={status} onChange={setStatus} />
        </Animated.View>

        <Animated.View
          style={styles.formGroup}
          entering={FadeInDown.delay(250).springify()}
        >
          <Text style={[styles.label, { color: colors.text }]}>Precio</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.white,
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
        </Animated.View>

        <Animated.View
          style={styles.formGroup}
          entering={FadeInDown.delay(300).springify()}
        >
          <Text style={[styles.label, { color: colors.text }]}>Notas</Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                backgroundColor: colors.white,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Agrega notas adicionales"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Animated.View>

        <Animated.View
          style={styles.formGroup}
          entering={FadeInDown.delay(350).springify()}
        >
          <Text style={[styles.label, { color: colors.text }]}>Gastos</Text>
          {gastos.map((gasto, index) => (
            <Animated.View
              key={index}
              style={[styles.gastoRow, { borderColor: colors.warning }]}
              entering={SlideInRight.springify().damping(15)}
              exiting={SlideOutRight.springify()}
              layout={Layout.springify()}
            >
              <TextInput
                style={[
                  styles.gastoNameInput,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={gasto.name}
                onChangeText={(text) => handleUpdateGasto(index, "name", text)}
                placeholder="Nombre del gasto"
                placeholderTextColor={colors.textLight}
              />
              <TextInput
                style={[
                  styles.gastoPriceInput,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={gasto.price}
                onChangeText={(text) => handleUpdateGasto(index, "price", text)}
                placeholder="$0.00"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveGasto(index)}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </Animated.View>
          ))}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.warning }]}
            onPress={handleAddGasto}
          >
            <PlusCircle size={20} color={colors.onPrimary} />
            <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>
              Agregar Gasto
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>
            Crear Orden
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.padding,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    ...FONTS.h2,
  },
  form: {
    flex: 1,
    padding: SIZES.padding,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.h3,
    marginBottom: 8,
  },
  input: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 12,
    ...FONTS.body2,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityInput: {
    width: 60,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 10,
    ...FONTS.body2,
    textAlign: "center",
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SIZES.radius,
    padding: 12,
    justifyContent: "center",
    marginTop: 10,
  },
  addButtonText: {
    ...FONTS.body2,
    marginLeft: 8,
  },
  gastoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderLeftWidth: 3,
    paddingLeft: 10,
  },
  gastoNameInput: {
    flex: 1,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 12,
    ...FONTS.body2,
  },
  gastoPriceInput: {
    width: 100,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 10,
    ...FONTS.body2,
    textAlign: "center",
  },
  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
  },
  submitButton: {
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    ...FONTS.h3,
  },
  // Flavor selector styles
  flavorSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  flavorOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
});
