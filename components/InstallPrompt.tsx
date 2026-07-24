import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { COLORS } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

export function InstallPrompt() {
  const { canInstall, isStandalone, prompt } = useInstallPrompt();
  const { theme } = useThemeStore();
  const colors = COLORS.themed(theme);

  // Don't show if already installed or not available
  if (!canInstall || isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted install');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Install this app for a better experience
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleInstall}
      >
        <Text style={styles.buttonText}>Install App</Text>
      </TouchableOpacity>
    </View>
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
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    flex: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
});
