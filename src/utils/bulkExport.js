import JSZip from "jszip";
import QRCode from "qrcode";
import { generateCardSvgString, generateSideBySideCardSvg } from "./cardDesignSvgs.js";

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
 * - 1024x1024 PNG images
 * - Vector SVG files
 * - CorelDRAW Vector files
 * - 4 Print Designs:
 *   1) Chhota Review Pocket Card (Front & Back)
 *   2) Chhota All in One Pocket Card (Front & Back)
 *   3) Bada 6x6 Google Review Stand
 *   4) Bada 6x6 All in One Stand
 *
 * @param {Array} cards - array of card objects
 * @param {Object} options - { onProgress: Function, filename: string, exportMode: string, isBlank: boolean }
 */
export async function downloadZipExport(cards, options = {}) {
  const { onProgress, filename, exportMode = "all", isBlank = false } = options;

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

    // Generate 1024x1024 PNG
    const pngDataUrl = await QRCode.toDataURL(permanentUrl, {
      width: 1024,
      margin: 4,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const pngBytes = dataUrlToUint8Array(pngDataUrl);
    zip.file(`QRs_PNG_1024px/${card.cardId}.png`, pngBytes);

    const svgString = await QRCode.toString(permanentUrl, {
      type: "svg",
      margin: 4,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    zip.file(`QRs_Vector_SVG/${card.cardId}.svg`, svgString);

    const corelSvg = `<!-- CorelDRAW Print Ready Vector: Press Ctrl+I (File > Import) in CorelDRAW to open as 100% Vector Curves -->\n${svgString}`;
    zip.file(`CorelDRAW_Print_Ready/${card.cardId}_CorelDRAW_Vector.svg`, corelSvg);

    // 1. Chhota Pocket Cards (85x54mm)
    if (exportMode === "all" || exportMode === "cards-review" || exportMode === "cards-all-in-one") {
      try {
        const isAllInOne = exportMode === "cards-all-in-one";
        const folder = isAllInOne ? "85x54_Pocket_Cards_All_In_One" : "85x54_Pocket_Cards_Google_Review";

        // Front Side
        const frontSvg = generateCardSvgString({
          format: "nfc-card",
          designVariant: isAllInOne ? "all-in-one" : "review",
          theme: isAllInOne ? "paw-white" : "matte-black",
          side: "front",
          title: card.title || "",
          cardId: card.cardId,
          cardNumber: card.cardNumber,
          qrValue: permanentUrl,
          socialLinks: card.socialLinks || {},
          isBlank,
        });
        zip.file(`${folder}/Front_${card.cardId}.svg`, frontSvg);
        // Also put full card design in CorelDRAW folder
        zip.file(`CorelDRAW_Print_Ready/Designs_85x54_Cards/Front_${card.cardId}.svg`, frontSvg);

        // Back Side (Contains Phone + Email)
        const backSvg = generateCardSvgString({
          format: "nfc-card",
          side: "back",
          title: card.title || "",
          cardId: card.cardId,
          cardNumber: card.cardNumber,
          brandName: "Tapform",
          phone: "9893711447",
          email: "ajjumahato9@gmail.com",
        });
        zip.file(`${folder}/Back_${card.cardId}.svg`, backSvg);
        zip.file(`CorelDRAW_Print_Ready/Designs_85x54_Cards/Back_${card.cardId}.svg`, backSvg);

        // Combined Side-by-Side (Agal-Bagal) Sheet for Manufacturer
        const sideBySideSvg = generateSideBySideCardSvg({
          format: "nfc-card",
          designVariant: isAllInOne ? "all-in-one" : "review",
          theme: isAllInOne ? "paw-white" : "matte-black",
          title: card.title || "",
          cardId: card.cardId,
          cardNumber: card.cardNumber,
          qrValue: permanentUrl,
          socialLinks: card.socialLinks || {},
          brandName: "Tapform",
          phone: "9893711447",
          email: "ajjumahato9@gmail.com",
          isBlank,
        });
        zip.file(`${folder}/Combined_SideBySide_${card.cardId}.svg`, sideBySideSvg);
        zip.file(`CorelDRAW_Print_Ready/Designs_85x54_Cards/Combined_SideBySide_${card.cardId}.svg`, sideBySideSvg);
      } catch (e) {
        console.warn("Card export warning:", e);
      }
    }

    // 2. Bada 6x6 Stands (150x150mm)
    if (exportMode === "all" || exportMode === "stand-review" || exportMode === "stand-all-in-one") {
      try {
        const isAllInOneStand = exportMode === "stand-all-in-one";
        const folder = isAllInOneStand ? "6x6_Acrylic_Stands_All_In_One" : "6x6_Acrylic_Stands_Google_Review";

        const standSvg = generateCardSvgString({
          format: "table-stand",
          designVariant: isAllInOneStand ? "all-in-one" : "review",
          title: card.title || "",
          cardId: card.cardId,
          cardNumber: card.cardNumber,
          qrValue: permanentUrl,
          socialLinks: card.socialLinks || {},
          brandName: "Tapform",
          phone: "9893711447",
          email: "ajjumahato9@gmail.com",
          isBlank,
        });
        zip.file(`${folder}/${card.cardId}_6x6_Stand.svg`, standSvg);
        // Also put full stand design in CorelDRAW folder
        zip.file(`CorelDRAW_Print_Ready/Designs_6x6_Stands/${card.cardId}_6x6_Stand.svg`, standSvg);
      } catch (e) {
        console.warn("Stand export warning:", e);
      }
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
        cardId: card.cardId,
      });
    }

    if (i % 5 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Include CorelDRAW Print Instructions
  const corelInstructions = `====================================================================
INSTRUCTIONS FOR PRINT SHOP / CORELDRAW OPERATORS
====================================================================
1. 85x54mm Cards (Pocket CR80): Front (4x4cm QR) & Back (Brand Logo, Phone & Email).
2. 6x6 Inch Acrylic Stands: 150mm x 150mm Square format (Google Review & All-in-One).
3. CorelDRAW Import: In CorelDRAW press Ctrl + I to import any SVG file directly as 100% vector curves.
====================================================================`;
  zip.file("CorelDRAW_Print_Instructions.txt", corelInstructions);

  const csvContent = generateCsvContent(cards);
  zip.file("codes.csv", csvContent);

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
  const finalFilename = filename || `tapform_print_ready_${timestamp}.zip`;

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
