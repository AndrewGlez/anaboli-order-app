import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { COLORS } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

export function UpdateToast() {
  const { updateAvailable } = useInstallPrompt();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (updateAvailable) {
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [updateAvailable, opacity]);

  const handleUpdate = () => {
    // Send skipWaiting message to service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleDismiss = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.primary, opacity },
      ]}
    >
      <Text style={styles.text}>Update available</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleUpdate}>
          <Text style={styles.updateButton}>Reload</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDismiss}>
          <Text style={styles.dismissButton}>Later</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  text: {
    color: '#ffffff',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateButton: {
    color: '#ffffff',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  dismissButton: {
    color: '#ffffff',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    opacity: 0.8,
  },
});
