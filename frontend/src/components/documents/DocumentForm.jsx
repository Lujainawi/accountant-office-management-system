import { useMemo, useState } from "react";
import FormField from "../FormField";
import ErrorMessage from "../ErrorMessage";
import PrimaryButton from "../PrimaryButton";
import SecondaryButton from "../SecondaryButton";
import MoneyDisplay from "../MoneyDisplay";
import { documents as documentsText } from "../../content/he";
import {
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  previewVatTotals,
} from "../../utils/documentForm";

export default function DocumentForm({
  mode,
  clients,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  serverError,
  fileRequired = false,
  fileHint,
  showFileField = false,
}) {
  const [values, setValues] = useState(initialValues);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preview = useMemo(
    () => previewVatTotals(values.amount_before_vat, values.vat_rate),
    [values.amount_before_vat, values.vat_rate],
  );

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const errors = {};
    if (!values.client_id) {
      errors.client_id = documentsText.validation.clientRequired;
    }
    if (!values.document_name.trim()) {
      errors.document_name = documentsText.validation.documentNameRequired;
    }
    if (!values.document_date) {
      errors.document_date = documentsText.validation.documentDateRequired;
    }
    if (!values.amount_before_vat.trim()) {
      errors.amount_before_vat = documentsText.validation.amountRequired;
    }
    if (fileRequired && !selectedFile) {
      errors.file = documentsText.errors.fileRequired;
    }
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values, selectedFile);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="document-form" onSubmit={handleSubmit} noValidate>
      {serverError ? <ErrorMessage message={serverError} /> : null}

      <section className="document-form__section">
        <h2 className="document-form__section-title">{documentsText.form.infoSection}</h2>
        <div className="document-form__grid">
          <FormField
            id="document-client"
            label={documentsText.fields.client}
            required
            error={fieldErrors.client_id}
          >
            <select
              id="document-client"
              className="form-field__input"
              value={values.client_id}
              onChange={(event) => updateField("client_id", event.target.value)}
            >
              <option value="">{documentsText.form.selectClient}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.client_name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="document-name"
            label={documentsText.fields.documentName}
            required
            error={fieldErrors.document_name}
          >
            <input
              id="document-name"
              className="form-field__input"
              value={values.document_name}
              onChange={(event) => updateField("document_name", event.target.value)}
            />
          </FormField>

          <FormField id="document-type" label={documentsText.fields.documentType} required>
            <select
              id="document-type"
              className="form-field__input"
              value={values.document_type}
              onChange={(event) => updateField("document_type", event.target.value)}
            >
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="document-date"
            label={documentsText.fields.documentDate}
            required
            error={fieldErrors.document_date}
          >
            <input
              id="document-date"
              type="date"
              className="form-field__input"
              value={values.document_date}
              onChange={(event) => updateField("document_date", event.target.value)}
            />
          </FormField>

          <FormField
            id="document-amount"
            label={documentsText.fields.amountBeforeVat}
            required
            error={fieldErrors.amount_before_vat}
          >
            <input
              id="document-amount"
              className="form-field__input"
              inputMode="decimal"
              value={values.amount_before_vat}
              onChange={(event) => updateField("amount_before_vat", event.target.value)}
            />
          </FormField>

          <FormField id="document-vat-rate" label={documentsText.fields.vatRate}>
            <input
              id="document-vat-rate"
              className="form-field__input"
              inputMode="decimal"
              value={values.vat_rate}
              onChange={(event) => updateField("vat_rate", event.target.value)}
            />
          </FormField>

          <FormField id="document-status" label={documentsText.fields.status} required>
            <select
              id="document-status"
              className="form-field__input"
              value={values.status}
              onChange={(event) => updateField("status", event.target.value)}
            >
              {DOCUMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="document-notes" label={documentsText.fields.notes} hint={null}>
            <textarea
              id="document-notes"
              className="form-field__input form-field__textarea"
              rows={4}
              value={values.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </FormField>
        </div>
      </section>

      {preview ? (
        <section className="document-form__preview" aria-live="polite">
          <p>
            {documentsText.fields.vatAmount}: <MoneyDisplay value={preview.vatAmount} />
          </p>
          <p>
            {documentsText.fields.totalAmount}: <MoneyDisplay value={preview.totalAmount} />
          </p>
        </section>
      ) : null}

      {showFileField ? (
        <section className="document-form__section">
          <h2 className="document-form__section-title">{documentsText.form.fileSection}</h2>
          <FormField
            id="document-file"
            label={documentsText.fields.file}
            required={fileRequired}
            error={fieldErrors.file}
            hint={fileHint}
          >
            <input
              id="document-file"
              type="file"
              className="form-field__input"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </FormField>
        </section>
      ) : null}

      <div className="page-actions">
        <PrimaryButton type="submit" disabled={isSubmitting}>
          {submitLabel}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel}>
          {documentsText.actions.cancel}
        </SecondaryButton>
      </div>
    </form>
  );
}
