export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function clearUnauthorizedHandler() {
  onUnauthorized = null;
}

export function handleUnauthorizedResponse(response, skipUnauthorizedHandler = false) {
  if (response.status === 401 && !skipUnauthorizedHandler && onUnauthorized) {
    onUnauthorized();
  }
}

export function extractErrorMessage(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const { detail } = payload;
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item.msg === "string") {
          return item.msg;
        }
        return null;
      })
      .filter(Boolean)
      .join(" ");
  }

  return null;
}

export async function apiFetch(path, options = {}) {
  const { body, headers = {}, skipUnauthorizedHandler = false, ...rest } = options;
  const requestHeaders = { ...headers };

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const hasJsonBody = contentType.includes("application/json");
  const payload = hasJsonBody ? await response.json() : null;

  if (!response.ok) {
    handleUnauthorizedResponse(response, skipUnauthorizedHandler);
    const message =
      extractErrorMessage(payload) ?? "אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.";
    throw new ApiError(response.status, message);
  }

  return payload;
}
