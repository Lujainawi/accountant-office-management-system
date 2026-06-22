import { useEffect, useState } from "react";
import FormField from "../FormField";
import ErrorMessage from "../ErrorMessage";
import PrimaryButton from "../PrimaryButton";
import SecondaryButton from "../SecondaryButton";
import { listDocuments } from "../../api/documents";
import { payments as paymentsText } from "../../content/he";
import {
  PAID_STATUSES,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  validatePaymentFormValues,
} from "../../utils/paymentForm";
import { getDocumentErrorMessage } from "../../utils/documentErrors";

export default function PaymentForm({
  clientName,
  clientId,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  serverError,
}) {
  const [values, setValues] = useState(initialValues);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsLoadError, setDocumentsLoadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!clientId) {
      setDocuments([]);
      return undefined;
    }

    let cancelled = false;

    async function loadDocuments() {
      setDocumentsLoading(true);
      setDocumentsLoadError("");

      try {
        const data = await listDocuments({ clientId });
        if (!cancelled) {
          setDocuments(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message = getDocumentErrorMessage(error, paymentsText.errors.unexpected);
          if (message) {
            setDocumentsLoadError(message);
          }
          setDocuments([]);
        }
      } finally {
        if (!cancelled) {
          setDocumentsLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    return validatePaymentFormValues(values);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (documentsLoading) {
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  const methodRequired = PAID_STATUSES.has(values.status);
  const dateRequired = PAID_STATUSES.has(values.status);

  return (
    <form className="payment-form" onSubmit={handleSubmit} noValidate>
      <p className="payment-form__disclaimer">{paymentsText.disclaimer}</p>

      {serverError ? <ErrorMessage message={serverError} /> : null}
      {documentsLoadError ? <ErrorMessage message={documentsLoadError} /> : null}

      <FormField label={paymentsText.fields.client} htmlFor="payment-client">
        <input
          id="payment-client"
          className="form-control"
          type="text"
          value={clientName}
          readOnly
          aria-readonly="true"
        />
      </FormField>

      <FormField label={paymentsText.fields.amount} htmlFor="payment-amount" error={fieldErrors.amount} required>
        <input
          id="payment-amount"
          className="form-control"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={values.amount}
          onChange={(event) => updateField("amount", event.target.value)}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label={paymentsText.fields.status} htmlFor="payment-status" required>
        <select
          id="payment-status"
          className="form-control"
          value={values.status}
          onChange={(event) => updateField("status", event.target.value)}
          disabled={isSubmitting}
        >
          {PAYMENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label={paymentsText.fields.paymentMethod}
        htmlFor="payment-method"
        error={fieldErrors.payment_method}
        required={methodRequired}
      >
        <select
          id="payment-method"
          className="form-control"
          value={values.payment_method}
          onChange={(event) => updateField("payment_method", event.target.value)}
          disabled={isSubmitting}
        >
          <option value="">{paymentsText.fields.noMethod}</option>
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label={paymentsText.fields.paymentDate}
        htmlFor="payment-date"
        error={fieldErrors.payment_date}
        required={dateRequired}
      >
        <input
          id="payment-date"
          className="form-control"
          type="date"
          value={values.payment_date}
          onChange={(event) => updateField("payment_date", event.target.value)}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField
        label={paymentsText.fields.paymentPeriod}
        htmlFor="payment-period"
        error={fieldErrors.payment_period}
      >
        <input
          id="payment-period"
          className="form-control"
          type="text"
          maxLength={100}
          value={values.payment_period}
          onChange={(event) => updateField("payment_period", event.target.value)}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label={paymentsText.fields.document} htmlFor="payment-document">
        <select
          id="payment-document"
          className="form-control"
          value={values.document_id}
          onChange={(event) => updateField("document_id", event.target.value)}
          disabled={isSubmitting || documentsLoading}
          aria-busy={documentsLoading}
        >
          <option value="">{paymentsText.fields.noDocument}</option>
          {documents.map((document) => (
            <option key={document.id} value={String(document.id)}>
              {document.document_name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={paymentsText.fields.notes} htmlFor="payment-notes">
        <textarea
          id="payment-notes"
          className="form-control"
          rows={4}
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          disabled={isSubmitting}
        />
      </FormField>

      <div className="form-actions">
        <PrimaryButton type="submit" disabled={isSubmitting || documentsLoading}>
          {submitLabel}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel} disabled={isSubmitting}>
          {paymentsText.actions.cancel}
        </SecondaryButton>
      </div>
    </form>
  );
}
