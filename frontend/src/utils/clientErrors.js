import { ApiError } from "../api/client";
import { clients as clientsText } from "../content/he";

export function getClientErrorMessage(error, fallback = clientsText.errors.unexpected) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return null;
    }
    return error.message || fallback;
  }

  return fallback;
}
