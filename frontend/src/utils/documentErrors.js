import { ApiError } from "../api/client";
import { documents as documentsText } from "../content/he";

const DOCUMENT_DELETE_WITH_TASKS_MESSAGE =
  "לא ניתן למחוק מסמך שקשור למשימות. יש לעדכן או למחוק את המשימות הקשורות תחילה.";

export function getDocumentErrorMessage(error, fallback = documentsText.errors.unexpected) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return null;
    }
    if (error.status === 409 && error.message === DOCUMENT_DELETE_WITH_TASKS_MESSAGE) {
      return DOCUMENT_DELETE_WITH_TASKS_MESSAGE;
    }
    if (error.status === 409) {
      return error.message || fallback;
    }
    return error.message || fallback;
  }

  return fallback;
}
