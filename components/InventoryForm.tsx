import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { ProductType } from "@/types";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";

interface InventoryFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    type: ProductType;
    quantity: number;
    minThreshold: number;
    price: number;
    reason?: string;
  }) => void;
  initialData?: {
    name: string;
    type: ProductType;
    quantity: number;
    minThreshold: number;
    price: number;
  };
}

const PRODUCT_TYPES: { type: ProductType; label: string; color: string }[] = [
  { type: "A", label: "Avena", color: COLORS.productA },
  { type: "GNY", label: "Galletas", color: COLORS.productGNY },
  { type: "C", label: "Cookies", color: COLORS.productC },
  { type: "K", label: "Ketos", color: COLORS.productK },
];

export function InventoryForm({
  visible,
  onClose,
  onSave,
  initialData,
}: InventoryFormProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<ProductType>(initialData?.type || "A");
  const [quantity, setQuantity] = useState(
    initialData?.quantity?.toString() || "0"
  );
  const [minThreshold, setMinThreshold] = useState(
    initialData?.minThreshold?.toString() || "0"
  );
  const [price, setPrice] = useState(initialData?.price?.toString() || "0");
  const [reason, setReason] = useState("");

  const handleSave = () => {
    const qty = parseInt(quantity, 10);
    const min = parseInt(minThreshold, 10);
    const prc = parseFloat(price);

    if (isNaN(qty) || qty < 0) return;
    if (isNaN(min) || min < 0) return;
    if (isNaN(prc) || prc < 0) return;

    onSave({
      name,
      type,
      quantity: qty,
      minThreshold: min,
      price: prc,
      ...(initialData && reason ? { reason } : {}),
    });

    // Reset form
    setName("");
    setType("A");
    setQuantity("0");
    setMinThreshold("0");
    setPrice("0");
    setReason("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.white, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {initialData ? "Editar Item" : "Agregar Item"}
          </Text>

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
            value={name}
            onChangeText={setName}
            placeholder="Nombre del item"
            placeholderTextColor={colors.textLight}
          />

          <Text style={[styles.label, { color: colors.text }]}>Tipo</Text>
          <View style={styles.typeContainer}>
            {PRODUCT_TYPES.map((p) => (
              <TouchableOpacity
                key={p.type}
                style={[
                  styles.typeButton,
                  {
                    borderColor:
                      type === p.type ? p.color : colors.border,
                    backgroundColor:
                      type === p.type ? p.color + "15" : "transparent",
                  },
                ]}
                onPress={() => setType(p.type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        type === p.type ? p.color : colors.textLight,
                    },
                  ]}
                >
                  {p.type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Cantidad</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.white,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textLight}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Stock mínimo
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.white,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={minThreshold}
            onChangeText={setMinThreshold}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textLight}
          />

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
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textLight}
          />

          {initialData && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>
                Razón (requerido para ediciones)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={reason}
                onChangeText={setReason}
                placeholder="Razón del cambio"
                placeholderTextColor={colors.textLight}
              />
            </>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textLight }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
                initialData && !reason && { backgroundColor: colors.border },
              ]}
              onPress={handleSave}
              disabled={!!initialData && !reason}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding + 4,
    width: "90%",
    maxWidth: 420,
    borderWidth: 1,
  },
  title: {
    ...FONTS.h2,
    marginBottom: 16,
  },
  label: {
    ...FONTS.body2,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: 12,
    ...FONTS.body1,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    borderWidth: 1,
  },
  typeButtonText: {
    ...FONTS.body2,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    borderWidth: 1,
  },
  cancelButtonText: {
    ...FONTS.body2,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
  },
  saveButtonText: {
    color: COLORS.white,
    ...FONTS.body2,
    fontWeight: "600",
  },
});