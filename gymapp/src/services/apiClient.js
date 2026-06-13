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
    //Mantener mensaje de fallback
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

export function parseJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let payload = parts[1];
    // base64url -> base64
    payload = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4) payload += "=";
    const decoded = atob(payload);
    try {
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload) return false;
  // `exp` claim is in seconds since epoch
  if (typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }
  // If no exp claim, assume token is valid (can't determine)
  return true;
}

export function buildAuthorizedAssetUrl(url) {
  const token = getAuthToken();
  if (!token) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

function isAuthFreeRequest(url, options) {
  if (options?.skipAuthRedirect) {
    return true;
  }

  return url.includes("/login") || url.includes("/not-logged");
}

export function redirectToLogin() {
  localStorage.removeItem("systemUser");

  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

export async function apiRequest(url, options = {}, responseType = "json") {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!token && !isAuthFreeRequest(url, options)) {
    redirectToLogin();
    throw new Error("Sin token de sesión. Redirigiendo a login.");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && !isAuthFreeRequest(url, options)) {
      redirectToLogin();
    }
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
