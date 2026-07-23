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
