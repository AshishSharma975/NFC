import { Card } from "../models/Card.js";
import {
  isValidCardId,
  isValidHttpUrl,
  normalizeCardId,
} from "../utils/validators.js";

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
  // Prioritize BASE_URL if set in environment (e.g. Cloudflare tunnel or production URL)
  if (process.env.BASE_URL && process.env.BASE_URL.trim()) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }

  // Otherwise deduce from request host
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  if (host) {
    return `${protocol}://${host}`;
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
    const trimmedUrl = destinationUrl.trim();
    const trimmedTitle = typeof title === "string" ? title.trim() : "";

    // Check if card already exists
    let card = await Card.findOne({ cardId: normalizedId });

    if (card) {
      // Update existing card destination and reactivate
      card.destinationUrl = trimmedUrl;
      if (trimmedTitle) card.title = trimmedTitle;
      card.status = "active";
      await card.save();

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
    });

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
      card.destinationUrl = destinationUrl.trim();
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

    const card = await Card.findOne({ cardId: normalizedId });

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
 * Customer scans NFC or QR Code
 * GET /c/:cardId
 * Increments scanCount and redirects to destinationUrl
 */
export async function redirectScan(req, res, next) {
  try {
    const { cardId } = req.params;
    const normalizedId = normalizeCardId(cardId);

    const card = await Card.findOne({ cardId: normalizedId });

    // Handle unknown card
    if (!card) {
      return res.status(404).send(
        renderScanStatusHtml({
          status: 404,
          badge: "UNREGISTERED CARD",
          title: "Card Not Activated",
          cardId: normalizedId,
          description:
            "This NFC card or QR code has not been connected to a destination yet.",
          buttonText: "Activate This Card",
          buttonLink: `/activate?cardId=${encodeURIComponent(normalizedId)}`,
        })
      );
    }

    // Handle inactive card
    if (card.status !== "active") {
      return res.status(403).send(
        renderScanStatusHtml({
          status: 403,
          badge: "INACTIVE",
          title: "Card Is Currently Disabled",
          cardId: normalizedId,
          description:
            "The owner of this card has temporarily paused or disabled this link.",
          buttonText: "Return Home",
          buttonLink: "/",
        })
      );
    }

    // Handle invalid destination
    if (!card.destinationUrl || !isValidHttpUrl(card.destinationUrl)) {
      return res.status(400).send(
        renderScanStatusHtml({
          status: 400,
          badge: "INVALID DESTINATION",
          title: "Destination Link Not Ready",
          cardId: normalizedId,
          description:
            "The destination URL configured for this card is invalid or missing.",
          buttonText: "Update Card Link",
          buttonLink: `/activate?cardId=${encodeURIComponent(normalizedId)}`,
        })
      );
    }

    // Increment scanCount asynchronously without blocking user redirection
    Card.updateOne(
      { _id: card._id },
      {
        $inc: { scanCount: 1 },
        $set: { lastScannedAt: new Date() },
      }
    ).exec().catch((err) => console.error("Failed to update scan count:", err));

    // Perform HTTP 302 Found redirect
    return res.redirect(302, card.destinationUrl);
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
