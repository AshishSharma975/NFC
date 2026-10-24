const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : (typeof window !== "undefined" && window.location.port === "5173"
        ? "http://localhost:5000"
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

/**
 * Get all cards and statistics
 * @param {Object} params - { status: 'all' | 'active' | 'inactive', search: string }
 */
export async function getAllCardsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.search && params.search.trim()) {
    query.set("search", params.search.trim());
  }

  const queryString = query.toString();
  const url = `${API_BASE_URL}/api/cards${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
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
    headers: getHeaders(),
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

