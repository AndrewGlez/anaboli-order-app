import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Info,
  Trash2,
  Download,
  Upload,
  Bell,
  Moon,
  Copy,
  Share2,
  ClipboardCheck,
} from "lucide-react-native";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useOrderStore } from "@/store/orderStore";
import { useThemeStore } from "@/store/themeStore";

export default function SettingsScreen() {
  const {
    clearOrders,
    getOrdersAsJSON,
    importOrdersFromJSON,
    exportOrdersToShare,
  } = useOrderStore();
  const { theme, toggleTheme } = useThemeStore();
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState("");

  const colors = COLORS.themed(theme);

  const handleClearData = () => {
    Alert.alert(
      "Borrar todos los datos",
      "Estas seguro de que deseas borrar todos los datos de la aplicación? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Borrar",
          onPress: () => {
            clearOrders();
            Alert.alert("Éxito", "Todos los datos han sido borrados.");
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const jsonData = getOrdersAsJSON();
      await Clipboard.setString(jsonData);
      Alert.alert(
        "Datos Exportados",
        "Los datos han sido copiados al portapapeles como JSON. Puedes pegarlos en un archivo de texto para guardarlos."
      );
    } catch (error) {
      Alert.alert(
        "Error al exportar",
        "No se pudieron exportar los datos. Inténtalo de nuevo."
      );
    }
  };

  const handleShareExport = async () => {
    try {
      const result = await exportOrdersToShare();
      if (!result.success) {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert(
        "Error al compartir",
        "No se pudieron compartir los datos. Inténtalo de nuevo."
      );
    }
  };

  const handleImportData = () => {
    setImportModalVisible(true);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) {
      Alert.alert("Error", "Por favor, introduce los datos JSON a importar.");
      return;
    }

    const result = importOrdersFromJSON(importText);
    setImportModalVisible(false);
    setImportText("");

    Alert.alert(
      result.success ? "Importación exitosa" : "Error en la importación",
      result.message
    );
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      setImportText(clipboardContent);
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo acceder al portapapeles. Por favor, pega manualmente."
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Ajustes</Text>

      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Apariencia
          </Text>
          <View
            style={[
              styles.settingItem,
              { backgroundColor: colors.white, borderColor: colors.border },
            ]}
          >
            <View style={styles.settingLabelContainer}>
              <Moon size={20} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Modo oscuro
              </Text>
            </View>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Administrar Datos
          </Text>
          <TouchableOpacity
            style={[
              styles.dataButton,
              { backgroundColor: colors.white, borderColor: colors.border },
            ]}
            onPress={handleExportData}
          >
            <Copy size={20} color={colors.primary} style={styles.buttonIcon} />
            <Text style={[styles.dataButtonText, { color: colors.text }]}>
              Exportar al Portapapeles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dataButton,
              { backgroundColor: colors.white, borderColor: colors.border },
            ]}
            onPress={handleShareExport}
          >
            <Share2
              size={20}
              color={colors.primary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.dataButtonText, { color: colors.text }]}>
              Exportar como Archivo JSON
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dataButton,
              { backgroundColor: colors.white, borderColor: colors.border },
            ]}
            onPress={handleImportData}
          >
            <ClipboardCheck
              size={20}
              color={colors.primary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.dataButtonText, { color: colors.text }]}>
              Importar Datos (JSON)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dangerButton,
              { backgroundColor: colors.white, borderColor: colors.error },
            ]}
            onPress={handleClearData}
          >
            <Trash2 size={20} color={colors.error} style={styles.buttonIcon} />
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>
              Borrar Todo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acerca de
          </Text>
          <View style={styles.aboutContainer}>
            <Info size={16} color={colors.textLight} style={styles.infoIcon} />
          </View>
          <Text style={[styles.aboutDetails, { color: colors.textLight }]}>
            Una aplicación para gestionar tus pedidos. Desarrollada por [Andrew
            González].
          </Text>
        </View>
      </ScrollView>

      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Importar Datos (JSON)
            </Text>
            <Text style={[styles.modalInstructions, { color: colors.text }]}>
              Pega el JSON exportado previamente para importar los datos:
            </Text>
            <TextInput
              style={[
                styles.jsonInput,
                {
                  backgroundColor: colors.white,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              multiline
              value={importText}
              onChangeText={setImportText}
              placeholder="Pega el JSON aquí..."
              placeholderTextColor={colors.textLight}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.pasteButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handlePasteFromClipboard}
              >
                <ClipboardCheck size={18} color={COLORS.white} />
                <Text style={styles.pasteButtonText}>Pegar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { borderColor: colors.border, backgroundColor: colors.white },
                ]}
                onPress={() => setImportModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.importButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleImportSubmit}
              >
                <Text style={[styles.buttonText, { color: COLORS.white }]}>
                  Importar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...FONTS.h2,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    ...FONTS.body2,
  },
  dataButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 12,
  },
  dataButtonText: {
    ...FONTS.body2,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: SIZES.radius,
    marginTop: 8,
    borderWidth: 1,
  },
  dangerButtonText: {
    ...FONTS.body2,
  },
  aboutContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  aboutText: {
    ...FONTS.body2,
  },
  aboutDetails: {
    ...FONTS.body3,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: SIZES.radius,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    ...FONTS.h2,
    marginBottom: 16,
    textAlign: "center",
  },
  modalInstructions: {
    ...FONTS.body3,
    marginBottom: 16,
  },
  jsonInput: {
    height: 200,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  pasteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.radius / 2,
  },
  pasteButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: 6,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: SIZES.radius,
    marginRight: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  importButton: {
    flex: 1,
    padding: 16,
    borderRadius: SIZES.radius,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    ...FONTS.body2,
    textAlign: "center",
  },
});
