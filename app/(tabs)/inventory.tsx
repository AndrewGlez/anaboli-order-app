import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useInventoryStore } from "@/store/inventoryStore";
import { useHydrated } from "@/hooks/useHydrated";
import { InventoryListItem } from "@/components/InventoryListItem";
import { InventoryForm } from "@/components/InventoryForm";
import { ImportPreview } from "@/components/ImportPreview";
import { COLORS } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { ProductType, ImportResult } from "@/types";

export default function InventoryScreen() {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const hydrated = useHydrated();
  const items = useInventoryStore((state) => state.items);
  const addItem = useInventoryStore((state) => state.addItem);
  const updateItem = useInventoryStore((state) => state.updateItem);
  const deleteItem = useInventoryStore((state) => state.deleteItem);
  const importItems = useInventoryStore((state) => state.importItems);
  const exportItems = useInventoryStore((state) => state.exportItems);

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    type: ProductType;
    quantity: number;
    minThreshold: number;
    price: number;
  } | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [pendingRows, setPendingRows] = useState<any[] | null>(null);

  if (!hydrated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading inventory...
        </Text>
      </View>
    );
  }

  const handleFileImport = async () => {
    if (Platform.OS !== "web") {
      Alert.alert("Import available on web only");
      return;
    }

    try {
      const { parseExcelImport } = await require("@/services/web/fileImport");
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx";
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const results = await parseExcelImport(file);
        setImportResults(results);
        setPendingRows(results);
      };
      input.click();
    } catch (error) {
      Alert.alert("Error", "Failed to import file");
    }
  };

  const handleImportConfirm = () => {
    if (pendingRows) {
      importItems(pendingRows);
      setImportResults(null);
      setPendingRows(null);
    }
  };

  const handleExport = async () => {
    try {
      await exportItems();
    } catch (error) {
      Alert.alert("Error", "Failed to export inventory");
    }
  };

  const handleAddItem = (data: {
    name: string;
    type: ProductType;
    quantity: number;
    minThreshold: number;
    price: number;
  }) => {
    addItem(data);
  };

  const handleEditItem = (data: {
    name: string;
    type: ProductType;
    quantity: number;
    minThreshold: number;
    price: number;
    reason?: string;
  }) => {
    if (editingItem) {
      updateItem(editingItem.id, {
        name: data.name,
        type: data.type,
        quantity: data.quantity,
        minThreshold: data.minThreshold,
        price: data.price,
        lastAdjustmentReason: data.reason || "manual",
      });
      setEditingItem(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          📦 Inventario
        </Text>
        <View style={styles.headerButtons}>
          {Platform.OS === "web" && (
            <TouchableOpacity
              style={styles.importButton}
              onPress={handleFileImport}
            >
              <Text style={styles.importButtonText}>Import</Text>
            </TouchableOpacity>
          )}
          {Platform.OS !== "web" && (
            <TouchableOpacity
              style={[styles.importButton, styles.importButtonDisabled]}
              disabled
              accessibilityState={{ disabled: true }}
              accessibilityLabel="Import available on web only"
            >
              <Text style={styles.importButtonTextDisabled}>Import</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {importResults ? (
        <ImportPreview
          results={importResults}
          onConfirm={handleImportConfirm}
          onCancel={() => {
            setImportResults(null);
            setPendingRows(null);
          }}
        />
      ) : (
        <ScrollView style={styles.list}>
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                No items in inventory
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
                Add items manually or import from Excel
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setEditingItem(item)}
              >
                <InventoryListItem item={item} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setFormVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <InventoryForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleAddItem}
      />

      <InventoryForm
        visible={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleEditItem}
        initialData={editingItem || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  importButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  importButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  importButtonText: {
    color: "white",
    fontWeight: "600",
  },
  importButtonTextDisabled: {
    color: "#D1D5DB",
    fontWeight: "600",
  },
  exportButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: "white",
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },
});
