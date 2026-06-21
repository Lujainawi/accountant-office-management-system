import { apiFetch } from "./client";

export function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiFetch("/api/auth/me");
}
