import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/constants/theme";
import { Gym } from "@/types";
import { useThemeStore } from "@/store/themeStore";
import { X } from "lucide-react-native";

interface GymDeleteDialogProps {
  visible: boolean;
  gym: Gym | null;
  hasOrders: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  onConfirmDeactivate: () => void;
}

export default function GymDeleteDialog({
  visible,
  gym,
  hasOrders,
  onClose,
  onConfirmDelete,
  onConfirmDeactivate,
}: GymDeleteDialogProps) {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  if (!gym) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {hasOrders ? "Desactivar Gimnasio" : "Eliminar Gimnasio"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.body, { color: colors.text }]}>
            {hasOrders
              ? `"${gym.name}" tiene pedidos asociados. No se puede eliminar, pero puedes desactivarlo.`
              : `¿Eliminar "${gym.name}"? Esta acción no se puede deshacer.`}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  backgroundColor: hasOrders ? "#ff9800" : "#ef4444",
                },
              ]}
              onPress={hasOrders ? onConfirmDeactivate : onConfirmDelete}
            >
              <Text style={styles.confirmText}>
                {hasOrders ? "Desactivar" : "Eliminar"}
              </Text>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.h3.fontFamily,
  },
  body: {
    fontSize: 15,
    fontFamily: FONTS.body2.fontFamily,
    lineHeight: 22,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontFamily: FONTS.h4.fontFamily,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: FONTS.h4.fontFamily,
  },
});
