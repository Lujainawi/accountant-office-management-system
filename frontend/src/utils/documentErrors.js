import { ApiError } from "../api/client";
import { documents as documentsText } from "../content/he";

export function getDocumentErrorMessage(error, fallback = documentsText.errors.unexpected) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return null;
    }
    return error.message || fallback;
  }

  return fallback;
}
