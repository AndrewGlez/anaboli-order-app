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

export function InventoryForm({
  visible,
  onClose,
  onSave,
  initialData,
}: InventoryFormProps) {
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
        <View style={styles.container}>
          <Text style={styles.title}>
            {initialData ? "Edit Item" : "Add Item"}
          </Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Item name"
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeContainer}>
            {(["A", "GNY", "C", "K"] as ProductType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeButton, type === t && styles.typeButtonActive]}
                onPress={() => setType(t)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === t && styles.typeButtonTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="0"
          />

          <Text style={styles.label}>Min Threshold</Text>
          <TextInput
            style={styles.input}
            value={minThreshold}
            onChangeText={setMinThreshold}
            keyboardType="numeric"
            placeholder="0"
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
          />

          {initialData && (
            <>
              <Text style={styles.label}>Reason (required for edits)</Text>
              <TextInput
                style={styles.input}
                value={reason}
                onChangeText={setReason}
                placeholder="Reason for change"
              />
            </>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                initialData && !reason && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={initialData && !reason}
            >
              <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  typeButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  typeButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "white",
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
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
