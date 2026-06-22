import { apiFetch } from "./client";

export function getSettings() {
  return apiFetch("/api/settings");
}

export function updateSettings(payload) {
  return apiFetch("/api/settings", {
    method: "PUT",
    body: payload,
  });
}
