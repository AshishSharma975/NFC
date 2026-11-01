import QRCode from "qrcode";

/**
 * PRODUCTION-GRADE VECTOR CARD & STAND SVG GENERATOR
 * Inspired by modern minimal NFC cards & countertop acrylic stands:
 * - Matte Black Luxury (Google 4-color, gold stars, rainbow QR border)
 * - Porcelain Minimalist White (Warm amber-yellow curved stripe, vertical social badges)
 * - Countertop Acrylic Stand (Dual Tap Phone & Scan QR zones)
 * 
 * Scalability:
 * 100% pure SVG mathematical vector paths. Scales from 1-inch keychain to 10-foot billboard
 * with zero blur or quality loss.
 */

// Helper to generate pure SVG path string for QR code modules
export function generateQrPath(text, x, y, width, height, fill = "#ffffff") {
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
  nfcPhoneHand: (color = "#ffffff") => `
    <g stroke="${color}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Phone outline -->
      <rect x="25" y="10" width="46" height="78" rx="8" />
      <line x1="42" y1="18" x2="54" y2="18" />
      <circle cx="48" cy="78" r="3" fill="${color}" />
      <!-- Radiating NFC waves -->
      <path d="M12 36a22 22 0 0 0 0 26" />
      <path d="M17 41a15 15 0 0 0 0 16" />
      <!-- Hand holding phone -->
      <path d="M68 56l14 8a6 6 0 0 1 3 5v18H58" />
    </g>
  `,
  fiveStars: `
    <g fill="#FBBC04" transform="scale(1.1)">
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
 * GENERATE SVG STRING
 * @param {Object} options
 * @param {'nfc-card' | 'table-stand'} options.format - Card vs Countertop stand
 * @param {'matte-black' | 'minimal-white' | 'table-stand'} options.theme - Design aesthetic
 * @param {'front' | 'back' | 'stand'} options.side - Side to render
 * @param {'review' | 'connect'} options.cardType - Review card vs Multi-link connect card
 * @param {string} options.title - Shop or business name
 * @param {string} options.cardId - Card ID (e.g. TF-01100)
 * @param {string} options.qrValue - Redirect URL encoded in QR code
 * @param {Object} options.socialLinks - { instagram, whatsapp, facebook }
 */
export function generateCardSvgString({
  format = "nfc-card",
  theme = "matte-black",
  side = "front",
  cardType = "review",
  title = "Our Business",
  cardId = "TF-01100",
  qrValue = "https://tapform.me/c/TF-01100",
  socialLinks = {},
}) {
  const safeTitle = escapeXml(title || "Your Business Name");
  const safeCardId = escapeXml(cardId || "TF-01100");
  const isConnect = cardType === "connect";

  // Active social platforms
  const hasInsta = Boolean(socialLinks?.instagram);
  const hasWa = Boolean(socialLinks?.whatsapp);
  const hasFb = Boolean(socialLinks?.facebook);

  // =========================================================================
  // 1. FORMAT: NFC POCKET CARD (CR80 RATIO: 638 x 1012 px Vertical)
  // =========================================================================
  if (format === "nfc-card") {
    const W = 638;
    const H = 1012;
    const R = 36; // Card corner radius

    // -----------------------------------------------------------------------
    // THEME A: MATTE BLACK LUXURY (Photo 3 & Photo 5 aesthetic)
    // -----------------------------------------------------------------------
    if (theme === "matte-black") {
      if (side === "front") {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
          <defs>
            <radialGradient id="cardGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#1e222b"/>
              <stop offset="100%" stop-color="#0a0c10"/>
            </radialGradient>
            <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fbbf24"/>
              <stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
          </defs>

          <!-- Card Base with Hairline Border -->
          <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="url(#cardGlow)" stroke="#262b36" stroke-width="3"/>

          <!-- Top Header: NFC Contactless Waves -->
          <g transform="translate(${W - 90}, 50) scale(1.6)">
            ${ICONS.nfcWave("#ffffff")}
          </g>

          <!-- Central Branding: Authentic Google G Logo -->
          <g transform="translate(${W / 2 - 58}, 280) scale(4)">
            ${ICONS.googleG}
          </g>

          <!-- Golden 5 Stars -->
          <g transform="translate(${W / 2 - 76}, 450) scale(1.1)">
            ${ICONS.fiveStars}
          </g>

          <!-- Business Name -->
          <text x="${W / 2}" y="560" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">${safeTitle}</text>

          <!-- Subtitle / Action Callout -->
          <text x="${W / 2}" y="610" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="19" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="3">${isConnect ? "TAP OR SCAN TO CONNECT" : "REVIEW US ON GOOGLE"}</text>

          <!-- Multi-Link Social Icon Badges (if Connect Card) -->
          ${
            isConnect
              ? `
              <g transform="translate(${W / 2 - 110}, 690)">
                <!-- Google Badge -->
                <circle cx="30" cy="30" r="26" fill="#1e2430" stroke="#334155" stroke-width="2"/>
                <g transform="translate(18, 18) scale(1.0)">${ICONS.googleG}</g>
                <!-- Instagram Badge -->
                <circle cx="90" cy="30" r="26" fill="${hasInsta ? "#833ab4" : "#1e2430"}" stroke="${hasInsta ? "#e1306c" : "#334155"}" stroke-width="2"/>
                <g transform="translate(76, 16) scale(1.0)">${ICONS.instagram}</g>
                <!-- WhatsApp Badge -->
                <circle cx="150" cy="30" r="26" fill="${hasWa ? "#16a34a" : "#1e2430"}" stroke="${hasWa ? "#22c55e" : "#334155"}" stroke-width="2"/>
                <g transform="translate(136, 16) scale(1.0)">${ICONS.whatsapp}</g>
                <!-- Facebook Badge -->
                <circle cx="210" cy="30" r="26" fill="${hasFb ? "#1d4ed8" : "#1e2430"}" stroke="${hasFb ? "#3b82f6" : "#334155"}" stroke-width="2"/>
                <g transform="translate(198, 18) scale(1.0)">${ICONS.facebook}</g>
              </g>
              `
              : `
              <!-- Micro Text for Review Card -->
              <text x="${W / 2}" y="670" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="500" fill="#64748b" text-anchor="middle">Instant 1-Second Google Review Tap</text>
              `
          }

          <!-- Footer: Brand & Verification -->
          <g transform="translate(${W / 2}, 930)">
            <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="700" fill="#475569" text-anchor="middle" letter-spacing="4">POWERED BY TAPFORM SMART NFC</text>
          </g>
        </svg>`;
      }

      // BACK SIDE: Matte Black Luxury (Google Rainbow Frame QR Code)
      if (side === "back") {
        const qrSize = 380;
        const qrX = (W - qrSize) / 2;
        const qrY = 240;

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
          <defs>
            <radialGradient id="cardGlowBack" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stop-color="#181c24"/>
              <stop offset="100%" stop-color="#0a0c10"/>
            </radialGradient>
            <!-- Google 4-Color Gradient Border for QR Code -->
            <linearGradient id="googleBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4285F4"/>
              <stop offset="33%" stop-color="#EA4335"/>
              <stop offset="66%" stop-color="#FBBC05"/>
              <stop offset="100%" stop-color="#34A853"/>
            </linearGradient>
          </defs>

          <!-- Card Base -->
          <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="url(#cardGlowBack)" stroke="#262b36" stroke-width="3"/>

          <!-- Header Text -->
          <text x="${W / 2}" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="4">${isConnect ? "SCAN QR CODE TO CONNECT" : "REVIEW US ON"}</text>
          <text x="${W / 2}" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle">${isConnect ? safeTitle : "Google Reviews"}</text>

          <!-- Rainbow Gradient Framed QR Card Container -->
          <rect x="${qrX - 20}" y="${qrY - 20}" width="${qrSize + 40}" height="${qrSize + 40}" rx="28" fill="#ffffff" stroke="url(#googleBorder)" stroke-width="6"/>

          <!-- Crisp High-Precision Vector QR Code -->
          ${generateQrPath(qrValue, qrX, qrY, qrSize, qrSize, "#0f172a")}

          <!-- Stand ID Pill Badge -->
          <rect x="${W / 2 - 85}" y="695" width="170" height="42" rx="10" fill="#1e2430" stroke="#334155" stroke-width="1.5"/>
          <text x="${W / 2}" y="722" font-family="monospace, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#e2e8f0" text-anchor="middle" letter-spacing="2">${safeCardId}</text>

          <!-- Warm Customer Prompt Message -->
          <text x="${W / 2}" y="800" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="600" fill="#cbd5e1" text-anchor="middle">Your reviews tell us what matters to you.</text>
          <text x="${W / 2}" y="830" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="400" fill="#64748b" text-anchor="middle">We are proud and grateful to serve you.</text>

          <!-- Footer NFC Hint -->
          <text x="${W / 2}" y="930" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="700" fill="#475569" text-anchor="middle" letter-spacing="3">TAP PHONE OR SCAN CAMERA</text>
        </svg>`;
      }
    }

    // -----------------------------------------------------------------------
    // THEME B: PORCELAIN MINIMALIST WHITE (Photo 1 aesthetic)
    // Warm amber-yellow curved accent strip, column of colorful social icons
    // -----------------------------------------------------------------------
    if (theme === "minimal-white") {
      if (side === "front") {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
          <!-- White Card Base -->
          <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>

          <!-- Warm Amber-Yellow Right Stripe (Photo 1 exact styling) -->
          <path d="M470 2 C 450 300, 490 700, 470 1010 L ${W - 2} 1010 L ${W - 2} 2 Z" fill="#f59e0b" />

          <!-- Left Section: Typography -->
          <text x="65" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Playfair Display', serif" font-size="52" font-weight="800" fill="#0f172a" line-height="1.1">Tap</text>
          <text x="65" y="200" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Playfair Display', serif" font-size="52" font-weight="800" fill="#0f172a">or</text>
          <text x="65" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Playfair Display', serif" font-size="52" font-weight="800" fill="#0f172a">Scan</text>

          <text x="65" y="325" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="22" font-weight="600" fill="#475569">to connect</text>
          <text x="65" y="355" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="22" font-weight="600" fill="#475569">with us!</text>

          <!-- Business Name -->
          <text x="65" y="470" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', sans-serif" font-size="28" font-weight="800" fill="#0f172a">${safeTitle}</text>

          <!-- 5 Golden Stars -->
          <g transform="translate(65, 500) scale(0.95)">
            ${ICONS.fiveStars}
          </g>

          <!-- NFC Tap Zone at Left Bottom -->
          <g transform="translate(65, 830)">
            <g transform="scale(1.3)">${ICONS.nfcWave("#0f172a")}</g>
            <text x="50" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="800" fill="#0f172a" letter-spacing="1">NFC TAP</text>
            <text x="50" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="500" fill="#64748b">Hold phone here</text>
          </g>

          <!-- Right Column on Yellow Band: Social Icon Badges (Photo 1) -->
          <g transform="translate(540, 160)">
            <!-- Google G -->
            <circle cx="0" cy="0" r="32" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
            <g transform="translate(-14, -14) scale(1.2)">${ICONS.googleG}</g>

            <!-- Instagram -->
            <circle cx="0" cy="110" r="32" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
            <g transform="translate(-16, 94) scale(1.1)">
              <rect x="3" y="3" width="22" height="22" rx="6" fill="#e1306c"/>
              ${ICONS.instagram}
            </g>

            <!-- WhatsApp -->
            <circle cx="0" cy="220" r="32" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
            <g transform="translate(-16, 204) scale(1.1)">
              <rect x="2" y="2" width="24" height="24" rx="12" fill="#25D366"/>
              ${ICONS.whatsapp}
            </g>

            <!-- Facebook -->
            <circle cx="0" cy="330" r="32" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
            <g transform="translate(-16, 314) scale(1.1)">
              <rect x="2" y="2" width="24" height="24" rx="12" fill="#1877F2"/>
              ${ICONS.facebook}
            </g>
          </g>
        </svg>`;
      }

      // BACK SIDE: Porcelain Minimalist White
      if (side === "back") {
        const qrSize = 380;
        const qrX = (W - qrSize) / 2;
        const qrY = 240;

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
          <!-- White Card Base -->
          <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${R}" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>

          <!-- Top Section -->
          <text x="${W / 2}" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Playfair Display', serif" font-size="34" font-weight="800" fill="#0f172a" text-anchor="middle">Scan QR</text>
          <text x="${W / 2}" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="500" fill="#64748b" text-anchor="middle">to connect</text>

          <!-- QR Box with Yellow Gold Border (Photo 1 Back side) -->
          <rect x="${qrX - 16}" y="${qrY - 16}" width="${qrSize + 32}" height="${qrSize + 32}" rx="20" fill="#ffffff" stroke="#f59e0b" stroke-width="5"/>

          <!-- Pure Vector QR Code -->
          ${generateQrPath(qrValue, qrX, qrY, qrSize, qrSize, "#0f172a")}

          <!-- Stand ID Underneath -->
          <text x="${W / 2}" y="690" font-family="monospace, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#0f172a" text-anchor="middle" letter-spacing="3">${safeCardId}</text>

          <!-- Store Name & Info -->
          <text x="${W / 2}" y="770" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', sans-serif" font-size="22" font-weight="800" fill="#0f172a" text-anchor="middle">${safeTitle}</text>
          <text x="${W / 2}" y="805" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="500" fill="#64748b" text-anchor="middle">Tap NFC with your phone or scan QR code</text>

          <!-- Footer -->
          <text x="${W / 2}" y="930" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="3">TAPFORM SMART NFC</text>
        </svg>`;
      }
    }
  }

  // =========================================================================
  // 2. FORMAT: COUNTERTOP STAND / TABLE PLAQUE (Square 1000 x 1000 px)
  // Inspired by Photo 4 & Photo 5: Dual "TAP PHONE" and "SCAN CODE" zones
  // =========================================================================
  const SW = 1000;
  const SH = 1000;
  const SR = 44;

  const qrSizeStand = 320;
  const qrXStand = 560;
  const qrYStand = 470;

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

    <!-- Header: Official Google G Logo & Title -->
    <g transform="translate(${SW / 2 - 38}, 80) scale(2.8)">
      ${ICONS.googleG}
    </g>

    <!-- 5 Golden Stars -->
    <g transform="translate(${SW / 2 - 85}, 180) scale(1.3)">
      ${ICONS.fiveStars}
    </g>

    <!-- Header Catchline (Photo 5) -->
    <text x="${SW / 2}" y="255" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">Your Feedback Matters to us!</text>
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
      <rect x="40" y="90" width="300" height="300" rx="20" fill="#ffffff" stroke="url(#rainbowBorder)" stroke-width="5"/>
      ${generateQrPath(qrValue, 560, 470, 260, 260, "#0f172a")}

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

        // High quality smoothing
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
 * Includes CorelDRAW import instructions for Indian & global print vendors (Ctrl + I)
 */
export function downloadCardCorelDraw(options, filename = "nfc-card-coreldraw") {
  const svgString = generateCardSvgString(options);
  const cdrHeader = `<!-- 
  =============================================================================
  CORELDRAW 100% VECTOR PRINT READY SPECIFICATION
  Vendor Instruction: In CorelDRAW, press Ctrl + I (File > Import)
  All text, QR codes, icons and curves are mathematical vectors.
  Aspect Ratio: ${options.format === "table-stand" ? "100mm x 100mm (Square Stand)" : "85.6mm x 54mm (CR80 Standard NFC Card)"}
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
