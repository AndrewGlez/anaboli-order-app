import { Platform } from 'react-native';

/**
 * Export data as xlsx file using Blob and download link.
 * This is the web-safe implementation that avoids react-native-fs.
 */
export async function exportToXlsx(
  data: unknown[],
  filename: string
): Promise<void> {
  if (Platform.OS !== 'web') {
    // On native, use expo-file-system and expo-sharing
    throw new Error('Native export not implemented in web service');
  }

  // Web implementation using Blob + download
  const XLSX = require('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Generate xlsx buffer
  const xlsxBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  // Create Blob and download
  const blob = new Blob([xlsxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Save a base64-encoded xlsx buffer to a file.
 * On web: triggers a Blob download (no react-native-fs needed).
 * On native: writes to the document directory via react-native-fs.
 * Returns the file path/URL for native sharing, or undefined for web.
 */
export async function saveXlsxToFile(
  base64Data: string,
  filename: string
): Promise<string | undefined> {
  if (Platform.OS === 'web') {
    // Web: decode base64 to Uint8Array, create Blob, trigger download
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return undefined;
  }

  // Native: use react-native-fs
  const RNFS = require('react-native-fs');
  const tempPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
  await RNFS.writeFile(tempPath, base64Data, 'base64');
  return tempPath;
}

/**
 * Remove a temporary file.
 * On web: no-op (Blob URLs are already revoked).
 * On native: uses react-native-fs unlink.
 */
export async function removeTempFile(filePath: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  const RNFS = require('react-native-fs');
  try {
    await RNFS.unlink(filePath);
  } catch {
    // Ignore cleanup errors
  }
}
