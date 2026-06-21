import { apiFetch } from "./client";

function buildQueryString({ q, status, clientType } = {}) {
  const params = new URLSearchParams();

  if (q && q.trim()) {
    params.set("q", q.trim());
  }
  if (status) {
    params.set("status", status);
  }
  if (clientType) {
    params.set("client_type", clientType);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listClients(filters = {}) {
  return apiFetch(`/api/clients${buildQueryString(filters)}`);
}

export function getClient(id) {
  return apiFetch(`/api/clients/${id}`);
}

export function createClient(payload) {
  return apiFetch("/api/clients", {
    method: "POST",
    body: payload,
  });
}

export function updateClient(id, payload) {
  return apiFetch(`/api/clients/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteClient(id) {
  return apiFetch(`/api/clients/${id}`, {
    method: "DELETE",
  });
}
