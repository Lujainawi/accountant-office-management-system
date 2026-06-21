export const OPTIONAL_CLEARABLE_FIELDS = [
  "business_name",
  "phone",
  "email",
  "business_id",
  "address",
  "notes",
];

export const CLIENT_TYPE_OPTIONS = [
  { value: "private_client", label: "לקוח פרטי" },
  { value: "exempt_dealer", label: "עוסק פטור" },
  { value: "authorized_dealer", label: "עוסק מורשה" },
  { value: "company", label: "חברה" },
  { value: "other", label: "אחר" },
];

export const CLIENT_STATUS_OPTIONS = [
  { value: "active", label: "פעיל" },
  { value: "inactive", label: "לא פעיל" },
];

export function getClientTypeLabel(value) {
  return CLIENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getClientStatusLabel(value) {
  return CLIENT_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getClientStatusTone(status) {
  return status === "active" ? "success" : "neutral";
}

export function validateOptionalEmail(value) {
  if (!value || !value.trim()) {
    return { value: null, error: null };
  }

  const normalized = value.trim().toLowerCase();
  const invalidMessage = "כתובת אימייל אינה תקינה.";

  if (normalized.includes(" ")) {
    return { value: null, error: invalidMessage };
  }
  if ((normalized.match(/@/g) || []).length !== 1) {
    return { value: null, error: invalidMessage };
  }

  const [local, domain] = normalized.split("@");
  if (!local || !domain) {
    return { value: null, error: invalidMessage };
  }
  if (local.startsWith(".") || local.endsWith(".")) {
    return { value: null, error: invalidMessage };
  }
  if (domain.startsWith(".") || domain.endsWith(".")) {
    return { value: null, error: invalidMessage };
  }
  if (normalized.includes("..")) {
    return { value: null, error: invalidMessage };
  }

  return { value: normalized, error: null };
}

function normalizeOptionalText(value) {
  if (!value || !value.trim()) {
    return null;
  }
  return value.trim();
}

export function buildCreatePayload(values) {
  const emailResult = validateOptionalEmail(values.email);

  return {
    client_name: values.client_name.trim(),
    business_name: normalizeOptionalText(values.business_name),
    phone: normalizeOptionalText(values.phone),
    email: emailResult.value,
    business_id: normalizeOptionalText(values.business_id),
    client_type: values.client_type,
    address: normalizeOptionalText(values.address),
    status: values.status,
    notes: normalizeOptionalText(values.notes),
  };
}

export function buildUpdatePayload(values, initial) {
  const payload = {};
  const clientName = values.client_name.trim();

  if (clientName !== initial.client_name) {
    payload.client_name = clientName;
  }

  if (values.client_type !== initial.client_type) {
    payload.client_type = values.client_type;
  }

  if (values.status !== initial.status) {
    payload.status = values.status;
  }

  for (const field of OPTIONAL_CLEARABLE_FIELDS) {
    let newVal;
    if (field === "email") {
      const emailResult = validateOptionalEmail(values.email);
      if (emailResult.error) {
        return { payload: null, error: emailResult.error };
      }
      newVal = emailResult.value;
    } else {
      newVal = normalizeOptionalText(values[field]);
    }

    const oldVal = initial[field] ?? null;
    const normalizedOld = oldVal === "" ? null : oldVal;

    if (newVal !== normalizedOld) {
      payload[field] = newVal;
    }
  }

  return { payload, error: null };
}

export function clientToFormValues(client) {
  return {
    client_name: client.client_name ?? "",
    business_name: client.business_name ?? "",
    phone: client.phone ?? "",
    email: client.email ?? "",
    business_id: client.business_id ?? "",
    client_type: client.client_type ?? "private_client",
    address: client.address ?? "",
    status: client.status ?? "active",
    notes: client.notes ?? "",
  };
}

export const EMPTY_FORM_VALUES = {
  client_name: "",
  business_name: "",
  phone: "",
  email: "",
  business_id: "",
  client_type: "private_client",
  address: "",
  status: "active",
  notes: "",
};
