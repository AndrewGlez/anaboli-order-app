import { Platform } from "react-native";

// Check if print is available (web only)
export function canPrint(): boolean {
  return Platform.OS === "web" && typeof window !== "undefined";
}

// Trigger browser print
export function printReport(): void {
  if (canPrint() && typeof window !== "undefined") {
    window.print();
  }
}

// Generate printable HTML content
export function generatePrintableContent(
  title: string,
  date: string,
  content: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 20px;
      color: #333;
    }
    h1 {
      font-size: 18pt;
      margin-bottom: 10px;
    }
    .date {
      color: #666;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
    @media print {
      body {
        padding: 0;
      }
      button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="date">${date}</div>
  ${content}
</body>
</html>
`;
}

// Open print window with content
export function openPrintWindow(content: string): void {
  if (!canPrint()) return;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();

    // Delay print to allow styles to load
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
