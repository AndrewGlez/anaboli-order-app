import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Clock, History } from "lucide-react-native";
import { FONTS, SIZES } from "@/constants/theme";
import {
  VersionInfo,
  formatVersionLabel,
  isHistoricalVersion,
  getReadOnlyMessage,
  sortVersionsDesc,
  formatVersionTime,
} from "./versionHistory";

interface VersionHistoryProps {
  versions: VersionInfo[];
  currentVersion: number | null;
  onVersionSelect: (version: number) => void;
  onClose: () => void;
  colors: {
    background: string;
    primary: string;
    text: string;
    textLight: string;
    warning: string;
    white: string;
    border: string;
  };
}

export function VersionHistory({
  versions,
  currentVersion,
  onVersionSelect,
  onClose,
  colors,
}: VersionHistoryProps) {
  const sortedVersions = sortVersionsDesc(versions);
  const isViewingHistorical = currentVersion
    ? isHistoricalVersion(versions, currentVersion)
    : false;
  const readOnlyMessage = getReadOnlyMessage(isViewingHistorical);

  const handleVersionPress = (version: number) => {
    if (isHistoricalVersion(versions, version)) {
      Alert.alert(
        "Abrir Versión Histórica",
        `¿Deseas abrir la versión ${version}? No podrás editar esta versión.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Abrir",
            onPress: () => onVersionSelect(version),
          },
        ]
      );
    } else {
      onVersionSelect(version);
    }
  };

  if (versions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textLight }]} >
          No hay versiones guardadas para esta fecha
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <History size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]} >
          Historial de Versiones
        </Text>
        <Text style={[styles.versionCount, { color: colors.textLight }]} >
          {versions.length} version{versions.length !== 1 ? "es" : ""}
        </Text>
      </View>

      {readOnlyMessage && (
        <View style={[styles.readOnlyBanner, { backgroundColor: colors.warning + "20" }]}>
          <Text style={[styles.readOnlyText, { color: colors.warning }]} >
            {readOnlyMessage}
          </Text>
        </View>
      )}

      <ScrollView style={styles.versionList} >
        {sortedVersions.map((version) => {
          const isCurrent = currentVersion === version.version;
          const isHistorical = isHistoricalVersion(versions, version.version);

          return (
            <TouchableOpacity
              key={version.version}
              style={[
                styles.versionItem,
                {
                  backgroundColor: isCurrent
                    ? colors.primary + "20"
                    : colors.white,
                  borderColor: isCurrent ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleVersionPress(version.version)}
            >
              <View style={styles.versionInfo}>
                <Text
                  style={[
                    styles.versionLabel,
                    { color: isCurrent ? colors.primary : colors.text },
                  ]}
                >
                  {formatVersionLabel(version)}
                  {isCurrent && (
                    <Text style={[styles.currentBadge, { color: colors.primary }]} >
                      {" "}(actual)
                    </Text>
                  )}
                  {isHistorical && !isCurrent && (
                    <Text style={[styles.historicalBadge, { color: colors.textLight }]} >
                      {" "}(histórica)
                    </Text>
                  )}
                </Text>
                <View style={styles.versionMeta}>
                  <Clock size={12} color={colors.textLight} />
                  <Text style={[styles.versionTime, { color: colors.textLight }]} >
                    {formatVersionTime(version.createdAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  title: {
    ...FONTS.h3,
    flex: 1,
  },
  versionCount: {
    ...FONTS.body3,
  },
  emptyText: {
    ...FONTS.body2,
    textAlign: "center",
    paddingVertical: 24,
  },
  readOnlyBanner: {
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  readOnlyText: {
    ...FONTS.body3,
    fontWeight: "600",
    textAlign: "center",
  },
  versionList: {
    maxHeight: 200,
  },
  versionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: 8,
  },
  versionInfo: {
    flex: 1,
  },
  versionLabel: {
    ...FONTS.body2,
    fontWeight: "600",
  },
  currentBadge: {
    ...FONTS.body3,
  },
  historicalBadge: {
    ...FONTS.body3,
    fontStyle: "italic",
  },
  versionMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  versionTime: {
    ...FONTS.body3,
  },
});
