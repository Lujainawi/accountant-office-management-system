import { ApiError } from "../api/client";
import { tasks as tasksText } from "../content/he";

export function getTaskErrorMessage(error, fallback = tasksText.errors.unexpected) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return null;
    }
    return error.message || fallback;
  }

  return fallback;
}
