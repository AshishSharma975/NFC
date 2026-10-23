export function normalizeCardId(cardId) {
  if (typeof cardId !== "string") return "";
  return cardId.trim().toUpperCase();
}

export function isValidCardId(cardId) {
  if (!cardId || typeof cardId !== "string") return false;
  const normalized = cardId.trim();
  // Allow letters, digits, hyphens, underscores, length 3-64
  return /^[A-Za-z0-9_-]{3,64}$/.test(normalized);
}

export function isValidHttpUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
