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

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("systemUser");
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export function buildAuthorizedAssetUrl(url) {
  const token = getAuthToken();
  if (!token) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

export async function apiRequest(url, options = {}, responseType = "json") {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

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

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  return text ? JSON.parse(text) : null;
}
