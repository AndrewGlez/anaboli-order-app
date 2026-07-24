import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Download, Upload, PlusCircle, Package } from "lucide-react-native";
import { useInventoryStore } from "@/store/inventoryStore";
import { useHydrated } from "@/hooks/useHydrated";
import { InventoryListItem } from "@/components/InventoryListItem";
import { InventoryForm } from "@/components/InventoryForm";
import { ImportPreview } from "@/components/ImportPreview";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import EmptyState from "@/components/EmptyState";
import { useThemeStore } from "@/store/themeStore";
import { ProductType, ImportResult } from "@/types";

export default function InventoryScreen() {
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const hydrated = useHydrated();
  const items = useInventoryStore((state) => state.items);
  const addItem = useInventoryStore((state) => state.addItem);
  const updateItem = useInventoryStore((state) => state.updateItem);
  const importItems = useInventoryStore((state) => state.importItems);
  const exportItems = useInventoryStore((state) => state.exportItems);

  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredItems = items.filter((item) =>
    searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    } catch {
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
    } catch {
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

  if (!hydrated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textLight }]}>
            Loading inventory...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            📦 Inventario
          </Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              Platform.OS !== "web" && styles.actionButtonDisabled,
              { backgroundColor: colors.success },
              Platform.OS !== "web" && { backgroundColor: colors.border },
            ]}
            onPress={handleFileImport}
            disabled={Platform.OS !== "web"}
            accessibilityState={
              Platform.OS !== "web"
                ? { disabled: true }
                : undefined
            }
            accessibilityLabel="Import inventory from Excel"
          >
            <Upload size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleExport}
            accessibilityLabel="Export inventory to Excel"
          >
            <Download size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.searchContainer,
          { borderColor: colors.border, padding: SIZES.padding },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.white, borderColor: colors.border },
          ]}
        >
          <Search size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setFormVisible(true)}
          accessibilityLabel="Add inventory item"
        >
          <PlusCircle size={20} color={COLORS.white} />
        </TouchableOpacity>
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
      ) : filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setEditingItem(item)}
              activeOpacity={0.8}
            >
              <InventoryListItem item={item} colors={colors} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          title={
            items.length === 0
              ? "No hay items en inventario"
              : "No se encontraron items"
          }
          description={
            items.length === 0
              ? "Agrega items manualmente o importa desde Excel"
              : "Intenta cambiar tu búsqueda"
          }
          icon={<Package size={50} color={COLORS.textLight} />}
        />
      )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...FONTS.body1,
  },
  header: {
    padding: SIZES.padding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.h1,
  },
  subtitle: {
    ...FONTS.body3,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: COLORS.white,
    ...FONTS.body3,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    height: 46,
    borderRadius: SIZES.radius,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    ...FONTS.body2,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: SIZES.radius,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  listContent: {
    padding: SIZES.padding,
  },
});