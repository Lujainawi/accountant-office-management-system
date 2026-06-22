import { apiFetch } from "./client";

export function getDashboardSummary() {
  return apiFetch("/api/dashboard/summary");
}
