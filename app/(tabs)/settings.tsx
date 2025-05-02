import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info, Trash2, Download, Upload, Bell, Moon } from 'lucide-react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { useOrderStore } from '@/store/orderStore';
import { useThemeStore } from '@/store/themeStore';

export default function SettingsScreen() {
  const { clearOrders } = useOrderStore();
  const { theme, toggleTheme } = useThemeStore();

  const colors = COLORS.themed(theme);

  const handleClearData = () => {
    Alert.alert(
      'Borrar todos los datos',
      'Estas seguro de que deseas borrar todos los datos de la aplicación? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Borrar',
          onPress: () => {
            clearOrders();
            Alert.alert('Éxito', 'Todos los datos han sido borrados.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'This feature will be available in the next update');
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'This feature will be available in the next update');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Ajustes</Text>

      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
          <View style={[styles.settingItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <View style={styles.settingLabelContainer}>
              <Moon size={20} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Modo oscuro</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Administrar Datos</Text>
          <TouchableOpacity
            disabled
            style={[styles.dataButton, { backgroundColor: colors.white, borderColor: colors.border }]}
            onPress={handleExportData}
          >
            <Download size={20} color={colors.primary} style={styles.buttonIcon} />
            <Text style={[styles.dataButtonText, { color: colors.text }]}>Exportar Datos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled
            style={[styles.dataButton, { backgroundColor: colors.white, borderColor: colors.border }]}
            onPress={handleImportData}
          >
            <Upload size={20} color={colors.primary} style={styles.buttonIcon} />
            <Text style={[styles.dataButtonText, { color: colors.text }]}>Importar Datos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.white, borderColor: colors.error }]}
            onPress={handleClearData}
          >
            <Trash2 size={20} color={colors.error} style={styles.buttonIcon} />
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>Borrar Todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acerca de</Text>
          <View style={styles.aboutContainer}>
            <Info size={16} color={colors.textLight} style={styles.infoIcon} />
            <Text style={[styles.aboutText, { color: colors.text }]}>
              Gym Order Tracker v1.0.0
            </Text>
          </View>
          <Text style={[styles.aboutDetails, { color: colors.textLight }]}>
            Una aplicación para gestionar tus pedidos. Desarrollada por [Andrew González].
          </Text>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    ...FONTS.body2,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    marginTop: 8,
    borderWidth: 1,
  },
  dangerButtonText: {
    ...FONTS.body2,
  },
  aboutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});