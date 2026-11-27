import QRCode from "qrcode";

/**
 * PURE VECTOR SVG CARD & ACRYLIC STAND GENERATOR
 * 
 * Sizing & Layout Calibration:
 * 1. LOGO: Official Tapform Emerald Vortex Knot with Central Pulse Core (Photo 1 exact match).
 * 
 * 2. BADA STAND (6x6 inch / 150x150 mm Square Stand):
 *    - Variant A: "Google Review Stand" (Large Google G / Official Header, 5 stars, Tap Phone & 4x4cm QR).
 *    - Variant B: "All in One Stand" (Photo 2 & 3: Connect with us, Social Icons, Tap Phone & Scan QR, bottom brand & phone).
 *    - Both support Live QR or Blank with QR box (blank template) exclusively in Admin!
 * 
 * 3. CHHOTA POCKET CARD (85.6mm x 54mm CR80):
 *    - Variant A: "Review Pocket Card" (Review front + Back side with brand, phone 9893711447, email).
 *    - Variant B: "All in One Pocket Card" (Multi-link Connect Front with Google, Insta, WA, FB + Back side with brand, phone & email).
 *    - Exact 4x4 cm QR code on front, large bottom review text ("Your reviews tell us what matters to you" 24px bold).
 *    - Blank clean space for unassigned cards (no "Your Business Name" placeholder).
 */

export function generateQrPath(text, x, y, width, height, fill = "#0f172a") {
  try {
    const qr = QRCode.create(text || "https://tapform.me", { errorCorrectionLevel: "H" });
    const size = qr.modules.size;
    const cellSize = width / size;
    let d = "";

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.modules.get(r, c)) {
          const cx = (x + c * cellSize).toFixed(2);
          const cy = (y + r * cellSize).toFixed(2);
          const cw = (cellSize + 0.05).toFixed(2);
          const ch = (cellSize + 0.05).toFixed(2);
          d += `M${cx},${cy}h${cw}v${ch}h-${cw}z `;
        }
      }
    }

    return `<path d="${d.trim()}" fill="${fill}" />`;
  } catch (err) {
    console.error("QR Code generation error:", err);
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#cccccc" />`;
  }
}

// Vector Icon Assets
const ICONS = {
  // Official Tapform Emerald Vortex Knot Logo (Photo 1)
  tapformLogo: (size = 40, stroke = "#10b981", core = "#ffffff") => `
    <g transform="scale(${size / 100})">
      <g stroke="${stroke}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M 0,-44 C 18,-44 32,-30 32,-14 C 32,-1 20,10 7,17 L -7,24" />
        <path d="M 0,-44 C 18,-44 32,-30 32,-14 C 32,-1 20,10 7,17 L -7,24" transform="rotate(60)" />
        <path d="M 0,-44 C 18,-44 32,-30 32,-14 C 32,-1 20,10 7,17 L -7,24" transform="rotate(120)" />
        <path d="M 0,-44 C 18,-44 32,-30 32,-14 C 32,-1 20,10 7,17 L -7,24" transform="rotate(180)" />
        <path d="M 0,-44 C 18,-44 32,-30 32,-14 C 32,-1 20,10 7,17 L -7,24" transform="rotate(240)" />
        <path d="M 0,-44 C 18,-44 32,-30 32,-14 C 32,-1 20,10 7,17 L -7,24" transform="rotate(300)" />
      </g>
      <circle cx="0" cy="0" r="7" fill="${core}" />
    </g>
  `,
  googleG: `
    <g transform="scale(1.2)">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </g>
  `,
  nfcWave: (color = "#ffffff") => `
    <g stroke="${color}" stroke-width="3.5" fill="none" stroke-linecap="round">
      <path d="M20 2a22 22 0 0 1 0 24" />
      <path d="M14 6a15 15 0 0 1 0 16" />
      <path d="M8 10a8 8 0 0 1 0 8" />
    </g>
  `,
  fiveStars: `
    <g fill="#FBBC04" transform="scale(1.25)">
      ${[0, 1, 2, 3, 4]
        .map(
          (i) =>
            `<path transform="translate(${i * 26}, 0)" d="M12 2l2.9 6.8 7.1.6-5.3 4.7 1.6 7-6.3-3.7-6.3 3.7 1.6-7-5.3-4.7 7.1-.6z"/>`
        )
        .join("")}
    </g>
  `,
  phone: (color = "#ffffff") => `
    <g stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </g>
  `,
  mail: (color = "#ffffff") => `
    <g stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </g>
  `,
  instagram: `
    <g fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="22" height="22" rx="6" ry="6"/>
      <circle cx="14" cy="14" r="5"/>
      <circle cx="20.5" cy="7.5" r="1.5" fill="#ffffff"/>
    </g>
  `,
  whatsapp: `
    <path fill="#ffffff" d="M14.04 2c-6.6 0-12 5.4-12 12 0 2.1.56 4.18 1.6 6L2 26l6.2-1.63a11.9 11.9 0 0 0 5.84 1.51c6.6 0 12-5.4 12-12s-5.4-12-12-12zm0 21.9a9.9 9.9 0 0 1-5.06-1.38l-.36-.22-3.75.99 1-3.66-.24-.38a9.9 9.9 0 1 1 8.41 4.65zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.17.2-.35.23-.65.08s-1.27-.47-2.41-1.49c-.89-.79-1.49-1.78-1.66-2.08-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.29.3-.49.1-.2.05-.38-.03-.53-.07-.15-.68-1.63-.93-2.24-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.53.08-.8.38s-1.05 1.02-1.05 2.49 1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5 2.99 1.29 2.99.86 3.53.81.54-.05 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.43-.08-.13-.27-.2-.57-.35z"/>
  `,
  facebook: `
    <path fill="#ffffff" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 17 22 12z"/>
  `,
  nfcPhoneHand: (color = "#38bdf8") => `
    <g stroke="${color}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Smartphone outline -->
      <rect x="25" y="10" width="46" height="80" rx="10" />
      <line x1="42" y1="18" x2="54" y2="18" stroke-width="3" />
      <circle cx="48" cy="80" r="3" fill="${color}" />
      <!-- NFC Waves radiating outward -->
      <path d="M 12 36 A 22 22 0 0 0 12 64" stroke-width="4" />
      <path d="M 4 28 A 34 34 0 0 0 4 72" stroke-width="4" />
      <!-- Hand silhouette -->
      <path d="M 68 56 L 82 56 C 86 56 89 59 89 63 L 89 74 C 89 78 86 81 82 81 L 68 81" stroke-width="4" />
    </g>
  `,
};

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * GENERATE SVG STRING
 */
export function generateCardSvgString({
  format = "nfc-card", // 'nfc-card' | 'table-stand'
  designVariant = "review", // 'review' | 'all-in-one'
  theme = "matte-black",
  cardType = "review",
  side = "front", // 'front' | 'back'
  title = "",
  cardId = "SSHOP-1133",
  cardNumber = "1133",
  qrValue = "https://tapform.me/c/SSHOP-1133",
  socialLinks = {},
  brandName = "Tapform",
  phone = "9893711447",
  email = "ajjumahato9@gmail.com",
  isBlank = false, // When true, renders QR code box as blank placeholder
}) {
  const isPlaceholderTitle =
    !title ||
    title.trim() === "" ||
    title.toLowerCase().includes("your business name") ||
    title.toLowerCase() === "our business" ||
    title.toLowerCase() === "unassigned stand" ||
    /^card\s*#?\d+$/i.test(title.trim()) ||
    /^nfc\s*stand\s*#?\d+$/i.test(title.trim());
  const displayTitle = isPlaceholderTitle ? "" : escapeXml(title);
  const safeCardId = escapeXml(cardId || "SSHOP-1133");
  const safeBrand = escapeXml(brandName || "Tapform");
  const safePhone = escapeXml(phone || "9893711447");
  const safeEmail = escapeXml(email || "ajjumahato9@gmail.com");
  const isAllInOne = designVariant === "all-in-one" || cardType === "connect";

  let cornerNumber = "";
  if (cardNumber !== undefined && cardNumber !== null && String(cardNumber).trim() !== "") {
    cornerNumber = `#${String(cardNumber).replace(/^#/, "")}`;
  } else {
    const digitMatch = safeCardId.match(/\d+$/);
    if (digitMatch) {
      cornerNumber = `#${digitMatch[0]}`;
    } else {
      cornerNumber = `#1133`;
    }
  }

  // =========================================================================
  // 1. CHHOTA POCKET CARD (85.6mm x 54mm / CR80, 638 x 1012 px)
  // Has Front & Back designs with phone & gmail
  // =========================================================================
  if (format === "nfc-card") {
    const W = 638;
    const H = 1012;
    const R = 36;

    // -----------------------------------------------------------------------
    // POCKET CARD BACK SIDE (BRAND LOGO + PHONE + GMAIL SUPPORT)
    // -----------------------------------------------------------------------
    if (side === "back") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <radialGradient id="backLuxeMatteBg" cx="50%" cy="25%" r="85%">
            <stop offset="0%" stop-color="#141822"/>
            <stop offset="55%" stop-color="#0c0e14"/>
            <stop offset="100%" stop-color="#07080b"/>
          </radialGradient>
          <linearGradient id="backGoldGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="50%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="url(#backLuxeMatteBg)" stroke="#232834" stroke-width="2.5"/>
        <rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="${R - 6}" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1.2"/>

        <!-- Header: Serial Badge & Card ID -->
        <g transform="translate(48, 48)">
          <rect x="0" y="0" width="110" height="44" rx="14" fill="#141822" stroke="#d4af37" stroke-width="2"/>
          <text x="55" y="29" font-family="monospace, 'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="1">${cornerNumber}</text>
        </g>

        <g transform="translate(${W - 160}, 48)">
          <rect x="0" y="0" width="112" height="44" rx="14" fill="#151a24" stroke="#2c3444" stroke-width="1.2"/>
          <text x="56" y="28" font-family="monospace, -apple-system, sans-serif" font-size="15" font-weight="800" fill="#94a3b8" text-anchor="middle">${safeCardId}</text>
        </g>

        <!-- Center NFC Chip Emblem -->
        <g transform="translate(${W / 2}, 185)">
          <circle cx="0" cy="0" r="46" fill="#151a24" stroke="url(#backGoldGradDark)" stroke-width="2.5"/>
          <g transform="translate(-18, -18) scale(1.55)">
            ${ICONS.nfcWave("#fbbf24")}
          </g>
        </g>

        <text x="${W / 2}" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">${safeBrand.toUpperCase()}</text>
        <text x="${W / 2}" y="296" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#fbbf24" text-anchor="middle" letter-spacing="3">SMART NFC &#8226; DIGITAL TOUCHPOINT</text>

        <!-- Compact Contact Details Box -->
        <g transform="translate(48, 340)">
          <rect x="0" y="0" width="${W - 96}" height="175" rx="20" fill="#131722" stroke="#252e3e" stroke-width="1.8"/>

          <!-- Phone Row -->
          <g transform="translate(24, 25)">
            <rect x="0" y="0" width="38" height="38" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
            <g transform="translate(10, 10) scale(0.85)">${ICONS.phone("#38bdf8")}</g>
            <text x="52" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="1.2">CALL &#8226; WHATSAPP SUPPORT</text>
            <text x="52" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="0.5">+91 ${safePhone}</text>
          </g>

          <line x1="24" y1="88" x2="${W - 120}" y2="88" stroke="#1c2432" stroke-width="1.5"/>

          <!-- Email Row -->
          <g transform="translate(24, 110)">
            <rect x="0" y="0" width="38" height="38" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
            <g transform="translate(10, 10) scale(0.85)">${ICONS.mail("#fbbf24")}</g>
            <text x="52" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="1.2">OFFICIAL EMAIL</text>
            <text x="52" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="15" font-weight="700" fill="#ffffff">${safeEmail}</text>
          </g>
        </g>

        <!-- LUXURY TAPFORM BRAND INSIGNIA (Centered Clean Lockup) -->
        <g transform="translate(${W / 2}, 660)">
          <!-- Logo & Brand lockup -->
          <g transform="translate(-90, 0)">
            ${ICONS.tapformLogo(52, "#10b981", "#ffffff")}
          </g>
          <text x="-48" y="11" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="3">TAPFORM</text>
        </g>

        <!-- Bottom Tech Specs & Verification Badge -->
        <g transform="translate(${W / 2}, 830)">
          <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#151a24" stroke="#2c3444" stroke-width="1.5"/>
          <text x="0" y="6" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="2">EMBEDDED NTAG213 / 215 CHIP</text>
          <text x="0" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="15" font-weight="600" fill="#cbd5e1" text-anchor="middle">Compatible with all iPhone &amp; Android devices</text>
          <text x="0" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="500" fill="#64748b" text-anchor="middle">No app or battery required &#8226; Waterproof &amp; Durable</text>
        </g>
      </svg>`;
    }

    // -----------------------------------------------------------------------
    // POCKET CARD FRONT SIDE: EXACT 4x4 CM QR CODE & LARGER REVIEW TEXT
    // -----------------------------------------------------------------------
    const qrBoxSize = 472;
    const qrBoxX = (W - qrBoxSize) / 2;
    const qrBoxY = 220;
    const qrCodeSize = 440;
    const qrCodeX = (W - qrCodeSize) / 2;
    const qrCodeY = qrBoxY + (qrBoxSize - qrCodeSize) / 2;

    // FRONT VARIANT 1: ALL-IN-ONE POCKET CARD (CONNECT MULTI-LINK)
    if (isAllInOne) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="pocketWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f8fafc"/>
          </linearGradient>
          <linearGradient id="rainbowBorderPocket" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4285F4"/>
            <stop offset="33%" stop-color="#EA4335"/>
            <stop offset="66%" stop-color="#FBBC05"/>
            <stop offset="100%" stop-color="#34A853"/>
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="url(#pocketWhiteGrad)" stroke="#cbd5e1" stroke-width="2.5"/>
        <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="${R - 8}" fill="none" stroke="#f1f5f9" stroke-width="1.5"/>

        <!-- Top Header Strip: Corner Serial + Official Emerald Logo + 1-TAP NFC -->
        <g transform="translate(46, 44)">
          <rect x="0" y="0" width="100" height="44" rx="14" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
          <text x="50" y="29" font-family="monospace, 'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">${cornerNumber}</text>
        </g>

        <!-- Brand Center Header with Emerald Vortex Logo -->
        <g transform="translate(${W / 2 - 85}, 44)">
          <g transform="translate(22, 22)">${ICONS.tapformLogo(38, "#059669", "#059669")}</g>
          <text x="55" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="900" fill="#0f172a">${safeBrand}</text>
        </g>

        <g transform="translate(${W - 130}, 44)">
          <rect x="0" y="0" width="84" height="44" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <g transform="translate(14, 11) scale(0.8)">${ICONS.nfcWave("#0284c7")}</g>
          <text x="52" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="900" fill="#0f172a">1-TAP</text>
        </g>

        <!-- Business Name (Blank clean space if unassigned) -->
        ${
          displayTitle
            ? `
            <text x="${W / 2}" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif" font-size="34" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="-0.5">${displayTitle}</text>
            <g transform="translate(${W / 2 - 82}, 162) scale(1.0)">${ICONS.fiveStars}</g>
            `
            : `
            <g transform="translate(${W / 2 - 82}, 145) scale(1.0)">${ICONS.fiveStars}</g>
            `
        }

        <!-- 4x4 CM QR CODE TILE -->
        <g>
          <rect x="${qrBoxX}" y="${qrBoxY}" width="${qrBoxSize}" height="${qrBoxSize}" rx="28" fill="#ffffff" stroke="url(#rainbowBorderPocket)" stroke-width="5"/>
          ${
            isBlank
              ? `
              <rect x="${qrBoxX + 16}" y="${qrBoxY + 16}" width="${qrBoxSize - 32}" height="${qrBoxSize - 32}" rx="18" fill="#f8fafc" stroke="#e2e8f0" stroke-dasharray="6,6" stroke-width="2"/>
              <text x="${W / 2}" y="${qrBoxY + qrBoxSize / 2}" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="800" fill="#94a3b8" text-anchor="middle">PRINT / STICK QR HERE</text>
              `
              : generateQrPath(qrValue, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, "#0f172a")
          }
        </g>

        <!-- Action Capsule Pill Below QR -->
        <g transform="translate(${W / 2 - 150}, 715)">
          <rect x="0" y="0" width="300" height="46" rx="23" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.8"/>
          <circle cx="26" cy="23" r="7" fill="#16a34a" />
          <text x="160" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="2">1-TAP NFC &#8226; SCAN CAMERA</text>
        </g>

        <!-- Social Icons Row (Google, Insta, WhatsApp, FB) -->
        <g transform="translate(${W / 2}, 780)">
          <g transform="translate(-115, 0)">
            <circle cx="28" cy="28" r="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
            <g transform="translate(17, 17) scale(0.95)">${ICONS.googleG}</g>

            <circle cx="90" cy="28" r="24" fill="#e1306c" stroke="#e1306c" stroke-width="1.5"/>
            <g transform="translate(77, 15) scale(1)">${ICONS.instagram}</g>

            <circle cx="152" cy="28" r="24" fill="#16a34a" stroke="#22c55e" stroke-width="1.5"/>
            <g transform="translate(139, 15) scale(1)">${ICONS.whatsapp}</g>

            <circle cx="214" cy="28" r="24" fill="#1d4ed8" stroke="#3b82f6" stroke-width="1.5"/>
            <g transform="translate(203, 17) scale(0.95)">${ICONS.facebook}</g>
          </g>
        </g>

        <!-- Bottom Footer with Card ID & Micro Tag -->
        <g transform="translate(${W / 2}, 920)">
          <rect x="-95" y="-20" width="190" height="38" rx="19" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <text x="0" y="5" font-family="monospace, -apple-system, sans-serif" font-size="17" font-weight="800" fill="#0f172a" text-anchor="middle" letter-spacing="2.5">${isBlank ? "CARD-ID" : safeCardId}</text>
          <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="900" fill="#64748b" text-anchor="middle" letter-spacing="3.5">SMART NFC &#8226; ZERO APP NEEDED</text>
        </g>
      </svg>`;
    }

    // FRONT VARIANT 2: NORMAL REVIEW POCKET CARD (DARK MATTE WITH 4x4 CM QR & LARGE BOTTOM TEXT)
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <radialGradient id="luxeMatteBg" cx="50%" cy="20%" r="85%">
          <stop offset="0%" stop-color="#141822"/>
          <stop offset="60%" stop-color="#0c0e14"/>
          <stop offset="100%" stop-color="#07080b"/>
        </radialGradient>
        <linearGradient id="qrFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4285F4"/>
          <stop offset="35%" stop-color="#EA4335"/>
          <stop offset="70%" stop-color="#FBBC05"/>
          <stop offset="100%" stop-color="#34A853"/>
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="url(#luxeMatteBg)" stroke="#232834" stroke-width="2.5"/>
      <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="${R - 8}" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1.2"/>

      <!-- Header: Corner Serial + Google Review Pill + NFC Wave -->
      <g transform="translate(46, 44)">
        <rect x="0" y="0" width="100" height="44" rx="14" fill="#141822" stroke="#d4af37" stroke-width="2"/>
        <text x="50" y="29" font-family="monospace, 'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="1">${cornerNumber}</text>
      </g>

      <g transform="translate(156, 44)">
        <rect x="0" y="0" width="140" height="44" rx="22" fill="#151a24" stroke="#2c3444" stroke-width="1.5"/>
        <g transform="translate(12, 10) scale(0.95)">${ICONS.googleG}</g>
        <text x="50" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="800" fill="#ffffff" letter-spacing="1.5">REVIEW</text>
      </g>

      <g transform="translate(${W - 100}, 42)">
        <g transform="scale(1.6)">${ICONS.nfcWave("#ffffff")}</g>
        <text x="-10" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="900" fill="#38bdf8" letter-spacing="2">TAP HERE</text>
      </g>

      <!-- Business Name (Only if custom title provided, else clean blank space) -->
      ${
        displayTitle
          ? `
          <text x="${W / 2}" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">${displayTitle}</text>
          <g transform="translate(${W / 2 - 82}, 162) scale(1.0)">${ICONS.fiveStars}</g>
          `
          : `
          <g transform="translate(${W / 2 - 82}, 145) scale(1.0)">${ICONS.fiveStars}</g>
          `
      }

      <!-- 4x4 CM PHYSICAL PRINT QR TILE (472px width on 54mm card) -->
      <g>
        <rect x="${qrBoxX}" y="${qrBoxY}" width="${qrBoxSize}" height="${qrBoxSize}" rx="28" fill="#ffffff" stroke="url(#qrFrameGrad)" stroke-width="5"/>
        ${
          isBlank
            ? `
            <rect x="${qrBoxX + 16}" y="${qrBoxY + 16}" width="${qrBoxSize - 32}" height="${qrBoxSize - 32}" rx="18" fill="#151a24" stroke="#2c3444" stroke-dasharray="6,6" stroke-width="2"/>
            <text x="${W / 2}" y="${qrBoxY + qrBoxSize / 2}" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="800" fill="#64748b" text-anchor="middle">PRINT / STICK QR HERE</text>
            `
            : generateQrPath(qrValue, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, "#090b0e")
        }
      </g>

      <!-- Action Capsule Pill Below QR -->
      <g transform="translate(${W / 2 - 150}, 715)">
        <rect x="0" y="0" width="300" height="46" rx="23" fill="#151a24" stroke="#2c3444" stroke-width="1.8"/>
        <circle cx="26" cy="23" r="7" fill="#22c55e" />
        <text x="160" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">1-TAP NFC &#8226; SCAN CAMERA</text>
      </g>

      <!-- LARGER READABLE BOTTOM REVIEW TEXT (24px Bold) -->
      <g transform="translate(${W / 2}, 795)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle">Your reviews tell us what matters to you.</text>
        <text x="0" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="500" fill="#94a3b8" text-anchor="middle">We are proud and grateful to serve you.</text>
      </g>

      <!-- Bottom Footer with Card ID & Tech Tag -->
      <g transform="translate(${W / 2}, 920)">
        <rect x="-95" y="-20" width="190" height="38" rx="19" fill="#121620" stroke="#242b38" stroke-width="1.5"/>
        <text x="0" y="5" font-family="monospace, -apple-system, sans-serif" font-size="17" font-weight="800" fill="#fbbf24" text-anchor="middle" letter-spacing="2.5">${isBlank ? "CARD-ID" : safeCardId}</text>
        <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="900" fill="#64748b" text-anchor="middle" letter-spacing="3.5">SMART NFC &#8226; ZERO APP NEEDED</text>
      </g>
    </svg>`;
  }

  // =========================================================================
  // 2. BADA 6x6 INCH COUNTERTOP ACRYLIC STAND (150mm x 150mm, 1000 x 1000 px)
  // Two Stand Variants (Photo 2 & 3):
  // 1) Normal Google Review Stand
  // 2) All in One Stand (Connect on all platforms + bottom brand and phone number)
  // Both support isBlank option (with blank QR box for vendors)
  // =========================================================================
  const SW = 1000;
  const SH = 1000;
  const SR = 50;

  // -------------------------------------------------------------------------
  // STAND VARIANT 1: NORMAL GOOGLE REVIEW STAND (6x6 inch)
  // Premium Acrylic Countertop Stand Plaque (Single Sided Front)
  // Matching modern dual-tone layout:
  // - Top deep crimson/ruby banner with client name/logo on left,
  //   Tapform logo + "SCAN • TAP • REVIEW" + bold "REVIEW / GOOGLE REVIEW" on right.
  // - Bottom crisp white acrylic base with dual rounded red-bordered action tiles:
  //   1) NFC Tap Phone tile with "TAP YOUR PHONE" capsule
  //   2) QR Code tile with "SCAN QR CODE" capsule
  // - Clean minimal footer bar with quick features & Tapform contact.
  // -------------------------------------------------------------------------
  if (!isAllInOne) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}">
      <defs>
        <!-- Top Crimson Header Gradient -->
        <linearGradient id="headerRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#70090f"/>
          <stop offset="45%" stop-color="#8a0c14"/>
          <stop offset="100%" stop-color="#55050a"/>
        </linearGradient>
        <!-- Subtle glossy sheen overlay -->
        <linearGradient id="headerSheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <!-- Button Capsule Gradient -->
        <linearGradient id="redPillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#dc2626"/>
          <stop offset="100%" stop-color="#b91c1c"/>
        </linearGradient>
        <!-- Clip path to keep stand rounded corners -->
        <clipPath id="standClip">
          <rect x="0" y="0" width="${SW}" height="${SH}" rx="${SR}"/>
        </clipPath>
      </defs>

      <!-- Outer Acrylic Card Base with Rounded Corners -->
      <g clip-path="url(#standClip)">
        <!-- Clean White Acrylic Base -->
        <rect x="0" y="0" width="${SW}" height="${SH}" fill="#ffffff"/>

        <!-- TOP CRIMSON BANNER WITH DYNAMIC ACRYLIC WAVE (Height ~ 430px) -->
        <path d="M 0,0 L ${SW},0 L ${SW},400 C 720,440 280,350 0,430 Z" fill="url(#headerRedGrad)"/>
        <!-- Soft Secondary Crimson Glow Arc -->
        <path d="M 0,0 L ${SW},0 L ${SW},360 C 650,400 320,330 0,390 Z" fill="url(#headerSheen)"/>

        <!-- ================= TOP HEADER SECTION ================= -->
        <!-- LEFT: CLIENT BUSINESS LOGO & NAME (Or clean blank space if unassigned) -->
        <g transform="translate(60, 60)">
          ${
            displayTitle
              ? `
              <!-- Client Emblem Badge Circle -->
              <circle cx="150" cy="120" r="95" fill="#1e222d" stroke="#f59e0b" stroke-width="4.5"/>
              <circle cx="150" cy="120" r="88" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4,4"/>
              
              <!-- Client Name inside or around badge -->
              <text x="150" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">${displayTitle}</text>
              <g transform="translate(98, 122) scale(0.65)">${ICONS.fiveStars}</g>
              <text x="150" y="162" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="2">OFFICIAL PARTNER</text>
              `
              : `
              <!-- Unassigned Stand: Beautiful Clean Space for Custom Logo / Rubber Stamp / Sticker -->
              <rect x="20" y="30" width="260" height="180" rx="20" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="8,8" stroke-opacity="0.35"/>
              <text x="150" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="700" fill="#ffffff" fill-opacity="0.5" text-anchor="middle" letter-spacing="1.5">CLIENT LOGO / NAME</text>
              <text x="150" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="600" fill="#ffffff" fill-opacity="0.35" text-anchor="middle">Space reserved for custom branding</text>
              `
          }
        </g>

        <!-- VERTICAL DIVIDER IN HEADER -->
        <line x1="455" y1="80" x2="455" y2="330" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>

        <!-- RIGHT: TAPFORM BRAND LOCKUP & BOLD REVIEW TITLE WITH GOOGLE G & STARS -->
        <g transform="translate(485, 70)">
          <!-- Tapform Logo + Brand Name (Perfect Mathematical Center Alignment via dominant-baseline) -->
          <g transform="translate(0, 0)">
            <!-- Vortex Knot Logo centered at (24, 24) with size 48 -->
            <g transform="translate(24, 24)">${ICONS.tapformLogo(48, "#10b981", "#ffffff")}</g>
            <text x="62" y="24" dominant-baseline="central" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif" font-size="42" font-weight="900" fill="#ffffff" letter-spacing="2">TAPFORM</text>
          </g>

          <!-- SCAN • TAP • REVIEW Tagline -->
          <text x="5" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="15" font-weight="800" fill="#fecaca" letter-spacing="3.5">SCAN &#8226; TAP &#8226; REVIEW</text>

          <!-- BOLD HERO TITLE: REVIEW -->
          <text x="2" y="172" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Arial Black', sans-serif" font-size="88" font-weight="900" fill="#ffffff" letter-spacing="1">REVIEW</text>

          <!-- SUB-TITLE WITH GOOGLE SIGN & 5 STARS -->
          <g transform="translate(4, 204)">
            <!-- Official Colorful Google "G" Logo -->
            <g transform="translate(0, 0) scale(1.15)">
              ${ICONS.googleG}
            </g>

            <!-- 5 Golden Stars aligned beside Google G -->
            <g transform="translate(42, 4) scale(0.95)">
              ${ICONS.fiveStars}
            </g>
          </g>

          <!-- Action Callout Line -->
          <text x="5" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="1.2">LEAVE US A 5-STAR REVIEW ON GOOGLE</text>
        </g>

        <!-- ================= DUAL ACTION TILES (MIDDLE) ================= -->
        <!-- Tile 1: TAP YOUR PHONE (NFC) -->
        <g transform="translate(85, 455)">
          <!-- White square box with red rounded border -->
          <rect x="0" y="0" width="375" height="345" rx="36" fill="#ffffff" stroke="#dc2626" stroke-width="3"/>

          <!-- NFC Phone Illustration -->
          <g transform="translate(142, 45) scale(1.75)">
            ${ICONS.nfcPhoneHand("#0f172a")}
          </g>

          <!-- NFC Text -->
          <text x="187" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="2">NFC</text>
          <text x="187" y="268" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="0.5">Instant 1-Tap on all smartphones</text>

          <!-- Red Capsule Button: TAP YOUR PHONE -->
          <g transform="translate(42, 290)">
            <rect x="0" y="0" width="291" height="52" rx="26" fill="url(#redPillGrad)"/>
            <text x="145" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">TAP YOUR PHONE</text>
          </g>
        </g>

        <!-- CENTER "OR" BADGE -->
        <g transform="translate(500, 615)">
          <!-- Subtle vertical divider behind OR -->
          <line x1="0" y1="-100" x2="0" y2="-30" stroke="#e2e8f0" stroke-width="2"/>
          <line x1="0" y1="30" x2="0" y2="100" stroke="#e2e8f0" stroke-width="2"/>
          <text x="0" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="900" fill="#0f172a" text-anchor="middle">OR</text>
        </g>

        <!-- Tile 2: SCAN QR CODE -->
        <g transform="translate(540, 455)">
          <!-- White square box with red rounded border -->
          <rect x="0" y="0" width="375" height="345" rx="36" fill="#ffffff" stroke="#dc2626" stroke-width="3"/>

          <!-- High-Contrast Vector QR Code (4x4 cm equivalent) -->
          ${
            isBlank
              ? `
              <rect x="67" y="32" width="240" height="240" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="6,6" stroke-width="2"/>
              <text x="187" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="800" fill="#64748b" text-anchor="middle">PRINT / STICK QR</text>
              <text x="187" y="175" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">4x4 cm High-Res QR Area</text>
              `
              : `<g transform="translate(67, 32)">${generateQrPath(qrValue, 0, 0, 240, 240, "#090b0e")}</g>`
          }

          <!-- Red Capsule Button: SCAN QR CODE -->
          <g transform="translate(42, 290)">
            <rect x="0" y="0" width="291" height="52" rx="26" fill="url(#redPillGrad)"/>
            <text x="145" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">SCAN QR CODE</text>
          </g>
        </g>

        <!-- ================= BOTTOM FOOTER SECTION ================= -->
        <!-- Minimal Divider Line -->
        <line x1="70" y1="875" x2="930" y2="875" stroke="#e2e8f0" stroke-width="2"/>

        <!-- 4 Minimal Clean Action Highlights (Like photo) -->
        <g transform="translate(90, 895)">
          <!-- 1: Instant Tap -->
          <g transform="translate(0, 0)">
            <circle cx="20" cy="22" r="16" fill="#fef2f2"/>
            <g transform="translate(10, 12) scale(0.85)">${ICONS.nfcWave("#dc2626")}</g>
            <text x="46" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="900" fill="#0f172a">INSTANT</text>
            <text x="46" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="600" fill="#64748b">1-TAP NFC</text>
          </g>

          <line x1="185" y1="6" x2="185" y2="40" stroke="#e2e8f0" stroke-width="1.5"/>

          <!-- 2: No App Needed -->
          <g transform="translate(215, 0)">
            <circle cx="20" cy="22" r="16" fill="#fef2f2"/>
            <path d="M14 22 L19 27 L27 17" stroke="#dc2626" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <text x="46" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="900" fill="#0f172a">ZERO APP</text>
            <text x="46" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="600" fill="#64748b">REQUIRED</text>
          </g>

          <line x1="395" y1="6" x2="395" y2="40" stroke="#e2e8f0" stroke-width="1.5"/>

          <!-- 3: 5-Star Reviews -->
          <g transform="translate(425, 0)">
            <circle cx="20" cy="22" r="16" fill="#fef2f2"/>
            <path d="M20 12l2.3 5.4 5.7.5-4.2 3.7 1.3 5.6-5.1-3-5.1 3 1.3-5.6-4.2-3.7 5.7-.5z" fill="#dc2626"/>
            <text x="46" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="900" fill="#0f172a">5-STAR</text>
            <text x="46" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="600" fill="#64748b">REVIEWS</text>
          </g>

          <line x1="605" y1="6" x2="605" y2="40" stroke="#e2e8f0" stroke-width="1.5"/>

          <!-- 4: 100% Secure -->
          <g transform="translate(635, 0)">
            <circle cx="20" cy="22" r="16" fill="#fef2f2"/>
            <path d="M20 12 L28 15 V21 C28 26 24 29 20 31 C16 29 12 26 12 21 V15 Z" fill="none" stroke="#dc2626" stroke-width="2"/>
            <text x="46" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="900" fill="#0f172a">VERIFIED</text>
            <text x="46" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="600" fill="#64748b">HARDWARE</text>
          </g>
        </g>

        <!-- Footer Tagline & Contact info -->
        <g transform="translate(${SW / 2}, 968)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="1">${safeBrand} Stand Plaque &#8226; ID: ${isBlank ? "STAND-ID" : safeCardId} &#8226; Ph: +91 ${safePhone}</text>
        </g>
      </g>
    </svg>`;
  }

  // -------------------------------------------------------------------------
  // STAND VARIANT 2: ALL IN ONE STAND (6x6 inch)
  // Premium Acrylic Modern Stand Plaque (Matching exact uploaded design):
  // - Clean luxury warm cream/white background with curved decorative ribbon waves
  // - Top Header: #Serial Badge on left, 1-TAP badge with NFC waves on right
  // - Elegant Hero Title: "Connect & Review" with stylized italic Review in bronze/gold
  // - Subtitle: "GOOGLE • INSTAGRAM • WHATSAPP • FACEBOOK" with centered 4-point diamond star
  // - 4 Floating Rounded Square App Tiles: Google G, Instagram gradient, WhatsApp green, Facebook blue
  // - Middle Left: Modern sleek smartphone with NFC waves inside warm organic blob, "TAP your phone"
  // - Center Divider: Vertical thin line with bronze/gold circular "OR" badge
  // - Middle Right: Clean QR Code with golden corner brackets, Stand ID capsule, "SCAN the QR code"
  // - Bottom Base: Fluid luxury golden wave + obsidian dark footer with Smart NFC badge & "Powered By Tapform" (our emerald vortex logo)
  // -------------------------------------------------------------------------
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}">
    <defs>
      <!-- Premium Bronze/Gold Gradients -->
      <linearGradient id="bronzeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#b46a2a"/>
        <stop offset="40%" stop-color="#cf8438"/>
        <stop offset="100%" stop-color="#934d17"/>
      </linearGradient>
      <linearGradient id="warmBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdf3e7"/>
        <stop offset="100%" stop-color="#f5e1cb"/>
      </linearGradient>
      <linearGradient id="goldRibbonSweep" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d49b4c"/>
        <stop offset="50%" stop-color="#f0c27b"/>
        <stop offset="100%" stop-color="#be7f32"/>
      </linearGradient>
      <linearGradient id="instaTileGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffd521"/>
        <stop offset="25%" stop-color="#f50000"/>
        <stop offset="50%" stop-color="#b900b4"/>
        <stop offset="100%" stop-color="#833ab4"/>
      </linearGradient>
      <!-- Clip path to keep stand rounded corners -->
      <clipPath id="allInOneClip">
        <rect x="0" y="0" width="${SW}" height="${SH}" rx="${SR}"/>
      </clipPath>
    </defs>

    <!-- Outer Acrylic Stand Base with 50px Rounded Corners -->
    <g clip-path="url(#allInOneClip)">
      <!-- Warm Luxury Off-White / Pearl Cream Canvas -->
      <rect x="0" y="0" width="${SW}" height="${SH}" fill="#faf8f5"/>

      <!-- Subtle background decorative curved ribbons -->
      <path d="M 0,180 C 120,260 80,480 0,560 Z" fill="#f4ede4" opacity="0.7"/>
      <path d="M ${SW},120 C ${SW - 100},320 ${SW - 60},520 ${SW},640 Z" fill="#f4ede4" opacity="0.6"/>

      <!-- ================= TOP HEADER BAR ================= -->
      <!-- Left: #Serial ID Badge -->
      <g transform="translate(60, 48)">
        <rect x="0" y="0" width="105" height="42" rx="14" fill="#ffffff" stroke="#e8dfd5" stroke-width="2"/>
        <text x="52" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="20" font-weight="900" fill="#1e2530" text-anchor="middle" letter-spacing="1">${isBlank ? "#____" : cornerNumber}</text>
      </g>

      <!-- Right: 1-TAP NFC Badge -->
      <g transform="translate(${SW - 175}, 48)">
        <rect x="0" y="0" width="115" height="42" rx="21" fill="#ffffff" stroke="#e8dfd5" stroke-width="2"/>
        <text x="46" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="900" fill="#934d17" letter-spacing="1">1-TAP</text>
        <g transform="translate(94, 21) scale(0.65)">
          <path d="M 0,-14 A 14 14 0 0 1 0,14" fill="none" stroke="#934d17" stroke-width="3" stroke-linecap="round"/>
          <path d="M 6,-9 A 9 9 0 0 1 6,9" fill="none" stroke="#934d17" stroke-width="3" stroke-linecap="round"/>
        </g>
      </g>

      <!-- Optional Client Business Title (If Assigned) -->
      ${
        displayTitle
          ? `
          <g transform="translate(${SW / 2}, 80)">
            <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="800" fill="#78716c" text-anchor="middle" letter-spacing="2">${displayTitle.toUpperCase()}</text>
          </g>
          `
          : ''
      }

      <!-- ================= HERO CONNECT & REVIEW TITLE ================= -->
      <g transform="translate(${SW / 2}, ${displayTitle ? 142 : 130})">
        <!-- "Connect & Review" Lockup -->
        <text x="0" y="0" text-anchor="middle">
          <tspan font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="64" font-weight="900" fill="#181e26" letter-spacing="-1">Connect &amp; </tspan>
          <tspan font-family="'Playfair Display', Georgia, serif" font-size="70" font-weight="800" font-style="italic" fill="url(#bronzeGoldGrad)">Review</tspan>
        </text>

        <!-- Subtitle: GOOGLE • INSTAGRAM • WHATSAPP • FACEBOOK -->
        <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="800" fill="#44403c" text-anchor="middle" letter-spacing="4">GOOGLE &#8226; INSTAGRAM &#8226; WHATSAPP &#8226; FACEBOOK</text>

        <!-- Centered Delicate 4-point Bronze Diamond Star with Horizontal Accent Lines -->
        <g transform="translate(0, 78)">
          <line x1="-150" y1="0" x2="-25" y2="0" stroke="#d5beaa" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M 0,-8 L 3,0 L 0,8 L -3,0 Z" fill="#b46a2a"/>
          <path d="M -8,0 L 0,3 L 8,0 L 0,-3 Z" fill="#b46a2a"/>
          <line x1="25" y1="0" x2="150" y2="0" stroke="#d5beaa" stroke-width="1.8" stroke-linecap="round"/>
        </g>
      </g>

      <!-- ================= 4 FLOATING SOCIAL TILES ================= -->
      <g transform="translate(${SW / 2}, ${displayTitle ? 286 : 274})">
        <!-- 1. Google Tile -->
        <g transform="translate(-165, 0)">
          <rect x="-38" y="-38" width="76" height="76" rx="24" fill="#ffffff" stroke="#f0e9df" stroke-width="2"/>
          <g transform="translate(-16, -16) scale(1.35)">${ICONS.googleG}</g>
        </g>

        <!-- 2. Instagram Tile -->
        <g transform="translate(-55, 0)">
          <rect x="-38" y="-38" width="76" height="76" rx="24" fill="url(#instaTileGrad)"/>
          <g transform="translate(-16, -16) scale(1.35)">${ICONS.instagram}</g>
        </g>

        <!-- 3. WhatsApp Tile -->
        <g transform="translate(55, 0)">
          <rect x="-38" y="-38" width="76" height="76" rx="24" fill="#25D366"/>
          <g transform="translate(-16, -16) scale(1.35)">${ICONS.whatsapp}</g>
        </g>

        <!-- 4. Facebook Tile -->
        <g transform="translate(165, 0)">
          <rect x="-38" y="-38" width="76" height="76" rx="24" fill="#1877F2"/>
          <g transform="translate(-13, -13) scale(1.15)">${ICONS.facebook}</g>
        </g>
      </g>

      <!-- ================= MIDDLE DUAL ACTION SECTION ================= -->
      <!-- LEFT ACTION: TAP YOUR PHONE -->
      <g transform="translate(150, 410)">
        <!-- Warm Soft Organic Background Blob -->
        <path d="M 60,20 C 140,-10 210,40 220,120 C 230,200 160,240 80,230 C 0,220 -20,150 10,80 Z" fill="url(#warmBlobGrad)"/>

        <!-- Phone Silhouette tilted slightly -->
        <g transform="translate(115, 125) rotate(-10)" stroke="#181e26" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Smartphone Outer Shell -->
          <rect x="-50" y="-85" width="100" height="170" rx="22" fill="#ffffff"/>
          <!-- Speaker Notch -->
          <line x1="-15" y1="-72" x2="15" y2="-72" stroke-width="4"/>
          <!-- NFC Radiating Waves inside phone screen -->
          <path d="M -16,-22 A 24 24 0 0 1 -16,22" stroke-width="6" stroke="#181e26"/>
          <path d="M -2,-14 A 15 15 0 0 1 -2,14" stroke-width="5.5" stroke="#181e26"/>
          <path d="M 10,-7 A 7 7 0 0 1 10,7" stroke-width="5" stroke="#181e26"/>
        </g>

        <!-- Text: TAP your phone -->
        <text x="115" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="44" font-weight="900" fill="#181e26" text-anchor="middle" letter-spacing="2">TAP</text>
        <text x="115" y="312" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="700" fill="#292524" text-anchor="middle">your phone</text>

        <!-- Bronze Golden Underline Bar -->
        <rect x="75" y="330" width="80" height="8" rx="4" fill="url(#bronzeGoldGrad)"/>
      </g>

      <!-- CENTER DIVIDER WITH GOLDEN "OR" BADGE -->
      <g transform="translate(500, 560)">
        <!-- Thin Divider Spindle -->
        <line x1="0" y1="-140" x2="0" y2="-32" stroke="#d5beaa" stroke-width="2"/>
        <line x1="0" y1="32" x2="0" y2="140" stroke="#d5beaa" stroke-width="2"/>

        <!-- Bronze Circular Badge -->
        <circle cx="0" cy="0" r="30" fill="url(#bronzeGoldGrad)"/>
        <text x="0" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">OR</text>
      </g>

      <!-- RIGHT ACTION: SCAN THE QR CODE -->
      <g transform="translate(605, 410)">
        <!-- White Rounded Tile Container -->
        <rect x="0" y="0" width="255" height="255" rx="36" fill="#ffffff" stroke="#f0e9df" stroke-width="3"/>

        <!-- 4 Golden Corner L-Brackets -->
        <g stroke="url(#bronzeGoldGrad)" stroke-width="6" fill="none" stroke-linecap="round">
          <!-- Top Left -->
          <path d="M -12,28 L -12,0 Q -12,-12 0,-12 L 28,-12" />
          <!-- Top Right -->
          <path d="M 227,-12 L 255,-12 Q 267,-12 267,0 L 267,28" />
          <!-- Bottom Left -->
          <path d="M -12,227 L -12,255 Q -12,267 0,267 L 28,267" />
          <!-- Bottom Right -->
          <path d="M 227,267 L 255,267 Q 267,267 267,255 L 267,227" />
        </g>

        <!-- Vector High-Contrast QR Code -->
        ${
          isBlank
            ? `
            <rect x="18" y="18" width="219" height="219" rx="18" fill="#faf8f5" stroke="#e8dfd5" stroke-dasharray="6,6" stroke-width="2"/>
            <text x="127" y="118" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="800" fill="#78716c" text-anchor="middle">PRINT / PASTE QR</text>
            <text x="127" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="600" fill="#a8a29e" text-anchor="middle">Stand ID Placeholder</text>
            `
            : `<g transform="translate(18, 18)">${generateQrPath(qrValue, 0, 0, 219, 219, "#090b0e")}</g>`
        }

        <!-- Mini Stand ID Pill Capsule at bottom of QR frame -->
        <g transform="translate(127, 240)">
          <rect x="-55" y="-14" width="110" height="24" rx="12" fill="#ffffff" stroke="#d5beaa" stroke-width="1.8"/>
          <text x="0" y="3" font-family="monospace, -apple-system, sans-serif" font-size="13" font-weight="900" fill="#181e26" text-anchor="middle" letter-spacing="1">${isBlank ? "TF-____" : safeCardId}</text>
        </g>

        <!-- Text: SCAN the QR code -->
        <text x="127" y="306" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="44" font-weight="900" fill="#181e26" text-anchor="middle" letter-spacing="2">SCAN</text>
        <text x="127" y="344" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="700" fill="#292524" text-anchor="middle">the QR code</text>

        <!-- Bronze Golden Underline Bar -->
        <rect x="87" y="362" width="80" height="8" rx="4" fill="url(#bronzeGoldGrad)"/>
      </g>

      <!-- ================= BOTTOM DYNAMIC LUXURY WAVE ================= -->
      <!-- Fluid Golden Ribbon Sweep -->
      <path d="M 0,840 C 350,880 720,830 ${SW},790 L ${SW},840 C 720,880 350,930 0,890 Z" fill="url(#goldRibbonSweep)"/>

      <!-- Deep Dark Obsidian Bottom Slab -->
      <path d="M 0,875 C 350,915 720,865 ${SW},825 L ${SW},${SH} L 0,${SH} Z" fill="#0d1117"/>

      <!-- Bottom Left: Circular Smart NFC Badge & Info -->
      <g transform="translate(60, 936)">
        <!-- Golden Circled NFC Wave Icon -->
        <circle cx="28" cy="20" r="28" fill="#161b22" stroke="url(#goldRibbonSweep)" stroke-width="2.5"/>
        <g transform="translate(28, 20) scale(0.85)">
          <path d="M -12,-16 A 20 20 0 0 1 -12,16" fill="none" stroke="#f0c27b" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M -3,-10 A 12 12 0 0 1 -3,10" fill="none" stroke="#f0c27b" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M 6,-5 A 6 6 0 0 1 6,5" fill="none" stroke="#f0c27b" stroke-width="3" stroke-linecap="round"/>
        </g>
        <text x="72" y="14" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="900" fill="#ffffff" letter-spacing="2">SMART NFC</text>
        <text x="72" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#94a3b8" letter-spacing="1">6 &#215; 6 ACRYLIC STAND</text>
      </g>

      <!-- Subtle Vertical Divider in Bottom Slab -->
      <line x1="510" y1="925" x2="510" y2="975" stroke="#30363d" stroke-width="1.5"/>

      <!-- Bottom Right: "Powered By Tapform" (Exact Emerald Vortex Logo) -->
      <g transform="translate(${SW - 70}, 936)">
        <text x="0" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="end">Powered By</text>
        <g transform="translate(0, 32)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="end" letter-spacing="1">Tapform</text>
          <!-- Our Official Emerald Vortex Knot Logo -->
          <g transform="translate(-134, -2)">
            ${ICONS.tapformLogo(28, "#10b981", "#ffffff")}
          </g>
        </g>
      </g>
    </g>
  </svg>`;
}

/**
 * TRIGGER FILE DOWNLOAD HELPER
 */
function triggerDownloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 1. DOWNLOAD AS SCALABLE VECTOR GRAPHIC (.SVG)
 */
export function downloadCardSvg(options, filename = "nfc-card-vector") {
  const svgString = generateCardSvgString(options);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  triggerDownloadBlob(blob, `${filename}.svg`);
  return { success: true, filename: `${filename}.svg` };
}

/**
 * 2. DOWNLOAD AS 300 DPI HIGH-RESOLUTION PRINT PNG
 */
export async function downloadCardPng(options, filename = "nfc-card-print-300dpi", scale = 3) {
  const svgString = generateCardSvgString(options);
  const isStand = options.format === "table-stand";
  const baseW = isStand ? 1000 : 638;
  const baseH = isStand ? 1000 : 1012;

  const targetW = baseW * scale;
  const targetH = baseH * scale;

  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, targetW, targetH);
        URL.revokeObjectURL(objectUrl);

        canvas.toBlob(
          (pngBlob) => {
            if (!pngBlob) {
              reject(new Error("Failed to generate PNG blob"));
              return;
            }
            triggerDownloadBlob(pngBlob, `${filename}.png`);
            resolve({ success: true, filename: `${filename}.png`, width: targetW, height: targetH });
          },
          "image/png",
          1.0
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

/**
 * 3. DOWNLOAD AS CORELDRAW VECTOR PRINT READY FILE (.SVG)
 */
export function downloadCardCorelDraw(options, filename = "nfc-card-coreldraw") {
  const svgString = generateCardSvgString(options);
  const sideLabel = options.side === "back" ? "Back Side" : "Front Side";
  const cdrHeader = `<!-- 
  =============================================================================
  CORELDRAW 100% VECTOR PRINT READY SPECIFICATION (${sideLabel})
  Vendor Instruction: In CorelDRAW, press Ctrl + I (File > Import)
  Aspect Ratio: ${options.format === "table-stand" ? "6x6 inch / 150mm x 150mm (Square Countertop Stand)" : "85.6mm x 54mm (CR80 Standard NFC Card)"}
  Brand: ${options.brandName || "Tapform"} | ${options.phone || "9893711447"} | ${options.email || "ajjumahato9@gmail.com"}
  =============================================================================
-->\n`;
  const blob = new Blob([cdrHeader + svgString], { type: "image/svg+xml;charset=utf-8" });
  triggerDownloadBlob(blob, `${filename}_CorelDRAW_Vector.svg`);
  return {
    success: true,
    filename: `${filename}_CorelDRAW_Vector.svg`,
    tip: "CorelDRAW me File > Import (Ctrl + I) karein, direct 100% vector open hoga!",
  };
}

/**
 * 4. DIRECT BROWSER PRINT (`window.print()`) WITH EXACT MM/INCH DIMENSIONS
 */
export function printCardElement(svgElementId, format = "nfc-card") {
  const el = document.getElementById(svgElementId);
  if (!el) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const isStand = format === "table-stand";
  const cssSize = isStand ? "150mm 150mm" : "54mm 85.6mm";

  // Serialize SVG content properly
  const svgHtml = el.outerHTML;

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print Card - Tapform</title>
  <style>
    @page {
      size: ${cssSize};
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    svg {
      width: 100%;
      height: 100%;
      max-width: 100vw;
      max-height: 100vh;
      display: block;
    }
  </style>
</head>
<body>
  ${svgHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}

/**
 * 5. GENERATE SIDE-BY-SIDE (FRONT & BACK AGAL-BAGAL) PRINT VECTOR SVG
 * Perfect for printers who need Front and Back side-by-side on one sheet
 */
export function generateSideBySideCardSvg(options) {
  const frontOptions = { ...options, side: "front" };
  const backOptions = { ...options, side: "back" };

  const frontSvg = generateCardSvgString(frontOptions);
  const backSvg = generateCardSvgString(backOptions);

  // Strip XML declarations & extract inner content
  const extractInner = (svg) => {
    const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    return match ? match[1] : svg;
  };

  const isStand = options.format === "table-stand";
  const W = isStand ? 1000 : 638;
  const H = isStand ? 1000 : 1012;
  const gap = 80;
  const totalW = W * 2 + gap + 100;
  const totalH = H + 120;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
    <rect width="${totalW}" height="${totalH}" fill="#0b0f17"/>
    
    <!-- Top Sheet Header -->
    <text x="50" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="900" fill="#ffffff" letter-spacing="1">TAPFORM &#8226; PRINT SHEET (FRONT &amp; BACK SIDE-BY-SIDE)</text>
    <text x="${totalW - 50}" y="42" font-family="monospace, sans-serif" font-size="18" font-weight="800" fill="#fbbf24" text-anchor="end">${options.cardId || "TF-CARD"}</text>

    <!-- Front Side Section -->
    <g transform="translate(50, 70)">
      <text x="${W / 2}" y="-12" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="800" fill="#38bdf8" text-anchor="middle" letter-spacing="2">FRONT SIDE (TAP &amp; QR)</text>
      ${extractInner(frontSvg)}
    </g>

    <!-- Back Side Section -->
    <g transform="translate(${50 + W + gap}, 70)">
      <text x="${W / 2}" y="-12" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="800" fill="#10b981" text-anchor="middle" letter-spacing="2">BACK SIDE (CHIP &amp; CONTACT)</text>
      ${extractInner(backSvg)}
    </g>
  </svg>`;
}

/**
 * 6. DOWNLOAD PRINT-READY SIDE-BY-SIDE PDF (FRONT & BACK AGAL-BAGAL)
 */
export async function downloadCardSideBySidePdf(options, filename = "Tapform_Card_Print_Sheet") {
  const { jsPDF } = await import("jspdf");

  const isStand = options.format === "table-stand";
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4", // 297mm x 210mm
  });

  // Render SVG to image data
  const renderSvgToDataUrl = (svgStr, width, height) => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 3;
        canvas.height = height * 3;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png", 1.0));
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };

  const frontSvg = generateCardSvgString({ ...options, side: "front" });
  const backSvg = generateCardSvgString({ ...options, side: "back" });

  const cardW_px = isStand ? 1000 : 638;
  const cardH_px = isStand ? 1000 : 1012;

  const [frontData, backData] = await Promise.all([
    renderSvgToDataUrl(frontSvg, cardW_px, cardH_px),
    renderSvgToDataUrl(backSvg, cardW_px, cardH_px),
  ]);

  // A4 Landscape is 297mm width x 210mm height
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 297, 210, "F");

  // Title Bar
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TAPFORM PHYSICAL PRINT SHEET (FRONT & BACK)", 15, 15);

  doc.setTextColor(251, 191, 36);
  doc.setFontSize(12);
  doc.text(`Card ID: ${options.cardId || "TF-01"}  |  ${isStand ? "6x6 Acrylic Stand (150mm)" : "85x54mm CR80 Card"}`, 282, 15, { align: "right" });

  // Place Front and Back Images
  if (isStand) {
    // 2 Square Stands side by side
    const standSizeMm = 85;
    const yMm = 30;
    doc.addImage(frontData, "PNG", 35, yMm, standSizeMm, standSizeMm);
    doc.addImage(backData, "PNG", 175, yMm, standSizeMm, standSizeMm);

    doc.setTextColor(56, 189, 248);
    doc.setFontSize(11);
    doc.text("FRONT SIDE", 35 + standSizeMm / 2, yMm - 4, { align: "center" });
    doc.setTextColor(52, 211, 153);
    doc.text("BACK SIDE", 175 + standSizeMm / 2, yMm - 4, { align: "center" });
  } else {
    // Pocket Cards: 85.6mm height x 54mm width (Portrait as in SVG)
    const cardWidthMm = 70;
    const cardHeightMm = (70 * 1012) / 638; // ~111mm
    const yMm = 35;
    doc.addImage(frontData, "PNG", 50, yMm, cardWidthMm, cardHeightMm);
    doc.addImage(backData, "PNG", 175, yMm, cardWidthMm, cardHeightMm);

    doc.setTextColor(56, 189, 248);
    doc.setFontSize(11);
    doc.text("FRONT SIDE (TAP & SCAN)", 50 + cardWidthMm / 2, yMm - 4, { align: "center" });
    doc.setTextColor(52, 211, 153);
    doc.text("BACK SIDE (BRAND & PHONE)", 175 + cardWidthMm / 2, yMm - 4, { align: "center" });
  }

  // Footer Instructions
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.text("High-precision thermal PVC & acrylic printer output. Colors calibrated for CMYK / Thermal dye transfer.", 148, 202, { align: "center" });

  doc.save(`${filename}.pdf`);
  return { success: true, filename: `${filename}.pdf` };
}
