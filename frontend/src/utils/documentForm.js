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

export function buildCreateFormData(values, file) {
  const formData = new FormData();
  formData.append("client_id", values.client_id);
  formData.append("document_name", values.document_name.trim());
  formData.append("document_type", values.document_type);
  formData.append("document_date", values.document_date);
  formData.append("amount_before_vat", values.amount_before_vat.trim());
  formData.append("status", values.status);
  if (values.vat_rate && values.vat_rate.trim()) {
    formData.append("vat_rate", values.vat_rate.trim());
  }
  if (values.notes && values.notes.trim()) {
    formData.append("notes", values.notes.trim());
  }
  formData.append("file", file);
  return formData;
}

export function buildUpdatePayload(values, initial) {
  const payload = {};

  if (String(values.client_id) !== String(initial.client_id)) {
    payload.client_id = Number(values.client_id);
  }
  if (values.document_name.trim() !== initial.document_name) {
    payload.document_name = values.document_name.trim();
  }
  if (values.document_type !== initial.document_type) {
    payload.document_type = values.document_type;
  }
  if (values.document_date !== initial.document_date) {
    payload.document_date = values.document_date;
  }
  if (values.amount_before_vat.trim() !== initial.amount_before_vat) {
    payload.amount_before_vat = values.amount_before_vat.trim();
  }
  if (values.vat_rate.trim() !== (initial.vat_rate ?? "").trim()) {
    if (values.vat_rate.trim()) {
      payload.vat_rate = values.vat_rate.trim();
    }
  }
  if (values.status !== initial.status) {
    payload.status = values.status;
  }

  const newNotes = values.notes.trim() || null;
  const oldNotes = initial.notes ?? null;
  if (newNotes !== oldNotes) {
    payload.notes = newNotes;
  }

  return payload;
}

export function previewVatTotals(amountBeforeVat, vatRate) {
  const amount = Number(amountBeforeVat);
  const rate = Number(vatRate);
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || amount < 0 || rate < 0) {
    return null;
  }
  const vatAmount = Math.round(((amount * rate) / 100) * 100) / 100;
  const totalAmount = Math.round((amount + vatAmount) * 100) / 100;
  return {
    vatAmount: vatAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
}
