import { apiFetch } from "./client";

export function listPayments({ clientId } = {}) {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client_id", String(clientId));
  }
  const query = params.toString();
  return apiFetch(`/api/payments${query ? `?${query}` : ""}`);
}

export function getPayment(id) {
  return apiFetch(`/api/payments/${id}`);
}

export function createPayment(payload) {
  return apiFetch("/api/payments", {
    method: "POST",
    body: payload,
  });
}

export function updatePayment(id, payload) {
  return apiFetch(`/api/payments/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deletePayment(id) {
  return apiFetch(`/api/payments/${id}`, {
    method: "DELETE",
  });
}
