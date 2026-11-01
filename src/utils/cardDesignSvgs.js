import QRCode from "qrcode";

/**
 * PURE VECTOR SVG CARD & ACRYLIC STAND GENERATOR (PINTEREST MINIMAL AESTHETIC)
 * 
 * Features:
 * - Unique Corner Serial Number Badge (#01, #02, #42, #100) on every card for easy warehouse & physical sorting
 * - 100% Single-sided print-ready layout
 * - Infinite scalability (Vector SVG, 300 DPI PNG, CorelDRAW, Print)
 */

// Helper to generate pure SVG path string for QR code modules
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
  googleG: `
    <g transform="scale(1.2)">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </g>
  `,
  nfcWave: (color = "#ffffff") => `
    <g stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M19 3a20 20 0 0 1 0 22" />
      <path d="M13 7a14 14 0 0 1 0 14" />
      <path d="M7 11a8 8 0 0 1 0 6" />
    </g>
  `,
  nfcPhoneHand: (color = "#38bdf8") => `
    <g stroke="${color}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="25" y="10" width="46" height="78" rx="8" />
      <line x1="42" y1="18" x2="54" y2="18" />
      <circle cx="48" cy="78" r="3" fill="${color}" />
      <path d="M12 36a22 22 0 0 0 0 26" />
      <path d="M17 41a15 15 0 0 0 0 16" />
      <path d="M68 56l14 8a6 6 0 0 1 3 5v18H58" />
    </g>
  `,
  fiveStars: `
    <g fill="#FBBC04" transform="scale(1.05)">
      ${[0, 1, 2, 3, 4]
        .map(
          (i) =>
            `<path transform="translate(${i * 26}, 0)" d="M12 2l2.9 6.8 7.1.6-5.3 4.7 1.6 7-6.3-3.7-6.3 3.7 1.6-7-5.3-4.7 7.1-.6z"/>`
        )
        .join("")}
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
 * GENERATE SVG STRING (SINGLE-SIDED DESIGN WITH CORNER SERIAL NUMBER)
 * @param {Object} options
 * @param {'nfc-card' | 'table-stand'} options.format - Card vs Countertop stand
 * @param {'matte-black' | 'minimal-white' | 'sunset-split'} options.theme - Design aesthetic
 * @param {'review' | 'connect'} options.cardType - Review card vs Multi-link connect card
 * @param {string} options.title - Shop or business name
 * @param {string} options.cardId - Card ID (e.g. TF-01)
 * @param {number|string} options.cardNumber - Unique corner sequence number (e.g. 1 -> #01)
 * @param {string} options.qrValue - Redirect URL encoded in QR code
 * @param {Object} options.socialLinks - { instagram, whatsapp, facebook }
 */
export function generateCardSvgString({
  format = "nfc-card",
  theme = "matte-black",
  cardType = "review",
  title = "Our Business",
  cardId = "TF-01",
  cardNumber = null,
  qrValue = "https://tapform.me/c/TF-01",
  socialLinks = {},
}) {
  const safeTitle = escapeXml(title || "Your Business Name");
  const safeCardId = escapeXml(cardId || "TF-01");
  const isConnect = cardType === "connect";

  // Calculate formatted corner serial number (#01, #02, #42, #100)
  let cornerNumber = "";
  if (cardNumber !== undefined && cardNumber !== null && !isNaN(parseInt(cardNumber, 10))) {
    const rawNum = parseInt(cardNumber, 10);
    cornerNumber = `#${String(rawNum).padStart(2, "0")}`;
  } else {
    const digitMatch = safeCardId.match(/\d+$/);
    if (digitMatch) {
      const rawNum = parseInt(digitMatch[0], 10);
      cornerNumber = !isNaN(rawNum) ? `#${String(rawNum).padStart(2, "0")}` : `#${digitMatch[0]}`;
    } else {
      cornerNumber = `#01`;
    }
  }

  const hasInsta = Boolean(socialLinks?.instagram);
  const hasWa = Boolean(socialLinks?.whatsapp);
  const hasFb = Boolean(socialLinks?.facebook);

  // =========================================================================
  // 1. FORMAT: NFC POCKET CARD (CR80 RATIO: 638 x 1012 px Vertical, SINGLE-SIDED)
  // Everything is integrated on one sleek face with Corner Serial Number!
  // =========================================================================
  if (format === "nfc-card") {
    const W = 638;
    const H = 1012;
    const R = 36; // Card corner radius

    // -----------------------------------------------------------------------
    // THEME 1: MATTE OBSIDIAN NOIR (Pinterest Luxury Dark Minimal)
    // -----------------------------------------------------------------------
    if (theme === "matte-black") {
      const qrBoxSize = 340;
      const qrBoxX = (W - qrBoxSize) / 2;
      const qrBoxY = 285;
      const qrCodeSize = 280;
      const qrCodeX = (W - qrCodeSize) / 2;
      const qrCodeY = qrBoxY + (qrBoxSize - qrCodeSize) / 2;

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

        <!-- Outer Card Base with Crisp Chamfered Border -->
        <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="url(#luxeMatteBg)" stroke="#232834" stroke-width="2.5"/>

        <!-- Subtle Inner Hairline Border (Luxury Detail) -->
        <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="${R - 8}" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1.2"/>

        <!-- TOP HEADER BAR: CORNER NUMBER + GOOGLE REVIEW PILL + NFC WAVE -->
        <!-- 1. Prominent Corner Serial Badge (Top-Left) -->
        <g transform="translate(46, 48)">
          <rect x="0" y="0" width="86" height="40" rx="12" fill="#141822" stroke="#d4af37" stroke-width="1.8"/>
          <text x="43" y="26" font-family="monospace, 'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="1">${cornerNumber}</text>
        </g>

        <!-- 2. Google Review Emblem Pill -->
        <g transform="translate(142, 48)">
          <rect x="0" y="0" width="126" height="40" rx="20" fill="#151a24" stroke="#2c3444" stroke-width="1.2"/>
          <g transform="translate(10, 8) scale(0.85)">${ICONS.googleG}</g>
          <text x="44" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="700" fill="#e2e8f0" letter-spacing="1">REVIEW</text>
        </g>

        <!-- 3. Top Right: NFC Contactless Wave Indicator -->
        <g transform="translate(${W - 96}, 46)">
          <g transform="scale(1.5)">
            ${ICONS.nfcWave("#ffffff")}
          </g>
          <text x="-8" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="10" font-weight="800" fill="#94a3b8" letter-spacing="1.5">TAP HERE</text>
        </g>

        <!-- Business Name -->
        <text x="${W / 2}" y="152" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif" font-size="32" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-0.3">${safeTitle}</text>

        <!-- Google 5-Star Rating Element -->
        <g transform="translate(${W / 2 - 68}, 175) scale(1.05)">
          ${ICONS.fiveStars}
        </g>

        <!-- Subtitle Callout -->
        <text x="${W / 2}" y="235" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="3.5">${isConnect ? "TAP PHONE OR SCAN QR TO CONNECT" : "SHARE YOUR VALUABLE REVIEW"}</text>

        <!-- HERO ELEMENT: PURE WHITE CERAMIC TILE WITH CRISP QR CODE -->
        <g filter="drop-shadow(0 14px 24px rgba(0,0,0,0.6))">
          <rect x="${qrBoxX}" y="${qrBoxY}" width="${qrBoxSize}" height="${qrBoxSize}" rx="26" fill="#ffffff" stroke="url(#qrFrameGrad)" stroke-width="4.5"/>
          ${generateQrPath(qrValue, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, "#090b0e")}
        </g>

        <!-- Action Capsule Pill Below QR -->
        <g transform="translate(${W / 2 - 130}, 652)">
          <rect x="0" y="0" width="260" height="38" rx="19" fill="#151a24" stroke="#2c3444" stroke-width="1.2"/>
          <circle cx="22" cy="19" r="6" fill="#22c55e" />
          <text x="140" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="800" fill="#f1f5f9" text-anchor="middle" letter-spacing="2">1-TAP NFC  •  SCAN CAMERA</text>
        </g>

        <!-- MULTI-LINK SOCIAL PILLS (If Connect Card) OR WARM THANK YOU -->
        ${
          isConnect
            ? `
            <g transform="translate(${W / 2}, 740)">
              <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="2">CONNECT WITH US ON</text>
              
              <g transform="translate(-105, 16)">
                <!-- Google -->
                <circle cx="25" cy="25" r="22" fill="#181e28" stroke="#2f394a" stroke-width="1.5"/>
                <g transform="translate(15, 15) scale(0.85)">${ICONS.googleG}</g>

                <!-- Instagram -->
                <circle cx="80" cy="25" r="22" fill="${hasInsta ? "#833ab4" : "#181e28"}" stroke="${hasInsta ? "#e1306c" : "#2f394a"}" stroke-width="1.5"/>
                <g transform="translate(68, 13) scale(0.9)">${ICONS.instagram}</g>

                <!-- WhatsApp -->
                <circle cx="135" cy="25" r="22" fill="${hasWa ? "#16a34a" : "#181e28"}" stroke="${hasWa ? "#22c55e" : "#2f394a"}" stroke-width="1.5"/>
                <g transform="translate(123, 13) scale(0.9)">${ICONS.whatsapp}</g>

                <!-- Facebook -->
                <circle cx="190" cy="25" r="22" fill="${hasFb ? "#1d4ed8" : "#181e28"}" stroke="${hasFb ? "#3b82f6" : "#2f394a"}" stroke-width="1.5"/>
                <g transform="translate(180, 15) scale(0.85)">${ICONS.facebook}</g>
              </g>
            </g>
            `
            : `
            <g transform="translate(${W / 2}, 745)">
              <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="15" font-weight="600" fill="#cbd5e1" text-anchor="middle">Your reviews tell us what matters to you.</text>
              <text x="0" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="400" fill="#64748b" text-anchor="middle">We are proud and grateful to serve you.</text>
            </g>
            `
        }

        <!-- Bottom Footer with Card ID & Authentic Badge -->
        <g transform="translate(${W / 2}, 915)">
          <rect x="-85" y="-18" width="170" height="34" rx="17" fill="#121620" stroke="#242b38" stroke-width="1.2"/>
          <text x="0" y="4" font-family="monospace, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="2">${safeCardId}</text>

          <text x="0" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="10" font-weight="800" fill="#475569" text-anchor="middle" letter-spacing="3.5">SMART NFC &bull; ZERO APP NEEDED</text>
        </g>
      </svg>`;
    }

    // -----------------------------------------------------------------------
    // THEME 2: STUDIO PORCELAIN PEARL (Pinterest Scandinavian Minimalist White)
    // -----------------------------------------------------------------------
    if (theme === "minimal-white") {
      const qrBoxSize = 340;
      const qrBoxX = (W - qrBoxSize) / 2;
      const qrBoxY = 285;
      const qrCodeSize = 280;
      const qrCodeX = (W - qrCodeSize) / 2;
      const qrCodeY = qrBoxY + (qrBoxSize - qrCodeSize) / 2;

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="whiteCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f8fafc"/>
          </linearGradient>
          <linearGradient id="goldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="50%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>

        <!-- White Card Base -->
        <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="url(#whiteCardGrad)" stroke="#e2e8f0" stroke-width="2.5"/>

        <!-- Subtle Inner Platinum Border -->
        <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="${R - 8}" fill="none" stroke="#f1f5f9" stroke-width="1.5"/>

        <!-- TOP HEADER BAR: CORNER NUMBER + GOOGLE REVIEW PILL + NFC WAVE -->
        <!-- 1. Corner Serial Badge (Top-Left) -->
        <g transform="translate(46, 48)">
          <rect x="0" y="0" width="86" height="40" rx="12" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/>
          <text x="43" y="26" font-family="monospace, 'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">${cornerNumber}</text>
        </g>

        <!-- 2. Google Review Emblem Pill -->
        <g transform="translate(142, 48)">
          <rect x="0" y="0" width="126" height="40" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2"/>
          <g transform="translate(10, 7) scale(0.85)">${ICONS.googleG}</g>
          <text x="44" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="700" fill="#0f172a" letter-spacing="1">REVIEW</text>
        </g>

        <!-- 3. Top Right: NFC Contactless Wave Indicator -->
        <g transform="translate(${W - 96}, 46)">
          <g transform="scale(1.5)">
            ${ICONS.nfcWave("#0f172a")}
          </g>
          <text x="-8" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="10" font-weight="800" fill="#64748b" letter-spacing="1.5">TAP HERE</text>
        </g>

        <!-- Business Name -->
        <text x="${W / 2}" y="152" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif" font-size="32" font-weight="800" fill="#0f172a" text-anchor="middle" letter-spacing="-0.3">${safeTitle}</text>

        <!-- Google 5-Star Rating Element -->
        <g transform="translate(${W / 2 - 68}, 175) scale(1.05)">
          ${ICONS.fiveStars}
        </g>

        <!-- Subtitle Callout -->
        <text x="${W / 2}" y="235" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="3.5">${isConnect ? "TAP PHONE OR SCAN QR TO CONNECT" : "LEAVE US A GOOGLE REVIEW"}</text>

        <!-- HERO ELEMENT: CLEAN CERAMIC QR CODE TILE -->
        <g filter="drop-shadow(0 10px 18px rgba(0,0,0,0.08))">
          <rect x="${qrBoxX}" y="${qrBoxY}" width="${qrBoxSize}" height="${qrBoxSize}" rx="26" fill="#ffffff" stroke="url(#goldBorderGrad)" stroke-width="4.5"/>
          ${generateQrPath(qrValue, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, "#0f172a")}
        </g>

        <!-- Action Capsule Pill Below QR -->
        <g transform="translate(${W / 2 - 130}, 652)">
          <rect x="0" y="0" width="260" height="38" rx="19" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2"/>
          <circle cx="22" cy="19" r="6" fill="#16a34a" />
          <text x="140" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="800" fill="#0f172a" text-anchor="middle" letter-spacing="2">1-TAP NFC  •  SCAN CAMERA</text>
        </g>

        <!-- MULTI-LINK SOCIAL PILLS OR WARM PROMPT -->
        ${
          isConnect
            ? `
            <g transform="translate(${W / 2}, 740)">
              <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="2">CONNECT WITH US ON</text>
              
              <g transform="translate(-105, 16)">
                <!-- Google -->
                <circle cx="25" cy="25" r="22" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
                <g transform="translate(15, 15) scale(0.85)">${ICONS.googleG}</g>

                <!-- Instagram -->
                <circle cx="80" cy="25" r="22" fill="${hasInsta ? "#833ab4" : "#f1f5f9"}" stroke="${hasInsta ? "#e1306c" : "#e2e8f0"}" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
                <g transform="translate(68, 13) scale(0.9)">${ICONS.instagram}</g>

                <!-- WhatsApp -->
                <circle cx="135" cy="25" r="22" fill="${hasWa ? "#16a34a" : "#f1f5f9"}" stroke="${hasWa ? "#22c55e" : "#e2e8f0"}" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
                <g transform="translate(123, 13) scale(0.9)">${ICONS.whatsapp}</g>

                <!-- Facebook -->
                <circle cx="190" cy="25" r="22" fill="${hasFb ? "#1d4ed8" : "#f1f5f9"}" stroke="${hasFb ? "#3b82f6" : "#e2e8f0"}" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
                <g transform="translate(180, 15) scale(0.85)">${ICONS.facebook}</g>
              </g>
            </g>
            `
            : `
            <g transform="translate(${W / 2}, 745)">
              <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="15" font-weight="600" fill="#0f172a" text-anchor="middle">Your reviews tell us what matters to you.</text>
              <text x="0" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="400" fill="#64748b" text-anchor="middle">We are proud and grateful to serve you.</text>
            </g>
            `
        }

        <!-- Bottom Footer with Card ID & Micro Tag -->
        <g transform="translate(${W / 2}, 915)">
          <rect x="-85" y="-18" width="170" height="34" rx="17" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2"/>
          <text x="0" y="4" font-family="monospace, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#334155" text-anchor="middle" letter-spacing="2">${safeCardId}</text>
          <text x="0" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="10" font-weight="800" fill="#94a3b8" text-anchor="middle" letter-spacing="3.5">SMART NFC &bull; ZERO APP NEEDED</text>
        </g>
      </svg>`;
    }

    // -----------------------------------------------------------------------
    // THEME 3: SUNSET SPLIT (Photo 1 Aesthetic, COMPLETE SINGLE-SIDED)
    // -----------------------------------------------------------------------
    if (theme === "sunset-split") {
      const qrSizeSplit = 270;
      const qrXSplit = 65;
      const qrYSplit = 430;

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <!-- White Card Base -->
        <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5"/>

        <!-- Warm Amber-Yellow Asymmetric Curved Pillar on the Right -->
        <path d="M 450 2 C 430 300, 475 700, 450 1010 L ${W - 2} 1010 L ${W - 2} 2 Z" fill="#f59e0b" />

        <!-- Corner Serial Badge (Top-Left) -->
        <g transform="translate(65, 46)">
          <rect x="0" y="0" width="86" height="38" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
          <text x="43" y="25" font-family="monospace, 'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="900" fill="#92400e" text-anchor="middle" letter-spacing="1">${cornerNumber}</text>
        </g>

        <!-- LEFT SECTION: Editorial Typography & Business Name -->
        <g transform="translate(65, 120)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Playfair Display', Georgia, serif" font-size="44" font-weight="800" fill="#0f172a">Tap</text>
          <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Playfair Display', Georgia, serif" font-size="44" font-weight="800" fill="#0f172a">or</text>
          <text x="0" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Playfair Display', Georgia, serif" font-size="44" font-weight="800" fill="#0f172a">Scan</text>
          <text x="0" y="128" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="600" fill="#475569">to connect with us!</text>
        </g>

        <!-- Business Name & 5 Gold Stars -->
        <text x="65" y="300" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif" font-size="24" font-weight="800" fill="#0f172a">${safeTitle}</text>
        <g transform="translate(65, 320) scale(0.85)">
          ${ICONS.fiveStars}
        </g>

        <!-- Subtitle instruction -->
        <text x="65" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="700" fill="#64748b" letter-spacing="1">OR SCAN CAMERA DIRECTLY</text>

        <!-- SINGLE-SIDED INTEGRATED QR CODE TILE -->
        <g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.06))">
          <rect x="${qrXSplit - 12}" y="${qrYSplit - 12}" width="${qrSizeSplit + 24}" height="${qrSizeSplit + 24}" rx="18" fill="#ffffff" stroke="#f59e0b" stroke-width="4"/>
          ${generateQrPath(qrValue, qrXSplit, qrYSplit, qrSizeSplit, qrSizeSplit, "#0f172a")}
        </g>

        <!-- Left Bottom: NFC Tap Area -->
        <g transform="translate(65, 780)">
          <g transform="scale(1.4)">${ICONS.nfcWave("#0f172a")}</g>
          <text x="44" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="13" font-weight="800" fill="#0f172a" letter-spacing="1">NFC TAP HERE</text>
          <text x="44" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="500" fill="#64748b">Hold phone over card</text>
          
          <!-- Card ID -->
          <text x="0" y="85" font-family="monospace, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#94a3b8" letter-spacing="2">${safeCardId}</text>
        </g>

        <!-- RIGHT AMBER PILLAR: STACKED SOCIAL ICONS -->
        <g transform="translate(535, 140)">
          <!-- Google G -->
          <circle cx="0" cy="0" r="30" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"/>
          <g transform="translate(-13, -13) scale(1.1)">${ICONS.googleG}</g>

          <!-- Instagram -->
          <circle cx="0" cy="115" r="30" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"/>
          <g transform="translate(-16, 99) scale(1.1)">
            <rect x="3" y="3" width="22" height="22" rx="6" fill="#e1306c"/>
            ${ICONS.instagram}
          </g>

          <!-- WhatsApp -->
          <circle cx="0" cy="230" r="30" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"/>
          <g transform="translate(-16, 214) scale(1.1)">
            <rect x="2" y="2" width="24" height="24" rx="12" fill="#25D366"/>
            ${ICONS.whatsapp}
          </g>

          <!-- Facebook -->
          <circle cx="0" cy="345" r="30" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"/>
          <g transform="translate(-16, 329) scale(1.1)">
            <rect x="2" y="2" width="24" height="24" rx="12" fill="#1877F2"/>
            ${ICONS.facebook}
          </g>
        </g>
      </svg>`;
    }
  }

  // =========================================================================
  // 2. FORMAT: COUNTERTOP STAND / TABLE PLAQUE (Square 1000 x 1000 px)
  // Inspired by Photo 4 & Photo 5: Dual "TAP PHONE" and "SCAN CODE" zones
  // =========================================================================
  const SW = 1000;
  const SH = 1000;
  const SR = 44;

  const qrSizeStand = 280;
  const qrXStand = 590;
  const qrYStand = 450;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}">
    <defs>
      <radialGradient id="standBg" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#181c24"/>
        <stop offset="100%" stop-color="#0a0c10"/>
      </radialGradient>
      <linearGradient id="rainbowBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4285F4"/>
        <stop offset="33%" stop-color="#EA4335"/>
        <stop offset="66%" stop-color="#FBBC05"/>
        <stop offset="100%" stop-color="#34A853"/>
      </linearGradient>
    </defs>

    <!-- Stand Plaque Outer Base -->
    <rect x="4" y="4" width="${SW - 8}" height="${SH - 8}" rx="${SR}" fill="url(#standBg)" stroke="#2d3340" stroke-width="4"/>

    <!-- Prominent Corner Serial Badge (Top-Left) -->
    <g transform="translate(60, 60)">
      <rect x="0" y="0" width="120" height="52" rx="16" fill="#14171f" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="60" y="34" font-family="monospace, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">${cornerNumber}</text>
    </g>

    <!-- Header: Official Google G Logo & Title -->
    <g transform="translate(${SW / 2 - 38}, 80) scale(2.8)">
      ${ICONS.googleG}
    </g>

    <!-- 5 Golden Stars -->
    <g transform="translate(${SW / 2 - 85}, 180) scale(1.3)">
      ${ICONS.fiveStars}
    </g>

    <!-- Header Catchline (Photo 5) -->
    <text x="${SW / 2}" y="255" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">Your Feedback Matters to us!</text>
    <text x="${SW / 2}" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="20" font-weight="700" fill="#94a3b8" text-anchor="middle">${safeTitle}</text>

    <!-- DUAL ACTION BOXES (Photo 5 Exact Design) -->

    <!-- BOX 1 (LEFT): TAP PHONE -->
    <g transform="translate(80, 360)">
      <rect x="0" y="0" width="380" height="480" rx="28" fill="#14171f" stroke="#334155" stroke-width="2.5"/>
      <text x="190" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="2">TAP PHONE</text>
      
      <!-- Phone & NFC Radiating Waves Graphic -->
      <g transform="translate(142, 120) scale(1.4)">
        ${ICONS.nfcPhoneHand("#38bdf8")}
      </g>

      <text x="190" y="350" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="20" font-weight="800" fill="#ffffff" text-anchor="middle">NFC INSTANT</text>
      <text x="190" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="500" fill="#94a3b8" text-anchor="middle">Hold phone near stand</text>
      <text x="190" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="700" fill="#38bdf8" text-anchor="middle" letter-spacing="1">ZERO APP NEEDED</text>
    </g>

    <!-- BOX 2 (RIGHT): SCAN CODE -->
    <g transform="translate(540, 360)">
      <rect x="0" y="0" width="380" height="480" rx="28" fill="#14171f" stroke="#334155" stroke-width="2.5"/>
      <text x="190" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="2">SCAN CODE</text>

      <!-- QR Box with Google Rainbow Border -->
      <rect x="35" y="75" width="310" height="310" rx="22" fill="#ffffff" stroke="url(#rainbowBorder)" stroke-width="5"/>
      ${generateQrPath(qrValue, qrXStand, qrYStand, qrSizeStand, qrSizeStand, "#0f172a")}

      <!-- Stand Code Underneath -->
      <text x="190" y="435" font-family="monospace, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="3">${safeCardId}</text>
    </g>

    <!-- Footer Tagline -->
    <text x="${SW / 2}" y="925" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="3">POWERED BY TAPFORM SMART NFC &bull; COUNTERTOP ACRYLIC STAND</text>
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
 * Infinite resolution, scales to any size cleanly.
 */
export function downloadCardSvg(options, filename = "nfc-card-vector") {
  const svgString = generateCardSvgString(options);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  triggerDownloadBlob(blob, `${filename}.svg`);
  return { success: true, filename: `${filename}.svg` };
}

/**
 * 2. DOWNLOAD AS 300 DPI HIGH-RESOLUTION PRINT PNG
 * Renders vector SVG to high-res canvas (e.g. 2400 x 3600 px) for thermal printers & UV printing
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
 * Includes CorelDRAW import instructions for print vendors (Ctrl + I)
 */
export function downloadCardCorelDraw(options, filename = "nfc-card-coreldraw") {
  const svgString = generateCardSvgString(options);
  const cdrHeader = `<!-- 
  =============================================================================
  CORELDRAW 100% VECTOR PRINT READY SPECIFICATION
  Vendor Instruction: In CorelDRAW, press Ctrl + I (File > Import)
  All text, QR codes, icons and curves are mathematical vectors.
  Aspect Ratio: ${options.format === "table-stand" ? "100mm x 100mm (Square Stand)" : "85.6mm x 54mm (CR80 Standard NFC Card, Single-Sided)"}
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
 * 4. DIRECT BROWSER PRINT (`window.print()`) WITH EXACT MM DIMENSIONS
 */
export function printCardElement(svgElementId, format = "nfc-card") {
  const el = document.getElementById(svgElementId);
  if (!el) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const isStand = format === "table-stand";
  const cssSize = isStand ? "100mm 100mm" : "54mm 85.6mm";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Card - Tapform</title>
      <style>
        @page {
          size: ${cssSize};
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }
        svg {
          width: 100vw;
          height: 100vh;
          display: block;
        }
      </style>
    </head>
    <body>
      ${el.outerHTML}
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
