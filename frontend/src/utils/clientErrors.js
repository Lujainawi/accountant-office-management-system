import { ApiError } from "../api/client";
import { clients as clientsText } from "../content/he";

const CLIENT_DELETE_WITH_DOCUMENTS_MESSAGE =
  "לא ניתן למחוק לקוח שיש לו מסמכים קשורים. יש למחוק את המסמכים הקשורים תחילה.";

export function getClientErrorMessage(error, fallback = clientsText.errors.unexpected) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return null;
    }
    if (error.status === 409) {
      return CLIENT_DELETE_WITH_DOCUMENTS_MESSAGE;
    }
    return error.message || fallback;
  }

  return fallback;
}
