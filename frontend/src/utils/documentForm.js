import { previewForwardVat, validateMoneyInput, validateVatRateInput } from "./vat";

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "invoice", label: "חשבונית" },
  { value: "receipt", label: "קבלה" },
  { value: "report", label: "דוח" },
  { value: "bank_document", label: "מסמך בנק" },
  { value: "other", label: "אחר" },
];

export const DOCUMENT_STATUS_OPTIONS = [
  { value: "new", label: "חדש" },
  { value: "in_progress", label: "בטיפול" },
  { value: "completed", label: "הושלם" },
  { value: "missing_information", label: "חסר מידע" },
];

export function getDocumentTypeLabel(value) {
  return DOCUMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getDocumentStatusLabel(value) {
  return DOCUMENT_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getDocumentStatusTone(status) {
  switch (status) {
    case "completed":
      return "success";
    case "missing_information":
      return "warning";
    case "in_progress":
      return "neutral";
    default:
      return "neutral";
  }
}

export function formatPolicyExtensions(extensions) {
  if (!extensions || extensions.length === 0) {
    return "—";
  }
  return extensions.map((ext) => ext.toUpperCase()).join(", ");
}

export function formatFileSize(bytes) {
  if (bytes == null) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function documentToFormValues(document) {
  return {
    client_id: String(document.client_id ?? ""),
    document_name: document.document_name ?? "",
    document_type: document.document_type ?? "invoice",
    document_date: document.document_date ?? "",
    amount_before_vat: document.amount_before_vat ?? "",
    vat_rate: document.vat_rate ?? "",
    status: document.status ?? "new",
    notes: document.notes ?? "",
  };
}

export const EMPTY_DOCUMENT_FORM_VALUES = {
  client_id: "",
  document_name: "",
  document_type: "invoice",
  document_date: "",
  amount_before_vat: "",
  vat_rate: "",
  status: "new",
  notes: "",
};

export function validateDocumentMoneyFields(values) {
  const errors = {};
  const amountError = validateMoneyInput(values.amount_before_vat, { required: true });
  if (amountError) {
    errors.amount_before_vat = amountError;
  }
  const vatError = validateVatRateInput(values.vat_rate, { required: true });
  if (vatError) {
    errors.vat_rate = vatError;
  }
  return errors;
}

export function hasDocumentChanges(values, initial) {
  if (String(values.client_id) !== String(initial.client_id ?? "")) {
    return true;
  }
  if (values.document_name.trim() !== (initial.document_name ?? "").trim()) {
    return true;
  }
  if (values.document_type !== (initial.document_type ?? "invoice")) {
    return true;
  }
  if (values.document_date !== (initial.document_date ?? "")) {
    return true;
  }
  if (values.amount_before_vat.trim() !== String(initial.amount_before_vat ?? "").trim()) {
    return true;
  }
  if (values.vat_rate.trim() !== String(initial.vat_rate ?? "").trim()) {
    return true;
  }
  if (values.status !== (initial.status ?? "new")) {
    return true;
  }
  const newNotes = values.notes.trim() || null;
  const oldNotes = (initial.notes ?? "").trim() || null;
  if (newNotes !== oldNotes) {
    return true;
  }
  return false;
}

export function buildCreateFormData(values, file) {
  const formData = new FormData();
  formData.append("client_id", values.client_id);
  formData.append("document_name", values.document_name.trim());
  formData.append("document_type", values.document_type);
  formData.append("document_date", values.document_date);
  formData.append("amount_before_vat", values.amount_before_vat.trim());
  formData.append("vat_rate", values.vat_rate.trim());
  formData.append("status", values.status);
  if (values.notes && values.notes.trim()) {
    formData.append("notes", values.notes.trim());
  }
  formData.append("file", file);
  return formData;
}

export function buildUpdatePayload(values) {
  const payload = {
    amount_before_vat: values.amount_before_vat.trim(),
    vat_rate: values.vat_rate.trim(),
  };

  if (values.client_id) {
    payload.client_id = Number(values.client_id);
  }
  if (values.document_name.trim()) {
    payload.document_name = values.document_name.trim();
  }
  if (values.document_type) {
    payload.document_type = values.document_type;
  }
  if (values.document_date) {
    payload.document_date = values.document_date;
  }
  if (values.status) {
    payload.status = values.status;
  }

  const notes = values.notes.trim();
  payload.notes = notes || null;

  return payload;
}

export function previewVatTotals(amountBeforeVat, vatRate) {
  return previewForwardVat(amountBeforeVat, vatRate);
}

export { validateMoneyInput, validateVatRateInput };
