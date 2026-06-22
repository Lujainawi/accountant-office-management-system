const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;

export const MAX_MONEY_CENTS = 99999999999999n;
export const MAX_VAT_HUNDREDTHS = 10000n;

export const VALIDATION_MESSAGES = {
  amountRequired: "סכום לפני מע״מ הוא שדה חובה.",
  vatRateRequired: "שיעור מע״מ הוא שדה חובה.",
  invalidAmount: "סכום חייב להיות ערך לא שלילי.",
  invalidVatRate: "שיעור מע״מ חייב להיות ערך לא שלילי.",
  invalidAmountScale: "ערך כספי יכול לכלול לכל היותר שתי ספרות עשרוניות.",
  invalidVatScale: "שיעור מע״מ יכול לכלול לכל היותר שתי ספרות עשרוניות.",
  invalidVatMax: "שיעור מע״מ לא יכול לעלות על 100.00.",
  exceedsMaxMoney: "הערך חורג מהטווח המותר.",
};

function parseDecimalParts(value) {
  const trimmed = value.trim();
  if (!DECIMAL_PATTERN.test(trimmed)) {
    return null;
  }
  const [wholePart, fractionPart = ""] = trimmed.split(".");
  return {
    wholePart,
    fractionPart: (fractionPart + "00").slice(0, 2),
  };
}

export function parseMoneyToCents(value) {
  if (value == null || !String(value).trim()) {
    return null;
  }
  const parts = parseDecimalParts(String(value));
  if (!parts) {
    return null;
  }
  return BigInt(parts.wholePart) * 100n + BigInt(parts.fractionPart);
}

export function parseRateToHundredths(value) {
  if (value == null || !String(value).trim()) {
    return null;
  }
  const parts = parseDecimalParts(String(value));
  if (!parts) {
    return null;
  }
  return BigInt(parts.wholePart) * 100n + BigInt(parts.fractionPart);
}

export function formatCents(cents) {
  const whole = cents / 100n;
  const fraction = cents % 100n;
  return `${whole}.${fraction.toString().padStart(2, "0")}`;
}

export function previewForwardVat(amountBeforeVat, vatRate) {
  const amountCents = parseMoneyToCents(amountBeforeVat);
  const rateHundredths = parseRateToHundredths(vatRate);
  if (amountCents == null || rateHundredths == null) {
    return null;
  }
  if (amountCents < 0n || rateHundredths < 0n) {
    return null;
  }

  const vatCents = (amountCents * rateHundredths + 5000n) / 10000n;
  const totalCents = amountCents + vatCents;

  return {
    vatAmount: formatCents(vatCents),
    totalAmount: formatCents(totalCents),
  };
}

export function validateMoneyInput(value, { required = false } = {}) {
  const text = String(value ?? "").trim();
  if (!text) {
    return required ? VALIDATION_MESSAGES.amountRequired : null;
  }
  const cents = parseMoneyToCents(text);
  if (cents == null) {
    return VALIDATION_MESSAGES.invalidAmountScale;
  }
  if (cents < 0n) {
    return VALIDATION_MESSAGES.invalidAmount;
  }
  if (cents > MAX_MONEY_CENTS) {
    return VALIDATION_MESSAGES.exceedsMaxMoney;
  }
  return null;
}

export function validateVatRateInput(value, { required = false } = {}) {
  const text = String(value ?? "").trim();
  if (!text) {
    return required ? VALIDATION_MESSAGES.vatRateRequired : null;
  }
  const hundredths = parseRateToHundredths(text);
  if (hundredths == null) {
    return VALIDATION_MESSAGES.invalidVatScale;
  }
  if (hundredths < 0n) {
    return VALIDATION_MESSAGES.invalidVatRate;
  }
  if (hundredths > MAX_VAT_HUNDREDTHS) {
    return VALIDATION_MESSAGES.invalidVatMax;
  }
  return null;
}

export function normalizeMoneyDisplay(value) {
  const cents = parseMoneyToCents(value);
  if (cents == null) {
    return String(value ?? "").trim();
  }
  return formatCents(cents);
}

export function normalizeVatRateDisplay(value) {
  const hundredths = parseRateToHundredths(value);
  if (hundredths == null) {
    return String(value ?? "").trim();
  }
  return formatCents(hundredths);
}
