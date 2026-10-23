const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API_KEY = import.meta.env.VITE_API_KEY || "";

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
