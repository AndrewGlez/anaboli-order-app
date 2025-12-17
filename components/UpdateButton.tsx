import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  FadeIn,
} from "react-native-reanimated";
import { Download } from "lucide-react-native";
import { checkForUpdates, downloadUpdate } from "@/services/updateService";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const UpdateButton = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Pulse animation for attention
  useEffect(() => {
    if (updateAvailable) {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 10 }),
          withSpring(1, { damping: 10 })
        ),
        -1,
        true
      );
    }
  }, [updateAvailable]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

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
    <AnimatedPressable
      style={[styles.button, { backgroundColor: colors.primary }, animatedStyle]}
      onPress={handleDownload}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isChecking}
    >
      <Animated.View entering={FadeIn.duration(300)}>
        {isChecking ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Download size={24} color={colors.white} />
        )}
      </Animated.View>
    </AnimatedPressable>
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
