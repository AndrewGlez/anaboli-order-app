import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import { Download } from "lucide-react-native";
import { checkForUpdates, downloadUpdate } from "@/services/updateService";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";

const UpdateButton = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  const checkForUpdate = async () => {
    setIsChecking(true);
    try {
      const updateInfo = await checkForUpdates();

      if (updateInfo.isUpdateAvailable && updateInfo.releaseData) {
        // Find APK asset in release
        const apkAsset = updateInfo.releaseData.assets.find((asset) =>
          asset.name.endsWith(".apk")
        );

        if (apkAsset) {
          setUpdateAvailable(true);
          setApkUrl(apkAsset.browser_download_url);
          setLatestVersion(updateInfo.latestVersion);
        } else {
          setUpdateAvailable(false);
        }
      } else {
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      setUpdateAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownload = () => {
    if (!apkUrl) return;

    Alert.alert(
      "Actualización disponible",
      `Versión ${latestVersion} está disponible. ¿Descargar ahora?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Descargar",
          onPress: () => downloadUpdate(apkUrl),
        },
      ]
    );
  };

  useEffect(() => {
    // Check for updates automatically when component mounts
    checkForUpdate();

    // Optionally, set up a periodic check (every 30 minutes)
    const intervalId = setInterval(checkForUpdate, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Only render the button if an update is available
  if (!updateAvailable) {
    return null; // Return nothing when no update is available
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={handleDownload}
      disabled={isChecking}
    >
      {isChecking ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Download size={24} color={colors.white} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.radius,
    padding: 12,
    marginVertical: 10,
    width: 48, // Set fixed width for a circular/square button
    height: 48, // Set fixed height for a circular/square button
    aspectRatio: 1,
  },
});

export default UpdateButton;
