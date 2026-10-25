const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : (typeof window !== "undefined" && window.location.port === "5173"
        ? `http://${window.location.hostname}:5000`
        : "");

const API_KEY = import.meta.env.VITE_API_KEY || "nfc_secret_key_change_in_production";

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }
  return headers;
}

/**
 * Activate or update a card destination in MongoDB
 */
export async function activateCardApi({ cardId, destinationUrl, title = "" }) {
  const response = await fetch(`${API_BASE_URL}/api/cards/activate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      cardId: cardId.trim(),
      destinationUrl: destinationUrl.trim(),
      title: title.trim(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to activate card (${response.status})`);
  }

  return data;
}

/**
 * Update an existing card's destination URL or status
 */
export async function updateCardApi(cardId, updates) {
  const response = await fetch(`${API_BASE_URL}/api/cards/${encodeURIComponent(cardId)}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to update card (${response.status})`);
  }

  return data;
}

const ADMIN_TOKEN_KEY = "tapform_admin_auth_token";

export function getAdminToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminToken(token, remember = true) {
  if (typeof window === "undefined") return;
  if (remember) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAdminHeaders() {
  const headers = getHeaders();
  const token = getAdminToken();
  if (token) {
    headers["x-admin-key"] = token;
  }
  return headers;
}

/**
 * Admin Login
 */
export async function adminLoginApi(password) {
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Login failed (${response.status})`);
  }

  return data;
}

/**
 * Verify Admin Token
 */
export async function adminVerifyApi() {
  const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
    method: "GET",
    headers: getAdminHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Invalid admin session");
  }

  return data;
}

/**
 * Get Comprehensive Admin Analytics & Stats
 */
export async function getAdminStatsApi() {
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    method: "GET",
    headers: getAdminHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch admin stats (${response.status})`);
  }

  return data;
}

/**
 * Bulk Generate Dynamic QR Cards
 */
export async function bulkGenerateCardsApi({ count, prefix, startNumber, status, batchId }) {
  const response = await fetch(`${API_BASE_URL}/api/cards/bulk`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      count,
      prefix,
      startNumber,
      status,
      batchId,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to generate bulk cards (${response.status})`);
  }

  return data;
}

/**
 * Bulk Delete Cards
 */
export async function bulkDeleteCardsApi({ cardIds, batchId }) {
  const response = await fetch(`${API_BASE_URL}/api/cards/bulk`, {
    method: "DELETE",
    headers: getAdminHeaders(),
    body: JSON.stringify({ cardIds, batchId }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to bulk delete cards (${response.status})`);
  }

  return data;
}

/**
 * Get all cards and statistics
 * @param {Object} params - { status: 'all' | 'active' | 'inactive', search: string, limit: number, batchId: string }
 */
export async function getAllCardsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.search && params.search.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.limit && !isNaN(params.limit)) {
    query.set("limit", params.limit);
  }
  if (params.batchId && params.batchId.trim()) {
    query.set("batchId", params.batchId.trim());
  }

  const queryString = query.toString();
  const url = `${API_BASE_URL}/api/cards${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAdminHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch cards (${response.status})`);
  }

  return data;
}

/**
 * Delete a card by Card ID
 */
export async function deleteCardApi(cardId) {
  const response = await fetch(`${API_BASE_URL}/api/cards/${encodeURIComponent(cardId)}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to delete card (${response.status})`);
  }

  return data;
}

/**
 * Get card details by Card ID
 */
export async function getCardApi(cardId) {
  const response = await fetch(`${API_BASE_URL}/api/cards/${encodeURIComponent(cardId)}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Card not found (${response.status})`);
  }

  return data;
}

export { API_BASE_URL };


