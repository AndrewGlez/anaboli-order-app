import { Platform } from 'react-native';

/**
 * Copy text to clipboard using expo-clipboard on web.
 * This avoids the deprecated react-native Clipboard API.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (Platform.OS !== 'web') {
    // On native, use the system clipboard
    const Clipboard = require('@react-native-clipboard/clipboard');
    Clipboard.setString(text);
    return;
  }

  // Web implementation using expo-clipboard or navigator.clipboard
  try {
    // Try expo-clipboard first (if available)
    const ExpoClipboard = require('expo-clipboard');
    await ExpoClipboard.setStringAsync(text);
  } catch {
    // Fallback to navigator.clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Final fallback: use document.execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Read text from clipboard.
 */
export async function readFromClipboard(): Promise<string> {
  if (Platform.OS !== 'web') {
    const Clipboard = require('@react-native-clipboard/clipboard');
    return Clipboard.getString();
  }

  try {
    const ExpoClipboard = require('expo-clipboard');
    return await ExpoClipboard.getStringAsync();
  } catch {
    if (navigator.clipboard) {
      return await navigator.clipboard.readText();
    }
    return '';
  }
}
