import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { ImportResult } from "@/types";

interface ImportPreviewProps {
  results: ImportResult[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportPreview({
  results,
  onConfirm,
  onCancel,
}: ImportPreviewProps) {
  const hasValidRows = results.some((r) => r.status === "ok");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Preview</Text>

      <ScrollView
        style={styles.list}
        accessibilityRole="list"
        accessibilityLabel="Import results"
      >
        {results.map((result) => (
          <View
            key={result.row}
            style={[
              styles.row,
              result.status === "error" ? styles.rowError : styles.rowOk,
            ]}
            accessibilityRole="text"
          >
            <Text style={styles.rowNumber}>Row {result.row}</Text>
            {result.status === "ok" ? (
              <Text style={styles.okText}>✓ Valid</Text>
            ) : (
              <Text style={styles.errorText}>{result.error}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, !hasValidRows && styles.confirmButtonDisabled]}
          onPress={onConfirm}
          disabled={!hasValidRows}
        >
          <Text style={styles.confirmButtonText}>
            Confirm Merge ({results.filter((r) => r.status === "ok").length} rows)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  list: {
    maxHeight: 400,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  rowOk: {
    backgroundColor: "#F0FDF4",
  },
  rowError: {
    backgroundColor: "#FEF2F2",
  },
  rowNumber: {
    fontWeight: "600",
    color: "#374151",
  },
  okText: {
    color: "#16A34A",
    fontWeight: "600",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
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
  confirmButton: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
