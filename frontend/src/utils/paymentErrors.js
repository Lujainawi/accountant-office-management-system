import { ApiError } from "../api/client";
import { payments as paymentsText } from "../content/he";

export function getPaymentErrorMessage(error, fallback = paymentsText.errors.unexpected) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return null;
    }
    return error.message || fallback;
  }

  return fallback;
}
