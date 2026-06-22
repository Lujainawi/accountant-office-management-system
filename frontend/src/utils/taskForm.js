import { tasks as tasksText } from "../content/he";

export const TASK_PRIORITY_OPTIONS = [
  { value: "low", label: tasksText.priorities.low },
  { value: "medium", label: tasksText.priorities.medium },
  { value: "high", label: tasksText.priorities.high },
  { value: "urgent", label: tasksText.priorities.urgent },
];

export const TASK_STATUS_OPTIONS = [
  { value: "open", label: tasksText.statuses.open },
  { value: "in_progress", label: tasksText.statuses.in_progress },
  { value: "done", label: tasksText.statuses.done },
];

export const EMPTY_TASK_FORM_VALUES = {
  client_id: "",
  document_id: "",
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  status: "open",
};

export function getTaskPriorityLabel(priority) {
  return tasksText.priorities[priority] ?? priority;
}

export function getTaskStatusLabel(status) {
  return tasksText.statuses[status] ?? status;
}

export function getTaskPriorityTone(priority) {
  if (priority === "urgent") {
    return "danger";
  }
  if (priority === "high") {
    return "warning";
  }
  return "neutral";
}

export function getTaskStatusTone(status) {
  if (status === "done") {
    return "success";
  }
  if (status === "in_progress") {
    return "warning";
  }
  return "neutral";
}

export function taskToFormValues(task) {
  return {
    client_id: String(task.client_id),
    document_id: task.document_id ? String(task.document_id) : "",
    title: task.title ?? "",
    description: task.description ?? "",
    due_date: task.due_date ?? "",
    priority: task.priority ?? "medium",
    status: task.status ?? "open",
  };
}

function normalizeOptionalText(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function buildCreatePayload(values) {
  const payload = {
    client_id: Number(values.client_id),
    title: values.title.trim(),
    priority: values.priority,
    status: values.status,
  };

  const description = normalizeOptionalText(values.description ?? "");
  if (description) {
    payload.description = description;
  }

  if (values.due_date) {
    payload.due_date = values.due_date;
  }

  if (values.document_id) {
    payload.document_id = Number(values.document_id);
  }

  return payload;
}

export function buildUpdatePayload(values, originalTask) {
  const payload = {};
  const original = taskToFormValues(originalTask);

  if (values.title.trim() !== original.title) {
    payload.title = values.title.trim();
  }

  const description = normalizeOptionalText(values.description ?? "");
  const originalDescription = normalizeOptionalText(original.description ?? "");
  if (description !== originalDescription) {
    payload.description = description;
  }

  if (values.due_date !== original.due_date) {
    payload.due_date = values.due_date || null;
  }

  if (values.priority !== original.priority) {
    payload.priority = values.priority;
  }

  if (values.status !== original.status) {
    payload.status = values.status;
  }

  if (values.client_id !== original.client_id) {
    payload.client_id = Number(values.client_id);
  }

  const documentId = values.document_id ? Number(values.document_id) : null;
  const originalDocumentId = original.document_id ? Number(original.document_id) : null;
  if (documentId !== originalDocumentId) {
    payload.document_id = documentId;
  }

  return payload;
}
