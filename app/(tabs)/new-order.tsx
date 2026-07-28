import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import Animated, {
  FadeInDown,
  Layout,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useOrderStore } from "@/store/orderStore";
import { useGymCatalog } from "@/hooks/useGymCatalog";
import { ProductType, OrderStatus, Gasto, FlavorCode } from "@/types";
import { FLAVOR_CODES } from "@/constants/productionCatalog";
import ProductSelector from "@/components/ProductSelector";
import StatusSelector from "@/components/StatusSelector";
import { useThemeStore } from "@/store/themeStore";
import { toast } from "sonner";
import { z } from "zod";

const orderFormSchema = z.object({
  gymName: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(120, "El nombre es demasiado largo"),
  products: z.array(
    z.object({
      type: z.enum(["A", "GNY", "C", "K"]),
      quantity: z.number().int("La cantidad debe ser un entero").positive("La cantidad debe ser mayor que cero"),
    })
  ).min(1, "Agrega al menos un producto").max(50, "No puedes agregar más de 50 productos"),
  status: z.enum(["Entregado", "Entregado + P", "Entregado + TRF"]),
  notes: z.string().max(1000, "Las notas son demasiado largas"),
  flavor: z.enum(FLAVOR_CODES as unknown as [FlavorCode, ...FlavorCode[]], "Selecciona un sabor"),
  price: z.string().trim().refine(
    (value) => value === "" || /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value),
    "El precio debe ser un número válido con hasta 2 decimales"
  ),
  gastos: z.array(
    z.object({
      name: z.string().trim().min(2, "El gasto necesita un nombre").max(120),
      price: z.string().trim().regex(/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/, "El gasto debe tener un precio válido"),
    })
  ).max(50, "No puedes agregar más de 50 gastos"),
});


export default function NewOrderScreen() {
  const router = useRouter();
  const { addOrder, addGasto } = useOrderStore();
  const { theme } = useThemeStore();
  const { gyms: activeGyms } = useGymCatalog();

  const colors = COLORS.themed(theme);

  const [selectedGymId, setSelectedGymId] = useState("");
  const [gymName, setGymName] = useState("");
  const [products, setProducts] = useState<
    { type: ProductType; quantity: number }[]
  >([]);
  const [status, setStatus] = useState<OrderStatus>("Entregado");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [flavor, setFlavor] = useState<FlavorCode | null>(null);
  const [flavorError, setFlavorError] = useState<string | null>(null);

  // Gastos (expenses) state
  const [gastos, setGastos] = useState<{ name: string; price: string }[]>(
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

    const validation = orderFormSchema.safeParse({
      gymName,
      products,
      status,
      notes,
      flavor,
      price,
      gastos,
    });

    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? "Revisa los datos del formulario";
      console.debug("[order:create] validation failed", {
        fields: validation.error.issues.map((issue) => issue.path.join(".")),
      });
      setFlavorError(validation.error.issues.some((issue) => issue.path[0] === "flavor") ? message : null);
      if (Platform.OS === "web") {
        toast.error("Revisa la orden", { description: message });
      } else {
        Alert.alert("Datos inválidos", message);
      }
      return;
    }

    const newOrder = {
      id: Date.now().toString(),
      gymId: selectedGymId || "",
      gymName,
      products,
      status,
      notes,
      flavor: flavor as FlavorCode,
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
        const message = `No hay suficiente stock para esta orden${shortfall ? `: ${shortfall}` : ""}`;
        if (Platform.OS === "web") {
          toast.error("Stock insuficiente", { description: message });
        } else {
          Alert.alert("Stock insuficiente", message);
        }
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
    setSelectedGymId("");
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
          <Text style={[styles.label, { color: colors.text }]}>Gimnasio</Text>
          {activeGyms.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gymSelector}>
              {activeGyms.map((gym) => (
                <TouchableOpacity
                  key={gym.id}
                  style={[
                    styles.gymOption,
                    {
                      backgroundColor: selectedGymId === gym.id ? colors.primary : colors.white,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedGymId(gym.id);
                    setGymName(gym.name);
                  }}
                >
                  <Text
                    style={{
                      color: selectedGymId === gym.id ? colors.white : colors.text,
                      fontSize: 14,
                    }}
                  >
                    {gym.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
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
            onChangeText={(text) => {
              setGymName(text);
              setSelectedGymId("");
            }}
            placeholder="O escribe el nombre del gym"
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
  gymSelector: {
    marginBottom: 8,
  },
  gymOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginRight: 8,
  },
});
