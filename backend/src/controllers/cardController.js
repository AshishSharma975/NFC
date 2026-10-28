import { Card } from "../models/Card.js";
import {
  isValidCardId,
  isValidHttpUrl,
  normalizeCardId,
} from "../utils/validators.js";
import { resolveGoogleMapsUrl } from "../utils/urlResolver.js";

import os from "os";

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


/**
 * Activate or Register a Card
 * POST /api/cards/activate
 */
export async function activateCard(req, res, next) {
  try {
    const { cardId, destinationUrl, title } = req.body;

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

    // Automatically unshorten Google Maps short URLs (maps.app.goo.gl, goo.gl) for instant loading
    const trimmedUrl = await resolveGoogleMapsUrl(rawUrl);

    // Check if card already exists
    let card = await Card.findOne({ cardId: normalizedId });

    if (card) {
      // Update existing card destination and reactivate
      card.destinationUrl = trimmedUrl;
      if (trimmedTitle) card.title = trimmedTitle;
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
    const { destinationUrl, title, status } = req.body;

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

    const card = await Card.findOne({ cardId: normalizedId }).lean();

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
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { cardId: regex },
        { title: regex },
        { destinationUrl: regex },
      ];
    }

    const query = Card.find(filter).sort({ cardNumber: -1, createdAt: -1 }).lean();

    // High scale limit capping & pagination to prevent memory overload
    const parsedLimit = limit && !isNaN(parseInt(limit, 10)) && parseInt(limit, 10) > 0
      ? Math.min(parseInt(limit, 10), 500)
      : 100;
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
      res.setHeader("Location", cached.targetUrl);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(302).send(renderRedirectHtml(cached.targetUrl));
    }

    const card = await Card.findOne({ cardId: normalizedId })
      .select("cardId destinationUrl status _id")
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

    // Send HTTP 302 Location header AND instant client-side fallback redirect payload
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

    // Determine starting sequence number
    let currentNumber;
    if (startNumber !== undefined && !isNaN(parseInt(startNumber, 10))) {
      currentNumber = parseInt(startNumber, 10);
    } else {
      const highestCard = await Card.findOne({ cardNumber: { $ne: null } })
        .sort({ cardNumber: -1 })
        .select("cardNumber")
        .lean();
      currentNumber = highestCard && highestCard.cardNumber ? highestCard.cardNumber + 1 : 1001;
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const generatedBatchId = batchId && batchId.trim()
      ? batchId.trim().toUpperCase()
      : `BATCH-${todayStr}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const cardsToInsert = [];
    for (let i = 0; i < count; i++) {
      const num = currentNumber + i;
      const cardId = `${cleanPrefix}${String(num).padStart(5, "0")}`;

      cardsToInsert.push({
        cardId,
        cardNumber: num,
        destinationUrl: "",
        title: `NFC Stand #${num}`,
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
