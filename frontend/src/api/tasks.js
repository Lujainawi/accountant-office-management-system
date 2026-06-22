import { apiFetch } from "./client";

function buildQueryString({ clientId, status, priority, limit } = {}) {
  const params = new URLSearchParams();

  if (clientId) {
    params.set("client_id", String(clientId));
  }
  if (status) {
    params.set("status", status);
  }
  if (priority) {
    params.set("priority", priority);
  }
  if (limit) {
    params.set("limit", String(limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listTasks(filters = {}) {
  return apiFetch(`/api/tasks${buildQueryString(filters)}`);
}

export function getTask(id) {
  return apiFetch(`/api/tasks/${id}`);
}

export function createTask(payload) {
  return apiFetch("/api/tasks", {
    method: "POST",
    body: payload,
  });
}

export function updateTask(id, payload) {
  return apiFetch(`/api/tasks/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteTask(id) {
  return apiFetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
}
