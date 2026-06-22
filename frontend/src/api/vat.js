import { apiFetch } from "./client";

export function calculateVat(payload) {
  return apiFetch("/api/vat/calculate", {
    method: "POST",
    body: payload,
  });
}
