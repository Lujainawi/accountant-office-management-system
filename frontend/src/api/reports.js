import { apiFetch } from "./client";

export function getMonthlyReport(month, year) {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });
  return apiFetch(`/api/reports/monthly?${params.toString()}`);
}
