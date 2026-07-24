import * as Clipboard from 'expo-clipboard';

/**
 * Copy text to the system clipboard.
 * expo-clipboard is web-compatible and works on iOS/Android/web.
 */
export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/**
 * Read text from the system clipboard.
 */
export async function readFromClipboard(): Promise<string> {
  return await Clipboard.getStringAsync();
}
