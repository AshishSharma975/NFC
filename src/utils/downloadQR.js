
export function downloadQR(format = "svg") {
  const svg = document.getElementById("generated-qr");

  if (!svg) {
    throw new Error("QR code is not available.");
  }

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const source = new XMLSerializer().serializeToString(clone);

  const svgBlob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });

  const objectUrl = URL.createObjectURL(svgBlob);
  const filename = "business-review-qr";

  function save(blob, extension) {
    const linkUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = linkUrl;
    anchor.download = `${filename}.${extension}`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(linkUrl), 1000);
  }

  // Download SVG
  if (format === "svg") {
    save(svgBlob, "svg");
    URL.revokeObjectURL(objectUrl);
    return;
  }

  // Download PNG
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");

    canvas.width = 720;
    canvas.height = 720;

    const context = canvas.getContext("2d");

    if (!context) {
      URL.revokeObjectURL(objectUrl);
      throw new Error("Could not create the QR image.");
    }

    // White background
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR across the complete canvas
    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        URL.revokeObjectURL(objectUrl);

        if (!blob) {
          console.error("Failed to create PNG image.");
          return;
        }

        save(blob, "png");
      },
      "image/png"
    );
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    console.error("Failed to load QR SVG for PNG conversion.");
  };

  image.src = objectUrl;
}
