import { payments as paymentsText } from "../content/he";

export const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: paymentsText.statuses.unpaid },
  { value: "paid", label: paymentsText.statuses.paid },
  { value: "partially_paid", label: paymentsText.statuses.partially_paid },
  { value: "pending", label: paymentsText.statuses.pending },
  { value: "failed", label: paymentsText.statuses.failed },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: paymentsText.methods.cash },
  { value: "bank_transfer", label: paymentsText.methods.bank_transfer },
  { value: "check", label: paymentsText.methods.check },
  { value: "bit", label: paymentsText.methods.bit },
  { value: "standing_order", label: paymentsText.methods.standing_order },
  { value: "other", label: paymentsText.methods.other },
];

export const PAID_STATUSES = new Set(["paid", "partially_paid"]);

export const EMPTY_PAYMENT_FORM_VALUES = {
  amount: "",
  status: "unpaid",
  payment_method: "",
  payment_date: "",
  payment_period: "",
  notes: "",
  document_id: "",
};

export function getPaymentStatusLabel(status) {
  return paymentsText.statuses[status] ?? status;
}

export function getPaymentMethodLabel(method) {
  if (!method) {
    return null;
  }
  return paymentsText.methods[method] ?? method;
}

export function getPaymentStatusTone(status) {
  if (status === "paid") {
    return "success";
  }
  if (status === "partially_paid") {
    return "warning";
  }
  if (status === "failed") {
    return "danger";
  }
  if (status === "pending") {
    return "warning";
  }
  return "neutral";
}

export function paymentToFormValues(payment) {
  return {
    amount: payment.amount ?? "",
    status: payment.status ?? "unpaid",
    payment_method: payment.payment_method ?? "",
    payment_date: payment.payment_date ?? "",
    payment_period: payment.payment_period ?? "",
    notes: payment.notes ?? "",
    document_id: payment.document_id ? String(payment.document_id) : "",
  };
}

function normalizeOptionalText(value) {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
}

function requiresMethodAndDate(status) {
  return PAID_STATUSES.has(status);
}

function validateAmountString(amount) {
  const trimmed = amount.trim();
  if (!trimmed) {
    return paymentsText.validation.amountRequired;
  }
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return paymentsText.validation.amountInvalid;
  }
  if (trimmed.startsWith("-")) {
    return paymentsText.validation.amountNegative;
  }
  const decimalPart = trimmed.includes(".") ? trimmed.split(".")[1] : "";
  if (decimalPart.length > 2) {
    return paymentsText.validation.amountScale;
  }
  return null;
}

export function validatePaymentFormValues(values) {
  const errors = {};
  const amountError = validateAmountString(values.amount ?? "");
  if (amountError) {
    errors.amount = amountError;
  }

  if (requiresMethodAndDate(values.status)) {
    if (!values.payment_method) {
      errors.payment_method = paymentsText.validation.methodRequired;
    }
    if (!values.payment_date) {
      errors.payment_date = paymentsText.validation.dateRequired;
    }
  }

  if ((values.payment_period ?? "").length > 100) {
    errors.payment_period = paymentsText.validation.periodTooLong;
  }

  return errors;
}

export function buildCreatePayload(clientId, values) {
  const payload = {
    client_id: clientId,
    amount: values.amount.trim(),
    status: values.status,
  };

  if (values.document_id) {
    payload.document_id = Number(values.document_id);
  }

  if (values.payment_method) {
    payload.payment_method = values.payment_method;
  }

  if (values.payment_date) {
    payload.payment_date = values.payment_date;
  }

  const paymentPeriod = normalizeOptionalText(values.payment_period);
  if (paymentPeriod) {
    payload.payment_period = paymentPeriod;
  }

  const notes = normalizeOptionalText(values.notes);
  if (notes) {
    payload.notes = notes;
  }

  return payload;
}

export function buildUpdatePayload(values, originalPayment) {
  const payload = {};
  const original = paymentToFormValues(originalPayment);

  if (values.amount.trim() !== original.amount) {
    payload.amount = values.amount.trim();
  }

  if (values.status !== original.status) {
    payload.status = values.status;
  }

  const documentId = values.document_id ? Number(values.document_id) : null;
  const originalDocumentId = original.document_id ? Number(original.document_id) : null;
  if (documentId !== originalDocumentId) {
    payload.document_id = documentId;
  }

  const method = values.payment_method || null;
  const originalMethod = original.payment_method || null;
  if (method !== originalMethod) {
    payload.payment_method = method;
  }

  if (values.payment_date !== original.payment_date) {
    payload.payment_date = values.payment_date || null;
  }

  const paymentPeriod = normalizeOptionalText(values.payment_period);
  const originalPeriod = normalizeOptionalText(original.payment_period);
  if (paymentPeriod !== originalPeriod) {
    payload.payment_period = paymentPeriod;
  }

  const notes = normalizeOptionalText(values.notes);
  const originalNotes = normalizeOptionalText(original.notes);
  if (notes !== originalNotes) {
    payload.notes = notes;
  }

  return payload;
}
