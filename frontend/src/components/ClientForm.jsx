import { useState } from "react";
import FormField from "./FormField";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import ErrorMessage from "./ErrorMessage";
import {
  CLIENT_STATUS_OPTIONS,
  CLIENT_TYPE_OPTIONS,
  EMPTY_FORM_VALUES,
  buildCreatePayload,
  buildUpdatePayload,
  validateOptionalEmail,
} from "../utils/clientForm";
import { clients as clientsText, ui } from "../content/he";

export default function ClientForm({
  mode,
  initialValues = EMPTY_FORM_VALUES,
  submitLabel,
  onSubmit,
  onCancel,
  serverError = "",
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(fieldName, value) {
    setValues((current) => ({ ...current, [fieldName]: value }));
    setFieldErrors((current) => {
      if (!current[fieldName]) {
        return current;
      }
      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  }

  function validateForm() {
    const errors = {};

    if (!values.client_name.trim()) {
      errors.client_name = clientsText.validation.clientNameRequired;
    }

    const emailResult = validateOptionalEmail(values.email);
    if (emailResult.error) {
      errors.email = emailResult.error;
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const emailResult = validateOptionalEmail(values.email);
        if (emailResult.error) {
          setFieldErrors({ email: emailResult.error });
          return;
        }
        await onSubmit(buildCreatePayload(values));
        return;
      }

      const { payload, error } = buildUpdatePayload(values, initialValues);
      if (error) {
        setFieldErrors({ email: error });
        return;
      }

      if (Object.keys(payload).length === 0) {
        setFormError(clientsText.validation.noChanges);
        return;
      }

      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayedError = serverError || formError;

  return (
    <form className="client-form" onSubmit={handleSubmit} noValidate>
      <div className="client-form__grid">
        <FormField
          id="client-name"
          label={clientsText.fields.clientName}
          required
          error={fieldErrors.client_name}
        >
          <input
            id="client-name"
            className="form-field__input"
            type="text"
            value={values.client_name}
            onChange={(event) => updateField("client_name", event.target.value)}
            required
          />
        </FormField>

        <FormField id="business-name" label={clientsText.fields.businessName} error={fieldErrors.business_name}>
          <input
            id="business-name"
            className="form-field__input"
            type="text"
            value={values.business_name}
            onChange={(event) => updateField("business_name", event.target.value)}
          />
        </FormField>

        <FormField id="client-type" label={clientsText.fields.clientType} required>
          <select
            id="client-type"
            className="form-field__input"
            value={values.client_type}
            onChange={(event) => updateField("client_type", event.target.value)}
          >
            {CLIENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="client-status" label={clientsText.fields.status} required>
          <select
            id="client-status"
            className="form-field__input"
            value={values.status}
            onChange={(event) => updateField("status", event.target.value)}
          >
            {CLIENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="client-phone" label={clientsText.fields.phone} error={fieldErrors.phone}>
          <input
            id="client-phone"
            className="form-field__input"
            type="tel"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </FormField>

        <FormField id="client-email" label={clientsText.fields.email} error={fieldErrors.email}>
          <input
            id="client-email"
            className="form-field__input"
            type="text"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </FormField>

        <FormField id="business-id" label={clientsText.fields.businessId} error={fieldErrors.business_id}>
          <input
            id="business-id"
            className="form-field__input"
            type="text"
            value={values.business_id}
            onChange={(event) => updateField("business_id", event.target.value)}
          />
        </FormField>

        <FormField id="client-address" label={clientsText.fields.address} error={fieldErrors.address}>
          <textarea
            id="client-address"
            className="form-field__input form-field__textarea"
            rows={3}
            value={values.address}
            onChange={(event) => updateField("address", event.target.value)}
          />
        </FormField>

        <FormField
          id="client-notes"
          label={clientsText.fields.notes}
          hint={clientsText.fields.notesHint}
          error={fieldErrors.notes}
        >
          <textarea
            id="client-notes"
            className="form-field__input form-field__textarea"
            rows={4}
            value={values.notes}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </FormField>
      </div>

      {displayedError ? <ErrorMessage message={displayedError} /> : null}

      <div className="client-form__actions">
        {onCancel ? (
          <SecondaryButton type="button" onClick={onCancel}>
            {clientsText.actions.cancel}
          </SecondaryButton>
        ) : null}
        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? ui.loading : submitLabel}
        </PrimaryButton>
      </div>
    </form>
  );
}
