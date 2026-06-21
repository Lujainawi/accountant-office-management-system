import {
  API_BASE_URL,
  ApiError,
  apiFetch,
  extractErrorMessage,
  handleUnauthorizedResponse,
} from "./client";

function buildQueryString({
  q,
  clientId,
  status,
  documentType,
  month,
  year,
  limit,
} = {}) {
  const params = new URLSearchParams();

  if (q && q.trim()) {
    params.set("q", q.trim());
  }
  if (clientId) {
    params.set("client_id", String(clientId));
  }
  if (status) {
    params.set("status", status);
  }
  if (documentType) {
    params.set("document_type", documentType);
  }
  if (month) {
    params.set("month", String(month));
  }
  if (year) {
    params.set("year", String(year));
  }
  if (limit) {
    params.set("limit", String(limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getDocumentUploadPolicy() {
  return apiFetch("/api/documents/upload-policy");
}

export function listDocuments(filters = {}) {
  return apiFetch(`/api/documents${buildQueryString(filters)}`);
}

export function getDocument(id) {
  return apiFetch(`/api/documents/${id}`);
}

export function createDocument(formData) {
  return apiFetch("/api/documents", {
    method: "POST",
    body: formData,
  });
}

export function updateDocument(id, payload) {
  return apiFetch(`/api/documents/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteDocument(id) {
  return apiFetch(`/api/documents/${id}`, {
    method: "DELETE",
  });
}

export async function downloadDocument(id) {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}/download`, {
    credentials: "include",
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);

    const contentType = response.headers.get("content-type") ?? "";
    const hasJsonBody = contentType.includes("application/json");
    const payload = hasJsonBody ? await response.json() : null;
    const message = extractErrorMessage(payload) ?? "לא ניתן להוריד את הקובץ.";
    throw new ApiError(response.status, message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const filename = parseFilenameFromDisposition(disposition) ?? "document";

  return { blob, filename };
}

export function parseFilenameFromDisposition(disposition) {
  if (!disposition) {
    return null;
  }

  const rfc5987Match = disposition.match(/filename\*\s*=\s*[^']*'[^']*'([^;]+)/i);
  if (rfc5987Match) {
    try {
      return decodeURIComponent(rfc5987Match[1].trim());
    } catch {
      return null;
    }
  }

  const quotedMatch = disposition.match(/filename\s*=\s*"([^"]*)"/i);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  const unquotedMatch = disposition.match(/filename\s*=\s*([^;]+)/i);
  if (unquotedMatch) {
    return unquotedMatch[1].trim().replace(/^"|"$/g, "");
  }

  return null;
}

export function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
