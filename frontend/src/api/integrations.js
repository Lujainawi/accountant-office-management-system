import { apiFetch } from "./client";

export function getIntegrationStatuses() {
  return apiFetch("/api/integrations/statuses");
}

export function previewEmailPreset(preset) {
  return apiFetch("/api/integrations/email/preview", {
    method: "POST",
    body: { preset },
  });
}

export function processOcrPreset(preset) {
  return apiFetch("/api/integrations/ocr/mock-process", {
    method: "POST",
    body: { preset },
  });
}

export function getTaxAuthorityStatus() {
  return apiFetch("/api/integrations/tax-authority/status");
}

export function getDigitalSignatureStatus() {
  return apiFetch("/api/integrations/digital-signature/status");
}

export function getOnlinePaymentsStatus() {
  return apiFetch("/api/integrations/payments/status");
}

export function getAiMockSuggestions() {
  return apiFetch("/api/integrations/ai-assistant/mock-suggestions");
}
