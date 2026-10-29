/**
 * Utility to download QR code in 3 production print formats:
 * - 'png' : 1024x1024 High-Resolution Print Image
 * - 'svg' : Scalable Vector Graphics for Web & Design
 * - 'cdr' : Vector formatted specifically for CorelDRAW Print (Import via Ctrl+I)
 */
export function downloadQR(format = "svg", customFilename = "business-review-qr", svgElementId = "generated-qr") {
  const svg = document.getElementById(svgElementId);

  if (!svg) {
    throw new Error("QR code element is not available.");
  }

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const source = new XMLSerializer().serializeToString(clone);
  const baseFilename = (customFilename || "business-review-qr").replace(/[^a-zA-Z0-9_-]/g, "_");

  function triggerDownload(blob, downloadName) {
    const linkUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = linkUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(linkUrl), 1000);
  }

  // 1. Download CorelDRAW Vector Format (Vector SVG with CorelDRAW metadata)
  if (format === "cdr") {
    // Add CorelDRAW print instruction header into SVG comment
    const corelSvg = `<!-- CorelDRAW Print Ready Vector: In CorelDRAW, press Ctrl+I (File > Import) to open as 100% Vector Curves -->\n` + source;
    const cdrBlob = new Blob([corelSvg], {
      type: "image/svg+xml;charset=utf-8",
    });
    triggerDownload(cdrBlob, `${baseFilename}_CorelDRAW_Vector.svg`);
    return {
      success: true,
      format: "cdr",
      filename: `${baseFilename}_CorelDRAW_Vector.svg`,
      tip: "CorelDRAW me File > Import (Ctrl + I) karein, direct 100% vector curves open hoga!",
    };
  }

  // 2. Download Standard SVG
  if (format === "svg") {
    const svgBlob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    triggerDownload(svgBlob, `${baseFilename}.svg`);
    return {
      success: true,
      format: "svg",
      filename: `${baseFilename}.svg`,
    };
  }

  // 3. Download High-Res 1024x1024 PNG for Print
  const svgBlob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;

    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(objectUrl);
      throw new Error("Could not create the QR image context.");
    }

    // Pure white crisp background
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR centered with crisp rendering
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        URL.revokeObjectURL(objectUrl);
        if (!blob) {
          console.error("Failed to create PNG blob.");
          return;
        }
        triggerDownload(blob, `${baseFilename}.png`);
      },
      "image/png"
    );
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    console.error("Failed to load QR SVG for PNG conversion.");
  };

  image.src = objectUrl;

  return {
    success: true,
    format: "png",
    filename: `${baseFilename}.png`,
  };
}
