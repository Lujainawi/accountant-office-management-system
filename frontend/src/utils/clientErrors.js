import { ApiError } from "../api/client";
import { clients as clientsText } from "../content/he";

const CLIENT_DELETE_WITH_DOCUMENTS_MESSAGE =
  "לא ניתן למחוק לקוח שיש לו מסמכים קשורים. יש למחוק את המסמכים הקשורים תחילה.";
const CLIENT_DELETE_WITH_TASKS_MESSAGE =
  "לא ניתן למחוק לקוח שיש לו משימות קשורות. יש למחוק את המשימות הקשורות תחילה.";

export function getClientErrorMessage(error, fallback = clientsText.errors.unexpected) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return null;
    }
    if (error.status === 409) {
      if (error.message === CLIENT_DELETE_WITH_DOCUMENTS_MESSAGE) {
        return CLIENT_DELETE_WITH_DOCUMENTS_MESSAGE;
      }
      if (error.message === CLIENT_DELETE_WITH_TASKS_MESSAGE) {
        return CLIENT_DELETE_WITH_TASKS_MESSAGE;
      }
      return error.message || fallback;
    }
    return error.message || fallback;
  }

  return fallback;
}
