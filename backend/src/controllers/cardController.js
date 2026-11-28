import { Card } from "../models/Card.js";
import {
  isValidCardId,
  isValidHttpUrl,
  normalizeCardId,
} from "../utils/validators.js";
import { resolveGoogleMapsUrl } from "../utils/urlResolver.js";
import Razorpay from "razorpay";
import crypto from "crypto";

import os from "os";

// Initialize Razorpay client with safe fallback
let razorpayInstance = null;
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_U5V3ADmxw4zMX7";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "NHVELcdWvTrEMLxwAqckZ0Bk";
  if (!razorpayInstance && key_id && key_secret) {
    try {
      razorpayInstance = new Razorpay({ key_id, key_secret });
    } catch (e) {
      console.error("Failed to initialize Razorpay:", e);
    }
  }
  return razorpayInstance;
}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

function getBaseUrl(req) {
  // If explicitly configured with a custom domain (non-localhost), prioritize it
  if (
    process.env.BASE_URL &&
    process.env.BASE_URL.trim() &&
    !process.env.BASE_URL.includes("localhost")
  ) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }

  // Deduce dynamically from incoming request headers (works seamlessly on Render, Railway, VPS, Cloudflare tunnel)
  if (req) {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host");
    if (host) {
      return `${protocol}://${host}`;
    }
  }

  if (process.env.BASE_URL && process.env.BASE_URL.trim()) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }

  const port = process.env.PORT || 5000;
  const localIp = getLocalIp();
  return `http://${localIp}:${port}`;
}

function formatCardResponse(card, baseUrl) {
  const json = card.toJSON ? card.toJSON() : card;
  return {
    ...json,
    qrUrl: `${baseUrl}/c/${card.cardId}`,
    redirectPath: `/c/${card.cardId}`,
  };
}

// High-speed In-Memory Cache for customer taps (delivers sub-1ms instant redirects with 0 DB queries)
const scanCache = new Map();
const SCAN_CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function invalidateScanCache(cardId) {
  if (!cardId) {
    scanCache.clear();
    return;
  }
  scanCache.delete(normalizeCardId(cardId));
}

function setScanCacheEntry(cardId, data) {
  // Cap memory size to 10,000 entries so Node.js RAM stays tiny (< 20MB)
  if (scanCache.size > 10000) {
    const oldestKey = scanCache.keys().next().value;
    scanCache.delete(oldestKey);
  }
  scanCache.set(cardId, {
    ...data,
    cachedAt: Date.now(),
  });
}

function renderRedirectHtml(targetUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <title>Opening Location...</title>
  <script>
    window.location.replace(${JSON.stringify(targetUrl)});
  </script>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #fafaf7;
      font-family: -apple-system, BlinkMacSystemFont, "DM Sans", sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .box {
      background: #ffffff;
      border: 1px solid #e7e8e0;
      border-radius: 16px;
      padding: 32px 24px;
      text-align: center;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .spin {
      width: 38px;
      height: 38px;
      border: 3px solid #e7e8e0;
      border-top-color: #16a34a;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h3 { margin: 0 0 6px; font-size: 17px; color: #202720; font-weight: 700; }
    p { margin: 0; font-size: 13px; color: #7b8178; }
    a {
      display: inline-block;
      margin-top: 18px;
      color: #16a34a;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      padding: 8px 16px;
      background: #f0fdf4;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="spin"></div>
    <h3>Opening in Google Maps...</h3>
    <p>Stand destination par redirect ho rahe hain...</p>
    <a href="${targetUrl}">Yahan click karein agar redirect na ho &rarr;</a>
  </div>
</body>
</html>`;
}
 
function normalizeSocialLinks(links = {}) {
  const normalized = {
    instagram: "",
    whatsapp: "",
    facebook: "",
    website: "",
    upiId: "",
    upiName: "",
  };

  if (!links || typeof links !== "object") return normalized;

  if (links.instagram && typeof links.instagram === "string") {
    let insta = links.instagram.trim();
    if (insta) {
      if (insta.startsWith("@")) insta = insta.substring(1);
      if (!insta.startsWith("http://") && !insta.startsWith("https://")) {
        insta = `https://instagram.com/${insta}`;
      }
      normalized.instagram = insta;
    }
  }

  if (links.whatsapp && typeof links.whatsapp === "string") {
    let wa = links.whatsapp.trim();
    if (wa) {
      if (!wa.startsWith("http://") && !wa.startsWith("https://")) {
        const cleanNumber = wa.replace(/[^0-9]/g, "");
        wa = `https://wa.me/${cleanNumber}`;
      }
      normalized.whatsapp = wa;
    }
  }

  if (links.facebook && typeof links.facebook === "string") {
    let fb = links.facebook.trim();
    if (fb) {
      if (!fb.startsWith("http://") && !fb.startsWith("https://")) {
        fb = `https://facebook.com/${fb}`;
      }
      normalized.facebook = fb;
    }
  }

  if (links.website && typeof links.website === "string") {
    let web = links.website.trim();
    if (web) {
      if (!web.startsWith("http://") && !web.startsWith("https://")) {
        web = `https://${web}`;
      }
      normalized.website = web;
    }
  }

  if (links.upiId && typeof links.upiId === "string") {
    normalized.upiId = links.upiId.trim();
  }

  if (links.upiName && typeof links.upiName === "string") {
    normalized.upiName = links.upiName.trim();
  }

  return normalized;
}

function renderConnectProfileHtml({ cardId, title, destinationUrl, socialLinks = {}, baseUrl }) {
  const shopName = title && title.trim() ? title.trim() : "Our Business & Store";
  const initial = shopName.charAt(0).toUpperCase();

  const linksHtml = [];

  // 1. Google Review & Maps (Hero Premium Card)
  linksHtml.push(`
    <a href="${destinationUrl}" target="_blank" rel="noopener noreferrer" class="link-card hero-review-card">
      <div class="card-left-group">
        <div class="brand-square google-brand-square">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-top-pill">
            <span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span class="rating-text">RECOMMENDED</span>
          </div>
          <strong class="card-main-title">Write a Google Review</strong>
          <span class="card-secondary-desc">Rate location &amp; experience</span>
        </div>
      </div>
      <div class="chevron-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    </a>
  `);

  // 2. Direct Pay to Shop (Minimal Slate/Teal Accent)
  const upiId = (socialLinks.upiId || "").trim();
  const upiPayee = (socialLinks.upiName || shopName || "Shop Payment").trim();
  const upiPayLink = upiId 
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayee)}&cu=INR`
    : "";

  linksHtml.push(`
    <div class="link-card pay-action-card" id="openPayModalBtn">
      <div class="card-left-group">
        <div class="brand-square pay-brand-square">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="3"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
            <path d="M6 15h2"></path>
            <path d="M10 15h4"></path>
          </svg>
        </div>
        <div class="card-info">
          <span class="tag-label text-cyan">INSTANT 0% UPI</span>
          <strong class="card-main-title">Pay Shop &bull; PhonePe / GPay / Paytm</strong>
          <span class="card-secondary-desc">Direct bank transfer &bull; Any amount</span>
        </div>
      </div>
      <div class="chevron-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    </div>
  `);

  // 3. Instagram
  if (socialLinks.instagram) {
    linksHtml.push(`
      <a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer" class="link-card minimal-card">
        <div class="card-left-group">
          <div class="brand-square insta-brand-square">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <div class="card-info">
            <strong class="card-main-title">Instagram Profile</strong>
            <span class="card-secondary-desc">Photos, reels &amp; updates</span>
          </div>
        </div>
        <div class="chevron-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </a>
    `);
  }

  // 4. WhatsApp Business
  if (socialLinks.whatsapp) {
    linksHtml.push(`
      <a href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer" class="link-card minimal-card">
        <div class="card-left-group">
          <div class="brand-square wa-brand-square">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#10b981">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
            </svg>
          </div>
          <div class="card-info">
            <strong class="card-main-title">WhatsApp Chat</strong>
            <span class="card-secondary-desc">Quick inquiries &amp; support</span>
          </div>
        </div>
        <div class="chevron-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </a>
    `);
  }

  // 5. Official Website
  if (socialLinks.website) {
    linksHtml.push(`
      <a href="${socialLinks.website}" target="_blank" rel="noopener noreferrer" class="link-card minimal-card">
        <div class="card-left-group">
          <div class="brand-square web-brand-square">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div class="card-info">
            <strong class="card-main-title">Visit Official Website</strong>
            <span class="card-secondary-desc">Catalog, products &amp; details</span>
          </div>
        </div>
        <div class="chevron-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </a>
    `);
  }

  // 6. Facebook
  if (socialLinks.facebook) {
    linksHtml.push(`
      <a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" class="link-card minimal-card">
        <div class="card-left-group">
          <div class="brand-square fb-brand-square">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#3b82f6">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div class="card-info">
            <strong class="card-main-title">Facebook Page</strong>
            <span class="card-secondary-desc">Community &amp; updates</span>
          </div>
        </div>
        <div class="chevron-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </a>
    `);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${shopName} — Connect & Reviews</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      background: #090b10;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Inter", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 18px 56px;
      -webkit-font-smoothing: antialiased;
    }
    .profile-container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .avatar-wrapper {
      position: relative;
      margin-bottom: 16px;
    }
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 24px;
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 800;
      color: #38bdf8;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
    }
    .nfc-badge {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: #0284c7;
      color: #ffffff;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      border: 3px solid #090b10;
    }
    .shop-title {
      font-size: 24px;
      font-weight: 800;
      text-align: center;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    .shop-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 28px;
    }
    .shop-pill strong { color: #f59e0b; }
    .links-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    /* Sleek Apple / Cred Style Link Cards */
    .link-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px;
      border-radius: 18px;
      text-decoration: none;
      color: inherit;
      background: rgba(18, 22, 31, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.07);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .link-card:active {
      transform: scale(0.98);
      background: rgba(26, 32, 45, 0.85);
    }
    
    /* Hero Google Review Card: Subtle Royal Blue / Gold Accent */
    .hero-review-card {
      background: linear-gradient(135deg, rgba(30, 58, 138, 0.25), rgba(15, 23, 42, 0.75));
      border: 1.5px solid rgba(96, 165, 250, 0.35);
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.12);
    }
    .hero-review-card:active {
      border-color: rgba(96, 165, 250, 0.6);
    }
    
    /* Pay Action Card: Subtle Emerald Glow */
    .pay-action-card {
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.25), rgba(15, 23, 42, 0.75));
      border: 1.5px solid rgba(16, 185, 129, 0.35);
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.12);
    }

    .card-left-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-square {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #151b26;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .card-info {
      display: flex;
      flex-direction: column;
    }
    .card-top-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }
    .rating-stars {
      color: #fbbf24;
      font-size: 11px;
      letter-spacing: 1px;
    }
    .rating-text {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #60a5fa;
    }
    .tag-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }
    .text-cyan { color: #38bdf8; }
    .card-main-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.01em;
    }
    .card-secondary-desc {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .chevron-icon {
      color: #64748b;
      padding-left: 8px;
    }

    .footer-meta {
      margin-top: 40px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .meta-id {
      font-size: 11px;
      letter-spacing: 0.08em;
      color: #64748b;
      font-family: monospace;
      background: rgba(255, 255, 255, 0.04);
      padding: 4px 12px;
      border-radius: 6px;
    }
    .meta-powered {
      font-size: 11px;
      color: #475569;
    }

    /* Modal Overlay */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(4, 6, 10, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 1000;
      align-items: flex-end;
      justify-content: center;
      transition: opacity 0.25s ease;
    }
    .modal-overlay.active {
      display: flex;
    }
    .modal-sheet {
      width: 100%;
      max-width: 440px;
      background: #0f131a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-top-left-radius: 28px;
      border-top-right-radius: 28px;
      padding: 24px 22px 36px;
      box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.8);
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .sheet-handle {
      width: 36px;
      height: 4px;
      background: #334155;
      border-radius: 2px;
      margin: 0 auto 18px;
    }
    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .sheet-title {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sheet-close {
      background: #1e2533;
      border: none;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .sheet-close:hover { background: #334155; color: #fff; }
    .amt-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 8px;
      display: block;
    }
    .amt-input-wrap {
      position: relative;
      margin-bottom: 12px;
    }
    .amt-symbol {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      font-weight: 700;
      color: #38bdf8;
    }
    .amt-input {
      width: 100%;
      padding: 14px 16px 14px 42px;
      font-size: 26px;
      font-weight: 800;
      background: #090c12;
      border: 1.5px solid #1e293b;
      border-radius: 16px;
      color: #ffffff;
      outline: none;
      box-sizing: border-box;
      transition: all 0.2s;
    }
    .amt-input:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
    }
    .amt-presets {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 18px;
    }
    .preset-btn {
      padding: 10px;
      border-radius: 12px;
      background: #151b26;
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }
    .preset-btn:hover, .preset-btn:active {
      background: #1e293b;
      border-color: #38bdf8;
      color: #38bdf8;
    }
    .pay-submit-btn {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 14px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .pay-submit-btn:active {
      transform: scale(0.98);
    }
    .secure-note {
      font-size: 11px;
      color: #64748b;
      text-align: center;
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
  </style>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
  <div class="profile-container">
    <div class="avatar-wrapper">
      <div class="avatar">${initial}</div>
      <div class="nfc-badge">&#9889;</div>
    </div>
    <h1 class="shop-title">${shopName}</h1>
    <div class="shop-pill">
      <span>Official Stand</span> &bull; <strong>&#11088;&#11088;&#11088;&#11088;&#11088; Verified</strong>
    </div>

    <div class="links-list">
      ${linksHtml.join("\n")}
    </div>

    <div class="footer-meta">
      <span class="meta-id">STAND ID: ${cardId}</span>
      <span class="meta-powered">Tapform Smart NFC &bull; Direct Touch</span>
    </div>
  </div>

  <!-- Instant Pay Bottom Sheet Modal -->
  <div class="modal-overlay" id="payModalOverlay">
    <div class="modal-sheet" id="payModalSheet">
      <div class="sheet-handle"></div>
      
      <!-- Normal Payment Options View -->
      <div id="paymentFormView">
        <div class="sheet-header">
          <div class="sheet-title">
            <span>&#128179; Pay ${shopName}</span>
          </div>
          <button class="sheet-close" id="closePayModalBtn" aria-label="Close">&times;</button>
        </div>

        <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.18); border-radius: 14px; padding: 12px 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; font-size: 13px;">⚡</div>
            <div>
              <span style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; text-transform: uppercase; letter-spacing: 0.5px;">Payee VPA</span>
              <strong style="font-size: 13px; color: #ffffff; font-family: monospace;">${upiId || "Configured Store UPI"}</strong>
            </div>
          </div>
          <span style="font-size: 10px; font-weight: 800; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 3px 8px; border-radius: 6px;">0% FEE</span>
        </div>

        <label class="amt-label" for="customAmountInput">Amount to Pay</label>
        <div class="amt-input-wrap">
          <span class="amt-symbol">&#8377;</span>
          <input type="number" id="customAmountInput" class="amt-input" placeholder="0" min="1" step="1" inputmode="numeric" />
        </div>

        <div class="amt-presets">
          <button type="button" class="preset-btn" onclick="setPresetAmt(50)">&#8377;50</button>
          <button type="button" class="preset-btn" onclick="setPresetAmt(100)">&#8377;100</button>
          <button type="button" class="preset-btn" onclick="setPresetAmt(250)">&#8377;250</button>
          <button type="button" class="preset-btn" onclick="setPresetAmt(500)">&#8377;500</button>
        </div>

        <!-- Real Live UPI QR for Laptop / Desktop Scanner (Clean Card Style) -->
        <div id="laptopQrBox" style="background: #ffffff; border-radius: 18px; padding: 16px; margin-bottom: 16px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.25);">
          <span style="font-size: 11px; font-weight: 800; color: #475569; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 10px;">
            Scan with any UPI app to pay
          </span>
          <img id="dynamicUpiQrImg" src="" alt="Live Shop UPI QR" style="width: 176px; height: 176px; border-radius: 12px; display: block;" />
          <span id="qrAmtText" style="font-size: 13px; font-weight: 800; color: #0284c7; margin-top: 10px;">Instant Direct Transfer</span>
        </div>

        <!-- Sleek Unified App Launcher Strip -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" class="pay-submit-btn" onclick="triggerUpiApp('phonepe')" style="background: #1e2230; border: 1px solid rgba(255,255,255,0.08); padding: 12px; color: #e2e8f0; font-size: 13px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#8b5cf6; display:inline-block; margin-right:4px;"></span> PhonePe
            </button>
            <button type="button" class="pay-submit-btn" onclick="triggerUpiApp('gpay')" style="background: #1e2230; border: 1px solid rgba(255,255,255,0.08); padding: 12px; color: #e2e8f0; font-size: 13px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#3b82f6; display:inline-block; margin-right:4px;"></span> Google Pay
            </button>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" class="pay-submit-btn" onclick="triggerUpiApp('paytm')" style="background: #1e2230; border: 1px solid rgba(255,255,255,0.08); padding: 12px; color: #e2e8f0; font-size: 13px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#00b9f1; display:inline-block; margin-right:4px;"></span> Paytm
            </button>
            <button type="button" class="pay-submit-btn" onclick="triggerUpiApp('default')" style="background: #1e2230; border: 1px solid rgba(255,255,255,0.08); padding: 12px; color: #e2e8f0; font-size: 13px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block; margin-right:4px;"></span> Slice / Other
            </button>
          </div>
        </div>

        <!-- Option 2: Fallback Online Cards / Netbanking Gateway -->
        <button type="button" class="pay-submit-btn" id="payWithRazorpayBtn" style="background: transparent; border: 1px dashed rgba(255,255,255,0.12); font-size: 12px; padding: 10px; color: #64748b;">
          <span>Credit/Debit Card or NetBanking</span>
        </button>

        <div class="secure-note">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          <span>Instant UPI &bull; Direct Bank Settlement &bull; 0% Fee</span>
        </div>
      </div>

      <!-- Professional Animated Payment Success View -->
      <div id="paymentSuccessView" style="display: none; text-align: center; padding: 20px 10px 10px;">
        <div style="width: 76px; height: 76px; border-radius: 50%; background: #10b981; color: #ffffff; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; font-size: 38px; box-shadow: 0 10px 28px rgba(16, 185, 129, 0.45); animation: popScale 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
          &#10003;
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">Payment Successful!</h2>
        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Dhanyawad! Aapka payment ${shopName} ko successfully transfer ho chuka hai.</p>

        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px; margin-bottom: 22px; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 12px; color: #94a3b8;">Amount Paid</span>
            <strong id="successAmt" style="font-size: 16px; color: #10b981;">&#8377;0</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 12px; color: #94a3b8;">Payment To</span>
            <strong style="font-size: 13px; color: #ffffff;">${shopName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: 12px; color: #94a3b8;">Transaction ID</span>
            <span id="successTxnId" style="font-size: 11px; font-family: monospace; color: #cbd5e1;">N/A</span>
          </div>
        </div>

        <button type="button" class="pay-submit-btn" id="doneSuccessBtn" style="background: #1e293b; color: #ffffff;">
          <span>Done &amp; Close</span>
        </button>
      </div>
    </div>
  </div>

  <script>
    const modal = document.getElementById("payModalOverlay");
    const openBtn = document.getElementById("openPayModalBtn");
    const closeBtn = document.getElementById("closePayModalBtn");
    const amtInput = document.getElementById("customAmountInput");
    const payDirectUpiBtn = document.getElementById("payDirectUpiBtn");
    const paySubmitBtn = document.getElementById("payWithRazorpayBtn");

    const configuredUpiId = "${upiId.replace(/"/g, '\\"')}";
    const configuredPayee = "${upiPayee.replace(/"/g, '\\"')}";
    const qrImg = document.getElementById("dynamicUpiQrImg");
    const qrAmtText = document.getElementById("qrAmtText");

    const formView = document.getElementById("paymentFormView");
    const successView = document.getElementById("paymentSuccessView");
    const successAmt = document.getElementById("successAmt");
    const successTxnId = document.getElementById("successTxnId");
    const doneSuccessBtn = document.getElementById("doneSuccessBtn");

    if (doneSuccessBtn) {
      doneSuccessBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        setTimeout(() => {
          formView.style.display = "block";
          successView.style.display = "none";
        }, 300);
      });
    }

    function showSuccessScreen(amount, txnId) {
      formView.style.display = "none";
      successView.style.display = "block";
      if (successAmt) successAmt.textContent = "₹" + parseFloat(amount).toFixed(2);
      if (successTxnId) successTxnId.textContent = txnId || "N/A";
    }

    function updateLiveQr() {
      const amt = parseFloat(amtInput.value) || 0;
      let upiStr = "upi://pay?pa=" + encodeURIComponent(configuredUpiId) +
        "&pn=" + encodeURIComponent(configuredPayee) +
        "&cu=INR";
      if (amt >= 1) {
        upiStr += "&am=" + encodeURIComponent(amt.toFixed(2));
        if (qrAmtText) qrAmtText.textContent = "Scan to Pay ₹" + amt.toFixed(2);
      } else {
        if (qrAmtText) qrAmtText.textContent = "Scan to Pay Any Amount";
      }
      if (qrImg && configuredUpiId) {
        qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=" + encodeURIComponent(upiStr);
      }
    }

    // Initialize QR code
    updateLiveQr();
    amtInput.addEventListener("input", updateLiveQr);

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        modal.classList.add("active");
        updateLiveQr();
        setTimeout(() => amtInput.focus(), 100);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
      });
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });

    window.setPresetAmt = function(val) {
      amtInput.value = val;
      updateLiveQr();
    };

    // DEDICATED APP INTENT LAUNCHER FOR IOS & ANDROID
    window.triggerUpiApp = function(appType) {
      const amount = parseFloat(amtInput.value);
      if (!amount || amount < 1) {
        alert("Kripya amount enter karein (Minimum ₹1).");
        amtInput.focus();
        return;
      }

      if (!configuredUpiId) {
        alert("Is shop ka direct UPI ID abhi configure nahi hai. Aap niche wale 'Cards & NetBanking' option se pay kar sakte hain.");
        return;
      }

      const params = "pa=" + encodeURIComponent(configuredUpiId) +
        "&pn=" + encodeURIComponent(configuredPayee) +
        "&am=" + encodeURIComponent(amount.toFixed(2)) +
        "&cu=INR" +
        "&tn=" + encodeURIComponent("Payment to " + configuredPayee);

      let targetScheme = "upi://pay?" + params;
      if (appType === "phonepe") {
        targetScheme = "phonepe://pay?" + params;
      } else if (appType === "gpay") {
        targetScheme = "gpay://upi/pay?" + params;
      } else if (appType === "paytm") {
        targetScheme = "paytmmp://pay?" + params;
      }

      window.location.href = targetScheme;
    };

    // FALLBACK RAZORPAY GATEWAY
    paySubmitBtn.addEventListener("click", async () => {
      const amount = parseFloat(amtInput.value);
      if (!amount || amount < 1) {
        alert("Kripya ek valid amount dalein (Minimum Rs 1).");
        amtInput.focus();
        return;
      }

      paySubmitBtn.disabled = true;
      paySubmitBtn.innerHTML = "<span>Initiating Secure Gateway...</span>";

      try {
        const orderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardId: "${cardId}",
            amount: amount,
            shopName: "${shopName.replace(/"/g, '\\"')}"
          })
        });

        const orderData = await orderRes.json();
        if (!orderData.success || !orderData.order) {
          throw new Error(orderData.message || "Failed to create order");
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "${shopName.replace(/"/g, '\\"')}",
          description: "Payment via Tapform Smart Stand",
          order_id: orderData.order.id,
          handler: async function (response) {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response)
              });
              const verifyData = await verifyRes.json();
              showSuccessScreen(amount, response.razorpay_payment_id || orderData.order.id);
            } catch (err) {
              showSuccessScreen(amount, response.razorpay_payment_id || "TXN_OK");
            }
          },
          prefill: {
            name: "",
            email: "",
            contact: ""
          },
          theme: {
            color: "#10b981"
          }
        };

        const rzp = new Razorpay(options);
        rzp.on("payment.failed", function (response) {
          alert("Payment fail ho gaya: " + (response.error.description || "Try again"));
        });
        rzp.open();
      } catch (err) {
        alert("Payment start nahi ho paya: " + err.message);
      } finally {
        paySubmitBtn.disabled = false;
        paySubmitBtn.innerHTML = "<span>Or Pay with Cards / NetBanking / Other UPI</span>";
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Activate or Register a Card
 * POST /api/cards/activate
 */
export async function activateCard(req, res, next) {
  try {
    const {
      cardId,
      destinationUrl,
      title,
      cardType,
      socialLinks,
      designTheme,
      cardFormat,
    } = req.body;

    if (!cardId || !isValidCardId(cardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Card ID. Must be 3-64 characters and contain only letters, numbers, hyphens or underscores.",
      });
    }

    if (!destinationUrl || !isValidHttpUrl(destinationUrl)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination URL. Must be a valid URL starting with http:// or https://",
      });
    }

    const normalizedId = normalizeCardId(cardId);
    const rawUrl = destinationUrl.trim();
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedSocial = normalizeSocialLinks(socialLinks);

    // Determine cardType: default is review, or connect if socialLinks has any values or explicitly set
    const hasSocialValues = normalizedSocial.instagram || normalizedSocial.whatsapp || normalizedSocial.facebook;
    const effectiveCardType = cardType === "connect" || hasSocialValues ? "connect" : "review";
    const effectiveTheme = designTheme || "matte-black";
    const effectiveFormat = cardFormat || "nfc-card";

    // Automatically unshorten Google Maps short URLs (maps.app.goo.gl, goo.gl) for instant loading
    const trimmedUrl = await resolveGoogleMapsUrl(rawUrl);

    // Check if card already exists
    let card = await Card.findOne({ cardId: normalizedId });

    if (card) {
      // Update existing card destination and reactivate
      card.destinationUrl = trimmedUrl;
      if (trimmedTitle) card.title = trimmedTitle;
      card.cardType = effectiveCardType;
      card.socialLinks = normalizedSocial;
      card.designTheme = effectiveTheme;
      card.cardFormat = effectiveFormat;
      card.status = "active";
      if (!card.activatedAt) {
        card.activatedAt = new Date();
      }
      await card.save();
      invalidateScanCache(normalizedId);

      const baseUrl = getBaseUrl(req);
      return res.status(200).json({
        success: true,
        message: "Card destination updated and activated successfully.",
        data: formatCardResponse(card, baseUrl),
      });
    }

    // Create new card
    card = await Card.create({
      cardId: normalizedId,
      destinationUrl: trimmedUrl,
      title: trimmedTitle,
      cardType: effectiveCardType,
      socialLinks: normalizedSocial,
      designTheme: effectiveTheme,
      cardFormat: effectiveFormat,
      status: "active",
      activatedAt: new Date(),
    });
    invalidateScanCache(normalizedId);

    const baseUrl = getBaseUrl(req);
    return res.status(201).json({
      success: true,
      message: "Card activated successfully.",
      data: formatCardResponse(card, baseUrl),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing Card's destination or status
 * PUT /api/cards/:cardId
 */
export async function updateCard(req, res, next) {
  try {
    const { cardId } = req.params;
    const {
      destinationUrl,
      title,
      status,
      cardType,
      socialLinks,
      designTheme,
      cardFormat,
    } = req.body;

    if (!isValidCardId(cardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Card ID format.",
      });
    }

    const normalizedId = normalizeCardId(cardId);
    const card = await Card.findOne({ cardId: normalizedId });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: `Card with ID '${normalizedId}' not found. Please activate it first.`,
      });
    }

    if (destinationUrl !== undefined) {
      if (!isValidHttpUrl(destinationUrl)) {
        return res.status(400).json({
          success: false,
          message: "Invalid destination URL. Must start with http:// or https://",
        });
      }
      card.destinationUrl = await resolveGoogleMapsUrl(destinationUrl.trim());
    }

    if (title !== undefined) {
      card.title = typeof title === "string" ? title.trim() : "";
    }

    if (cardType !== undefined) {
      card.cardType = cardType === "connect" ? "connect" : "review";
    }

    if (socialLinks !== undefined) {
      card.socialLinks = normalizeSocialLinks(socialLinks);
    }

    if (designTheme !== undefined) {
      card.designTheme = designTheme;
    }

    if (cardFormat !== undefined) {
      card.cardFormat = cardFormat;
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'active' or 'inactive'.",
        });
      }
      card.status = status;
    }

    await card.save();
    invalidateScanCache(normalizedId);

    const baseUrl = getBaseUrl(req);
    return res.status(200).json({
      success: true,
      message: "Card updated successfully.",
      data: formatCardResponse(card, baseUrl),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Card Details
 * GET /api/cards/:cardId
 */
export async function getCard(req, res, next) {
  try {
    const { cardId } = req.params;
    const normalizedId = normalizeCardId(cardId);

    let card = await Card.findOne({ cardId: normalizedId }).lean();

    // Fallback: If not found by cardId, search by numeric cardNumber (e.g. "01", "1", "#15")
    if (!card) {
      const numMatch = cardId.replace(/^[^\d]*/, "");
      const parsedNum = parseInt(numMatch, 10);
      if (!isNaN(parsedNum)) {
        card = await Card.findOne({ cardNumber: parsedNum }).lean();
      }
    }

    if (!card) {
      return res.status(404).json({
        success: false,
        message: `Card with ID '${normalizedId}' not found.`,
      });
    }

    const baseUrl = getBaseUrl(req);
    return res.status(200).json({
      success: true,
      data: formatCardResponse(card, baseUrl),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all Dynamic QRs / Cards with stats and filtering
 * GET /api/cards
 * Query params: status (all, active, inactive), search (string)
 */
export async function getAllCards(req, res, next) {
  try {
    const { status, search, limit, batchId } = req.query;
    const filter = {};

    if (status && ["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    if (batchId && batchId.trim()) {
      filter.batchId = batchId.trim();
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const regex = new RegExp(cleanSearch, "i");
      const numMatch = cleanSearch.replace(/^#/, "");
      const parsedNum = parseInt(numMatch, 10);

      filter.$or = [
        { cardId: regex },
        { title: regex },
        { destinationUrl: regex },
      ];

      if (!isNaN(parsedNum)) {
        filter.$or.push({ cardNumber: parsedNum });
      }
    }

    const query = Card.find(filter).sort({ cardNumber: -1, createdAt: -1 }).lean();

    // High scale limit capping & pagination to prevent memory overload
    const parsedLimit = limit && !isNaN(parseInt(limit, 10)) && parseInt(limit, 10) > 0
      ? Math.min(parseInt(limit, 10), 2000)
      : 500;
    query.limit(parsedLimit);

    const parsedPage = req.query.page && !isNaN(parseInt(req.query.page, 10)) && parseInt(req.query.page, 10) > 0
      ? parseInt(req.query.page, 10)
      : 1;
    if (parsedPage > 1) {
      query.skip((parsedPage - 1) * parsedLimit);
    }

    const [cards, totalCount, activeCount, inactiveCount, aggregateScans] = await Promise.all([
      query.exec(),
      Card.countDocuments({}),
      Card.countDocuments({ status: "active" }),
      Card.countDocuments({ status: "inactive" }),
      Card.aggregate([
        {
          $group: {
            _id: null,
            totalScans: { $sum: "$scanCount" },
          },
        },
      ]),
    ]);

    const baseUrl = getBaseUrl(req);
    const totalScans = aggregateScans.length > 0 ? aggregateScans[0].totalScans : 0;

    return res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        totalScans,
      },
      count: cards.length,
      data: cards.map((card) => formatCardResponse(card, baseUrl)),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a Card
 * DELETE /api/cards/:cardId
 */
export async function deleteCard(req, res, next) {
  try {
    const { cardId } = req.params;
    const normalizedId = normalizeCardId(cardId);

    const card = await Card.findOneAndDelete({ cardId: normalizedId });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: `Card with ID '${normalizedId}' not found.`,
      });
    }

    invalidateScanCache(normalizedId);

    return res.status(200).json({
      success: true,
      message: `Card '${normalizedId}' deleted successfully...`,
      data: { cardId: normalizedId },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Customer scans NFC or QR Code
 * GET /c/:cardId
 * Increments scanCount and redirects to destinationUrl
 */
export async function redirectScan(req, res, next) {
  try {
    const { cardId } = req.params;
    const normalizedId = normalizeCardId(cardId);

    // 1. Check in-memory cache for SUB-MILLISECOND (<1ms) instant redirection with ZERO database query
    const cached = scanCache.get(normalizedId);
    if (cached && (Date.now() - cached.cachedAt < SCAN_CACHE_TTL_MS)) {
      if (cached._id) {
        Card.updateOne(
          { _id: cached._id },
          { $inc: { scanCount: 1 }, $set: { lastScannedAt: new Date() } }
        ).exec().catch(() => {});
      }
      const hasSocial = cached.socialLinks && (cached.socialLinks.instagram || cached.socialLinks.whatsapp || cached.socialLinks.facebook);
      if (cached.cardType === "connect" && hasSocial) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(renderConnectProfileHtml({
          cardId: normalizedId,
          title: cached.title,
          destinationUrl: cached.targetUrl,
          socialLinks: cached.socialLinks,
          baseUrl: getBaseUrl(req),
        }));
      }
      res.setHeader("Location", cached.targetUrl);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(302).send(renderRedirectHtml(cached.targetUrl));
    }

    const card = await Card.findOne({ cardId: normalizedId })
      .select("cardId destinationUrl title cardType socialLinks status _id")
      .lean();

    // Handle unknown card -> direct to setup landing page with cardId prefilled
    if (!card) {
      return res.redirect(`/activate?cardId=${encodeURIComponent(normalizedId)}`);
    }

    // Handle pending activation (brand new stand scanned by shop owner)
    if (!card.destinationUrl || card.destinationUrl.trim() === "") {
      return res.redirect(`/activate?cardId=${encodeURIComponent(normalizedId)}`);
    }

    // Handle paused card (temporarily disabled by owner)
    if (card.status !== "active") {
      return res.status(200).send(
        renderScanStatusHtml({
          status: 403,
          badge: "PAUSED",
          title: "Card Is Currently Disabled",
          cardId: normalizedId,
          description: "The owner of this card has temporarily paused this link.",
          buttonText: "Manage / Reactivate Link",
          buttonLink: `/activate?cardId=${encodeURIComponent(normalizedId)}`,
        })
      );
    }

    // Handle invalid destination
    if (!isValidHttpUrl(card.destinationUrl)) {
      return res.redirect(`/activate?cardId=${encodeURIComponent(normalizedId)}`);
    }

    // If destination URL is still a short link, resolve it to canonical Google Maps URL on the fly
    let targetUrl = card.destinationUrl;
    if (targetUrl.includes("goo.gl") || targetUrl.includes("bit.ly")) {
      const resolved = await resolveGoogleMapsUrl(targetUrl);
      if (resolved && resolved !== targetUrl) {
        targetUrl = resolved;
        Card.updateOne({ _id: card._id }, { destinationUrl: resolved })
          .exec()
          .catch(() => {});
      }
    }

    // Cache verified destination in memory for future scans
    setScanCacheEntry(normalizedId, {
      targetUrl,
      cardType: card.cardType || "review",
      socialLinks: card.socialLinks || {},
      title: card.title || "",
      _id: card._id,
      status: card.status,
    });

    // Increment scanCount asynchronously without blocking user redirection
    Card.updateOne(
      { _id: card._id },
      {
        $inc: { scanCount: 1 },
        $set: { lastScannedAt: new Date() },
      }
    ).exec().catch((err) => console.error("Failed to update scan count:", err));

    // If Connect Card with social links, display the responsive mobile Shop Connect Profile
    const hasSocial = card.socialLinks && (card.socialLinks.instagram || card.socialLinks.whatsapp || card.socialLinks.facebook);
    if (card.cardType === "connect" && hasSocial) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(renderConnectProfileHtml({
        cardId: normalizedId,
        title: card.title,
        destinationUrl: targetUrl,
        socialLinks: card.socialLinks,
        baseUrl: getBaseUrl(req),
      }));
    }

    // Direct Single-Review Card: Send HTTP 302 Location header AND instant redirect
    res.setHeader("Location", targetUrl);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(302).send(renderRedirectHtml(targetUrl));
  } catch (error) {
    next(error);
  }
}

/**
 * Render stylish HTML status page for customer scans on mobile/desktop
 */
function renderScanStatusHtml({
  status,
  badge,
  title,
  cardId,
  description,
  buttonText,
  buttonLink,
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Tapform NFC</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --ink: #202720;
      --muted: #7b8178;
      --line: #e7e8e0;
      --paper: #fafaf7;
      --card-bg: #ffffff;
      --accent: #b45309;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--paper);
      color: var(--ink);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .container {
      max-width: 440px;
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      background: #fef3c7;
      color: #92400e;
      padding: 6px 12px;
      border-radius: 100px;
      margin-bottom: 20px;
    }
    h1 {
      font-family: "Manrope", sans-serif;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
      color: var(--ink);
    }
    p {
      font-size: 15px;
      line-height: 1.5;
      color: var(--muted);
      margin-bottom: 24px;
    }
    .card-meta {
      background: #f7f7f3;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .card-meta span { color: var(--muted); font-weight: 600; }
    .card-meta strong { color: var(--ink); font-family: monospace; font-size: 14px; }
    .btn {
      display: inline-block;
      width: 100%;
      background: var(--ink);
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .footer-note {
      margin-top: 24px;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">${badge} (${status})</div>
    <h1>${title}</h1>
    <p>${description}</p>
    <div class="card-meta">
      <span>CARD IDENTIFIER</span>
      <strong>${cardId}</strong>
    </div>
    <a href="${buttonLink}" class="btn">${buttonText} &rarr;</a>
    <div class="footer-note">tapform. &bull; NFC & Dynamic QR Platform</div>
  </div>
</body>
</html>`;
}

/**
 * Admin Login / Passcode verification
 * POST /api/admin/login
 */
export async function adminLogin(req, res) {
  try {
    const { password } = req.body;
    const configuredAdminPass = process.env.ADMIN_PASSWORD || "admin1234";
    const configuredApiKey = process.env.API_SECRET_KEY || "nfc_secret_key_change_in_production";

    if (!password || (password !== configuredAdminPass && password !== configuredApiKey)) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin passcode or master key.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin authentication successful.",
      token: password,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin Token Verification
 * GET /api/admin/verify
 */
export async function adminVerify(req, res) {
  return res.status(200).json({
    success: true,
    message: "Admin credentials verified.",
  });
}

/**
 * Get Comprehensive Admin Analytics & Stats
 * GET /api/admin/stats
 */
export async function getAdminStats(req, res, next) {
  try {
    const [
      totalCount,
      activeCount,
      inactiveCount,
      aggregateScans,
      recentCards,
      recentScans,
      batchAggregates,
    ] = await Promise.all([
      Card.countDocuments({}),
      Card.countDocuments({ status: "active" }),
      Card.countDocuments({ status: "inactive" }),
      Card.aggregate([
        {
          $group: {
            _id: null,
            totalScans: { $sum: "$scanCount" },
          },
        },
      ]),
      Card.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      Card.find({ lastScannedAt: { $ne: null } })
        .sort({ lastScannedAt: -1 })
        .limit(10)
        .lean(),
      Card.aggregate([
        { $match: { batchId: { $ne: "" } } },
        {
          $group: {
            _id: "$batchId",
            count: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            inactive: {
              $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
            },
            totalScans: { $sum: "$scanCount" },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalScans = aggregateScans.length > 0 ? aggregateScans[0].totalScans : 0;
    const baseUrl = getBaseUrl(req);

    return res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        totalScans,
        activationRate:
          totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0,
      },
      batches: batchAggregates,
      recentCards: recentCards.map((c) => formatCardResponse(c, baseUrl)),
      recentScans: recentScans.map((c) => formatCardResponse(c, baseUrl)),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk Generate Dynamic QR Cards (e.g. 100 to 500+ cards)
 * POST /api/cards/bulk
 */
export async function bulkGenerateCards(req, res, next) {
  try {
    let { count = 100, prefix = "TF-", startNumber, status = "inactive", batchId } = req.body;

    count = parseInt(count, 10);
    if (isNaN(count) || count < 1) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid count of cards to create (e.g. 100 to 500).",
      });
    }

    if (count > 2000) {
      return res.status(400).json({
        success: false,
        message: "Maximum 2,000 cards can be created in a single batch.",
      });
    }

    let cleanPrefix = (prefix || "TF-").trim().toUpperCase();
    if (!cleanPrefix.endsWith("-") && !cleanPrefix.endsWith("_")) {
      cleanPrefix = `${cleanPrefix}-`;
    }

    // Determine starting sequence number (Default is 1 for clean #01 to #100 numbering)
    let currentNumber;
    if (startNumber !== undefined && !isNaN(parseInt(startNumber, 10))) {
      currentNumber = parseInt(startNumber, 10);
    } else {
      const highestCard = await Card.findOne({ cardNumber: { $ne: null } })
        .sort({ cardNumber: -1 })
        .select("cardNumber")
        .lean();
      currentNumber = highestCard && highestCard.cardNumber ? highestCard.cardNumber + 1 : 1;
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const generatedBatchId = batchId && batchId.trim()
      ? batchId.trim().toUpperCase()
      : `BATCH-${todayStr}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const maxNumber = currentNumber + count - 1;
    const padLen = Math.max(2, String(maxNumber).length);

    const cardsToInsert = [];
    for (let i = 0; i < count; i++) {
      const num = currentNumber + i;
      const formattedNum = String(num).padStart(padLen, "0");
      const cardId = `${cleanPrefix}${formattedNum}`;

      cardsToInsert.push({
        cardId,
        cardNumber: num,
        destinationUrl: "",
        title: "",
        status: status === "active" ? "active" : "inactive",
        batchId: generatedBatchId,
        scanCount: 0,
      });
    }

    let inserted = [];
    try {
      inserted = await Card.insertMany(cardsToInsert, { ordered: false });
    } catch (insertError) {
      if (insertError.insertedDocs && insertError.insertedDocs.length > 0) {
        inserted = insertError.insertedDocs;
      } else {
        throw insertError;
      }
    }

    const baseUrl = getBaseUrl(req);
    return res.status(201).json({
      success: true,
      message: `Successfully created ${inserted.length} dynamic QR cards.`,
      batchId: generatedBatchId,
      count: inserted.length,
      startNumber: currentNumber,
      endNumber: currentNumber + inserted.length - 1,
      data: inserted.map((c) => formatCardResponse(c, baseUrl)),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk Delete Cards
 * DELETE /api/cards/bulk
 */
export async function bulkDeleteCards(req, res, next) {
  try {
    const { cardIds, batchId } = req.body;
    let filter = {};

    if (Array.isArray(cardIds) && cardIds.length > 0) {
      filter = { cardId: { $in: cardIds.map(normalizeCardId) } };
    } else if (batchId && typeof batchId === "string") {
      filter = { batchId: batchId.trim() };
    } else {
      return res.status(400).json({
        success: false,
        message: "Provide either a 'cardIds' array or a 'batchId' to delete.",
      });
    }

    const result = await Card.deleteMany(filter);
    invalidateScanCache(); // Clear in-memory scan cache after bulk delete

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} cards successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create Razorpay Order
 * POST /api/payment/create-order
 */
export async function createPaymentOrder(req, res, next) {
  try {
    const { amount, cardId, shopName } = req.body;
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid amount of at least ₹1",
      });
    }

    const rzp = getRazorpayInstance();
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_U5V3ADmxw4zMX7";

    if (!rzp) {
      return res.status(500).json({
        success: false,
        message: "Razorpay payment gateway not configured",
      });
    }

    const receipt = `rcpt_${(cardId || "stand").substring(0, 10)}_${Date.now().toString().slice(-8)}`;
    const options = {
      amount: Math.round(numAmount * 100), // in paise
      currency: "INR",
      receipt: receipt,
      notes: {
        cardId: cardId || "N/A",
        shopName: shopName || "Shop Payment",
      },
    };

    const order = await rzp.orders.create(options);
    return res.status(200).json({
      success: true,
      order,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.error && error.error.description ? error.error.description : error.message,
    });
  }
}

/**
 * Verify Razorpay Payment Signature
 * POST /api/payment/verify
 */
export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment parameters",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "NHVELcdWvTrEMLxwAqckZ0Bk";
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature verification failed",
      });
    }
  } catch (error) {
    next(error);
  }
}
