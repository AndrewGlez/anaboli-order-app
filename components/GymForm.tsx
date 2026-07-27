import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { Gym } from "@/types";
import { useThemeStore } from "@/store/themeStore";
import { X } from "lucide-react-native";

interface GymFormProps {
  visible: boolean;
  gym?: Gym | null;
  onClose: () => void;
  onSubmit: (name: string) => { ok: boolean; reason?: string };
}

export default function GymForm({
  visible,
  gym,
  onClose,
  onSubmit,
}: GymFormProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setName(gym?.name ?? "");
      setError("");
    }
  }, [visible, gym]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre no puede estar vacío");
      return;
    }
    const result = onSubmit(trimmed);
    if (!result.ok) {
      setError(result.reason ?? "Error");
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {gym ? "Editar Gimnasio" : "Nuevo Gimnasio"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: error ? "#ef4444" : colors.border,
              },
            ]}
            placeholder="Nombre del gimnasio"
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError("");
            }}
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.submitText, { color: colors.onPrimary }]}>
              {gym ? "Guardar" : "Crear"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.h3.fontFamily,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: FONTS.body1.fontFamily,
    marginBottom: 8,
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    fontFamily: FONTS.body3.fontFamily,
    marginBottom: 8,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    fontSize: 16,
    fontFamily: FONTS.h4.fontFamily,
  },
});
