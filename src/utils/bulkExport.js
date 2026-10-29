import JSZip from "jszip";
import QRCode from "qrcode";

/**
 * Generate CSV text content from an array of card objects
 */
export function generateCsvContent(cards) {
  const headers = [
    "QR ID",
    "Card Number",
    "Permanent Scan URL",
    "Status",
    "Destination URL",
    "Title / Business",
    "Batch ID",
    "Scan Count",
    "Created Date",
  ];

  const rows = cards.map((card) => {
    const permanentUrl =
      card.qrUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/c/${card.cardId}`
        : `/c/${card.cardId}`);

    return [
      `"${(card.cardId || "").replace(/"/g, '""')}"`,
      card.cardNumber !== null && card.cardNumber !== undefined ? card.cardNumber : "",
      `"${permanentUrl.replace(/"/g, '""')}"`,
      `"${(card.status || "inactive").replace(/"/g, '""')}"`,
      `"${(card.destinationUrl || "").replace(/"/g, '""')}"`,
      `"${(card.title || "").replace(/"/g, '""')}"`,
      `"${(card.batchId || "").replace(/"/g, '""')}"`,
      card.scanCount || 0,
      `"${card.createdAt ? new Date(card.createdAt).toISOString() : ""}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * Trigger immediate browser download of CSV manifest
 */
export function downloadCsvManifest(cards, filename = "codes.csv") {
  if (!cards || cards.length === 0) {
    throw new Error("No cards available to export.");
  }

  const csvContent = generateCsvContent(cards);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Helper to convert base64 data URL to Uint8Array for JSZip
 */
function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate and download a ZIP file containing:
 * - 1024x1024 PNG images with 4-module quiet zone
 * - Vector SVG files
 * - codes.csv manifest listing all QR IDs, URLs, and statuses
 *
 * @param {Array} cards - array of card objects
 * @param {Object} options - { onProgress: Function, filename: string }
 */
export async function downloadZipExport(cards, options = {}) {
  const { onProgress, filename } = options;

  if (!cards || cards.length === 0) {
    throw new Error("No cards selected for ZIP export.");
  }

  const zip = new JSZip();
  const total = cards.length;

  for (let i = 0; i < total; i++) {
    const card = cards[i];
    const permanentUrl =
      card.qrUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/c/${card.cardId}`
        : `/c/${card.cardId}`);

    // Generate 1024x1024 PNG with 4-module quiet zone (print ready)
    const pngDataUrl = await QRCode.toDataURL(permanentUrl, {
      width: 1024,
      margin: 4,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // 1. Root PNG and SVG
    const pngBytes = dataUrlToUint8Array(pngDataUrl);
    zip.file(`${card.cardId}.png`, pngBytes);

    // 2. Scalable Vector Graphic (SVG)
    const svgString = await QRCode.toString(permanentUrl, {
      type: "svg",
      margin: 4,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    zip.file(`${card.cardId}.svg`, svgString);

    // 3. CorelDRAW Dedicated Vector Folder
    const corelSvg = `<!-- CorelDRAW Print Ready Vector: Press Ctrl+I (File > Import) in CorelDRAW to open as 100% Vector Curves -->\n${svgString}`;
    zip.file(`CorelDRAW_Print_Ready/${card.cardId}_CorelDRAW_Vector.svg`, corelSvg);

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
        cardId: card.cardId,
      });
    }

    // Yield to main thread every 5 iterations to keep UI responsive
    if (i % 5 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Include CorelDRAW Print Instructions for shop owners
  const corelInstructions = `====================================================================
INSTRUCTIONS FOR PRINT SHOP / CORELDRAW OPERATORS
====================================================================
All QR codes in this ZIP are print-ready for UV flatbed, acrylic, and laser printers:

1. Open CorelDRAW (Supports all versions: CorelDRAW X4, X5, X6, X7, X8, 2019-2024).
2. Press Ctrl + I (File > Import).
3. Select files from the 'CorelDRAW_Print_Ready' folder or root .svg files.
4. The QR imports instantly as 100% SHARP VECTOR CURVES.
5. Position inside your stand layout (4x6", A5, or table-top acrylic) and print!
====================================================================`;
  zip.file("CorelDRAW_Print_Instructions.txt", corelInstructions);

  // Include codes.csv manifest inside the ZIP
  const csvContent = generateCsvContent(cards);
  zip.file("codes.csv", csvContent);

  // Generate ZIP blob with DEFLATE compression
  const zipBlob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress && metadata.percent) {
        onProgress({
          stage: "compressing",
          percentage: Math.round(metadata.percent),
        });
      }
    }
  );

  const timestamp = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `tapform_bulk_qrs_${timestamp}.zip`;

  const downloadUrl = URL.createObjectURL(zipBlob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = finalFilename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);

  return { success: true, count: total, filename: finalFilename };
}
