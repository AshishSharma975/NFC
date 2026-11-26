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
    title.toLowerCase() === "unassigned stand";
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
        <text x="${W / 2}" y="296" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#fbbf24" text-anchor="middle" letter-spacing="3">SMART NFC &bull; DIGITAL TOUCHPOINT</text>

        <!-- Compact Contact Details Box -->
        <g transform="translate(48, 340)">
          <rect x="0" y="0" width="${W - 96}" height="175" rx="20" fill="#131722" stroke="#252e3e" stroke-width="1.8" filter="drop-shadow(0 8px 20px rgba(0,0,0,0.45))"/>

          <!-- Phone Row -->
          <g transform="translate(24, 25)">
            <rect x="0" y="0" width="38" height="38" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
            <g transform="translate(10, 10) scale(0.85)">${ICONS.phone("#38bdf8")}</g>
            <text x="52" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="800" fill="#94a3b8" letter-spacing="1.2">CALL &bull; WHATSAPP SUPPORT</text>
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
          <!-- Subtle glow effect -->
          <circle cx="-90" cy="0" r="38" fill="#10b981" fill-opacity="0.15" filter="blur(6px)"/>
          
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
          <text x="0" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="500" fill="#64748b" text-anchor="middle">No app or battery required &bull; Waterproof &amp; Durable</text>
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
        <g filter="drop-shadow(0 14px 24px rgba(0,0,0,0.08))">
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
          <text x="160" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="2">1-TAP NFC &bull; SCAN CAMERA</text>
        </g>

        <!-- Social Icons Row (Google, Insta, WhatsApp, FB) -->
        <g transform="translate(${W / 2}, 780)">
          <g transform="translate(-115, 0)">
            <circle cx="28" cy="28" r="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"/>
            <g transform="translate(17, 17) scale(0.95)">${ICONS.googleG}</g>

            <circle cx="90" cy="28" r="24" fill="#e1306c" stroke="#e1306c" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"/>
            <g transform="translate(77, 15) scale(1)">${ICONS.instagram}</g>

            <circle cx="152" cy="28" r="24" fill="#16a34a" stroke="#22c55e" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"/>
            <g transform="translate(139, 15) scale(1)">${ICONS.whatsapp}</g>

            <circle cx="214" cy="28" r="24" fill="#1d4ed8" stroke="#3b82f6" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"/>
            <g transform="translate(203, 17) scale(0.95)">${ICONS.facebook}</g>
          </g>
        </g>

        <!-- Bottom Footer with Card ID & Micro Tag -->
        <g transform="translate(${W / 2}, 920)">
          <rect x="-95" y="-20" width="190" height="38" rx="19" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <text x="0" y="5" font-family="monospace, -apple-system, sans-serif" font-size="17" font-weight="800" fill="#0f172a" text-anchor="middle" letter-spacing="2.5">${isBlank ? "CARD-ID" : safeCardId}</text>
          <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="900" fill="#64748b" text-anchor="middle" letter-spacing="3.5">SMART NFC &bull; ZERO APP NEEDED</text>
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
      <g filter="drop-shadow(0 14px 28px rgba(0,0,0,0.65))">
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
        <text x="160" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">1-TAP NFC &bull; SCAN CAMERA</text>
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
        <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="900" fill="#64748b" text-anchor="middle" letter-spacing="3.5">SMART NFC &bull; ZERO APP NEEDED</text>
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
  // Matching Photo 3: "Review Us on Google", Large Google G, Tap & Scan boxes
  // -------------------------------------------------------------------------
  if (!isAllInOne) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}">
      <defs>
        <radialGradient id="reviewStandBg" cx="50%" cy="20%" r="85%">
          <stop offset="0%" stop-color="#141822"/>
          <stop offset="60%" stop-color="#0c0e14"/>
          <stop offset="100%" stop-color="#07080b"/>
        </radialGradient>
      </defs>

      <rect x="4" y="4" width="${SW - 8}" height="${SH - 8}" rx="${SR}" fill="url(#reviewStandBg)" stroke="#232834" stroke-width="4"/>

      <!-- Header: Serial Badge & Logo -->
      <g transform="translate(60, 60)">
        <rect x="0" y="0" width="120" height="52" rx="16" fill="#141822" stroke="#d4af37" stroke-width="2.5"/>
        <text x="60" y="34" font-family="monospace, sans-serif" font-size="24" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="1">${isBlank ? "#____" : cornerNumber}</text>
      </g>

      <!-- Center Brand Logo with Emerald Vortex -->
      <g transform="translate(${SW / 2 - 80}, 60)">
        <g transform="translate(24, 26)">${ICONS.tapformLogo(44, "#10b981", "#ffffff")}</g>
        <text x="60" y="37" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="36" font-weight="900" fill="#ffffff">${safeBrand}</text>
      </g>

      <!-- Top Right: 1-TAP NFC Badge -->
      <g transform="translate(820, 60)">
        <rect x="0" y="0" width="120" height="52" rx="16" fill="#141822" stroke="#2c3444" stroke-width="2"/>
        <g transform="translate(18, 14) scale(0.8)">${ICONS.nfcWave("#38bdf8")}</g>
        <text x="75" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="900" fill="#ffffff">1-TAP</text>
      </g>

      <!-- Main Headline: "Review Us on Google" & Official Google Logo -->
      <text x="${SW / 2}" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="26" font-weight="800" fill="#94a3b8" text-anchor="middle" letter-spacing="1.5">Review Us on</text>
      
      <g transform="translate(${SW / 2 - 85}, 185) scale(2.0)">
        ${ICONS.googleG}
      </g>

      <g transform="translate(${SW / 2 - 85}, 260) scale(1.3)">
        ${ICONS.fiveStars}
      </g>

      <!-- DUAL ACTION BOXES (TAP PHONE & SCAN CODE) -->
      <g transform="translate(80, 335)">
        <rect x="0" y="0" width="380" height="510" rx="32" fill="#151a24" stroke="#283244" stroke-width="2.5"/>
        <text x="190" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">TAP PHONE</text>

        <g transform="translate(142, 145) scale(1.6)">
          ${ICONS.nfcPhoneHand("#38bdf8")}
        </g>

        <text x="190" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">NFC INSTANT</text>
        <text x="190" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="600" fill="#94a3b8" text-anchor="middle">Hold phone near stand</text>
        <text x="190" y="458" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="1.5">ZERO APP NEEDED</text>
      </g>

      <g transform="translate(540, 335)">
        <rect x="0" y="0" width="380" height="510" rx="32" fill="#151a24" stroke="#283244" stroke-width="2.5"/>
        <text x="190" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">SCAN CODE</text>

        <rect x="35" y="90" width="310" height="310" rx="24" fill="#ffffff" stroke="#4285F4" stroke-width="5"/>
        ${
          isBlank
            ? `
            <rect x="52" y="108" width="276" height="276" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="6,6" stroke-width="2"/>
            <text x="190" y="245" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="800" fill="#64748b" text-anchor="middle">PRINT / PASTE QR HERE</text>
            <text x="190" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">6x6 Blank Review Stand</text>
            `
            : generateQrPath(qrValue, 575, 425, 310, 310, "#0f172a")
        }

        <text x="190" y="450" font-family="monospace, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="3">${isBlank ? "STAND-ID" : safeCardId}</text>
      </g>

      <!-- Bottom Footer Tagline with Brand and Phone in Small Text -->
      <g transform="translate(${SW / 2}, 925)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="2">SMART NFC &bull; ZERO APP NEEDED &bull; 6x6 ACRYLIC STAND</text>
        <text x="0" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#94a3b8" text-anchor="middle">${safeBrand} &bull; Ph: +91 ${safePhone}</text>
      </g>
    </svg>`;
  }

  // -------------------------------------------------------------------------
  // STAND VARIANT 2: ALL IN ONE STAND (6x6 inch)
  // Matching Photo 2: Connect With Us, Social Platforms, Tap & Scan boxes, Bottom brand & phone
  // -------------------------------------------------------------------------
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}">
    <defs>
      <linearGradient id="rainbowBorderStandAll" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4285F4"/>
        <stop offset="33%" stop-color="#EA4335"/>
        <stop offset="66%" stop-color="#FBBC05"/>
        <stop offset="100%" stop-color="#34A853"/>
      </linearGradient>
      <linearGradient id="instaGradAll" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffd521"/>
        <stop offset="25%" stop-color="#f50000"/>
        <stop offset="50%" stop-color="#b900b4"/>
        <stop offset="100%" stop-color="#833ab4"/>
      </linearGradient>
    </defs>

    <rect x="4" y="4" width="${SW - 8}" height="${SH - 8}" rx="${SR}" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>

    <!-- Header: Serial Badge & Logo -->
    <g transform="translate(80, 60)">
      <rect x="0" y="0" width="120" height="52" rx="16" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
      <text x="60" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="24" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">${isBlank ? "#____" : cornerNumber}</text>
    </g>

    <!-- Center Brand Logo with Emerald Vortex -->
    <g transform="translate(${SW / 2 - 85}, 60)">
      <g transform="translate(24, 26)">${ICONS.tapformLogo(44, "#10b981", "#10b981")}</g>
      <text x="60" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="38" font-weight="900" fill="#0f172a">${safeBrand}</text>
    </g>

    <g transform="translate(800, 60)">
      <rect x="0" y="0" width="120" height="52" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <g transform="translate(18, 14) scale(0.8)">${ICONS.nfcWave("#0284c7")}</g>
      <text x="75" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="900" fill="#0f172a">1-TAP</text>
    </g>

    <g transform="translate(${SW / 2 - 95}, 145) scale(1.45)">
      ${ICONS.fiveStars}
    </g>

    <!-- Connect & Review Tagline -->
    <text x="${SW / 2}" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="2.5">CONNECT WITH US ON ALL PLATFORMS</text>

    <!-- Social Icons -->
    <g transform="translate(${SW / 2}, 258)">
      <circle cx="-90" cy="0" r="22" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.12))"/>
      <g transform="translate(-104, -14) scale(1.15)">${ICONS.googleG}</g>

      <circle cx="-30" cy="0" r="22" fill="url(#instaGradAll)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.12))"/>
      <g transform="translate(-45, -15) scale(1.2)">${ICONS.instagram}</g>

      <circle cx="30" cy="0" r="22" fill="#25D366" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.12))"/>
      <g transform="translate(14, -16) scale(1.25)">${ICONS.whatsapp}</g>

      <circle cx="90" cy="0" r="22" fill="#1877F2" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.12))"/>
      <g transform="translate(77, -13) scale(1.05)">${ICONS.facebook}</g>
    </g>

    <!-- DUAL ACTION PANELS -->
    <g transform="translate(95, 315)">
      <rect x="0" y="0" width="375" height="510" rx="32" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5" filter="drop-shadow(0 6px 16px rgba(0,0,0,0.03))"/>
      <text x="187" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="21" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="2">TAP PHONE</text>

      <g transform="translate(138, 140) scale(1.6)">
        <rect x="20" y="6" width="56" height="96" rx="12" fill="none" stroke="#0284c7" stroke-width="4.5"/>
        <line x1="42" y1="16" x2="54" y2="16" stroke="#0284c7" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="48" cy="88" r="4" fill="#0284c7"/>
        <path d="M 6 36 A 22 22 0 0 0 6 68" fill="none" stroke="#0284c7" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M 12 43 A 14 14 0 0 0 12 61" fill="none" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/>
        <path d="M 76 66 L 90 74 A 6 6 0 0 1 93 79 L 93 96 L 66 96" fill="none" stroke="#0284c7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <text x="187" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="23" font-weight="900" fill="#0f172a" text-anchor="middle">NFC INSTANT</text>
      <text x="187" y="414" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748b" text-anchor="middle">Hold phone near stand</text>
      <text x="187" y="456" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="900" fill="#0284c7" text-anchor="middle" letter-spacing="1.5">ZERO APP NEEDED</text>
    </g>

    <g transform="translate(525, 315)">
      <rect x="0" y="0" width="375" height="510" rx="32" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5" filter="drop-shadow(0 6px 16px rgba(0,0,0,0.03))"/>
      <text x="187" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="21" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="2">SCAN CODE</text>

      <rect x="32" y="80" width="310" height="310" rx="28" fill="#ffffff" stroke="url(#rainbowBorderStandAll)" stroke-width="6"/>

      ${
        isBlank
          ? `
          <rect x="50" y="98" width="274" height="274" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-dasharray="6,6" stroke-width="2"/>
          <text x="187" y="235" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="15" font-weight="800" fill="#94a3b8" text-anchor="middle">PASTE / PRINT QR HERE</text>
          <text x="187" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="600" fill="#cbd5e1" text-anchor="middle">Blank 6x6 Countertop Stand</text>
          `
          : generateQrPath(qrValue, 557, 395, 310, 310, "#0f172a")
      }

      <text x="187" y="445" font-family="monospace, -apple-system, sans-serif" font-size="21" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="3">${isBlank ? "STAND-ID" : safeCardId}</text>
    </g>

    <!-- Bottom Footer Tagline: Brand & Phone in Small Text (Requested in Photo 2) -->
    <g transform="translate(${SW / 2}, 915)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="3">SMART NFC &bull; ZERO APP NEEDED &bull; 6x6 COUNTERTOP STAND</text>
      <text x="0" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">${safeBrand} &bull; Ph: +91 ${safePhone}</text>
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
