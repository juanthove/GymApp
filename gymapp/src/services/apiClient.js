async function toApiError(response) {
  const contentType = response.headers.get("content-type") || "";
  let message = `Error HTTP ${response.status}`;
  let fields = null;

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
      fields = payload?.fields || null;
    } else {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
  } catch {
    // Keep fallback message when body parsing fails.
  }

  const error = new Error(message);
  error.status = response.status;
  error.fields = fields;
  return error;
}

export async function apiRequest(url, options = {}, responseType = "json") {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return null;
  }

  if (responseType === "text") {
    return response.text();
  }

  if (responseType === "raw") {
    return response;
  }

  return response.json();
}
