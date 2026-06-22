import { useEffect, useMemo, useState } from "react";
import FormField from "../FormField";
import PrimaryButton from "../PrimaryButton";
import SecondaryButton from "../SecondaryButton";
import ErrorMessage from "../ErrorMessage";
import { settings as settingsText } from "../../content/he";
import { formatPolicyExtensions } from "../../utils/documentForm";
import { validateVatRateInput } from "../../utils/vat";

export const SECURE_EXTENSION_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "jpeg", label: "JPEG" },
  { value: "docx", label: "DOCX" },
  { value: "xlsx", label: "XLSX" },
];

const SECURE_EXTENSION_VALUES = new Set(
  SECURE_EXTENSION_OPTIONS.map((option) => option.value),
);

function settingsToFormValues(settings) {
  const selected = new Set(settings.effective_allowed_file_extensions ?? []);
  if (selected.size === 0) {
    for (const extension of settings.allowed_file_extensions ?? []) {
      if (SECURE_EXTENSION_VALUES.has(extension)) {
        selected.add(extension);
      }
    }
  }

  return {
    accountant_name: settings.accountant_name ?? "",
    office_name: settings.office_name ?? "",
    default_vat_rate: settings.default_vat_rate ?? "",
    default_currency: settings.default_currency ?? "ILS",
    allowed_file_extensions: SECURE_EXTENSION_OPTIONS.map((option) => option.value).filter(
      (value) => selected.has(value),
    ),
    configured_file_extensions: settings.allowed_file_extensions ?? [],
    effective_file_extensions: settings.effective_allowed_file_extensions ?? [],
  };
}

export default function SettingsForm({ initialSettings, onSubmit, serverError = "" }) {
  const savedValues = useMemo(
    () => settingsToFormValues(initialSettings),
    [initialSettings],
  );
  const [values, setValues] = useState(savedValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(savedValues);
    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");
  }, [savedValues]);

  const hasUnsupportedConfigured = values.configured_file_extensions.some(
    (extension) => !SECURE_EXTENSION_VALUES.has(extension),
  );
  const effectiveEmpty = values.effective_file_extensions.length === 0;
  const showLegacyWarning = hasUnsupportedConfigured || effectiveEmpty;

  const extensionSelectionValid = values.allowed_file_extensions.length > 0;

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccessMessage("");
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function toggleExtension(extension) {
    setSuccessMessage("");
    setValues((current) => {
      const selected = new Set(current.allowed_file_extensions);
      if (selected.has(extension)) {
        selected.delete(extension);
      } else {
        selected.add(extension);
      }
      return {
        ...current,
        allowed_file_extensions: SECURE_EXTENSION_OPTIONS.map((option) => option.value).filter(
          (value) => selected.has(value),
        ),
      };
    });
    setFieldErrors((current) => {
      if (!current.allowed_file_extensions) {
        return current;
      }
      const next = { ...current };
      delete next.allowed_file_extensions;
      return next;
    });
  }

  function validate() {
    const errors = {};
    if (!values.accountant_name.trim()) {
      errors.accountant_name = settingsText.validation.accountantNameRequired;
    }
    if (!values.office_name.trim()) {
      errors.office_name = settingsText.validation.officeNameRequired;
    }
    const vatError = validateVatRateInput(values.default_vat_rate, { required: true });
    if (vatError) {
      errors.default_vat_rate = vatError;
    }
    if (!extensionSelectionValid) {
      errors.allowed_file_extensions = settingsText.validation.extensionsRequired;
    }
    return errors;
  }

  function handleCancel() {
    setValues(savedValues);
    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        accountant_name: values.accountant_name.trim(),
        office_name: values.office_name.trim(),
        default_vat_rate: values.default_vat_rate.trim(),
        allowed_file_extensions: values.allowed_file_extensions,
      };
      const updated = await onSubmit(payload);
      const nextValues = settingsToFormValues(updated);
      setValues(nextValues);
      setSuccessMessage(settingsText.messages.saveSuccess);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setFormError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayedError = serverError || formError;

  return (
    <form className="settings-form" onSubmit={handleSubmit} noValidate>
      {displayedError ? <ErrorMessage message={displayedError} /> : null}
      {successMessage ? (
        <p className="form-success" role="status" aria-live="polite">
          {successMessage}
        </p>
      ) : null}

      <p className="settings-form__info-callout">{settingsText.vatPolicyNotice}</p>

      <section className="settings-form__section">
        <h2 className="settings-form__section-title">{settingsText.sections.identity}</h2>
        <div className="settings-form__grid">
          <FormField
            id="settings-accountant-name"
            label={settingsText.fields.accountantName}
            required
            error={fieldErrors.accountant_name}
          >
            <input
              id="settings-accountant-name"
              className="form-field__input"
              value={values.accountant_name}
              onChange={(event) => updateField("accountant_name", event.target.value)}
            />
          </FormField>

          <FormField
            id="settings-office-name"
            label={settingsText.fields.officeName}
            required
            error={fieldErrors.office_name}
          >
            <input
              id="settings-office-name"
              className="form-field__input"
              value={values.office_name}
              onChange={(event) => updateField("office_name", event.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section className="settings-form__section">
        <h2 className="settings-form__section-title">{settingsText.sections.vatCurrency}</h2>
        <div className="settings-form__grid">
          <FormField
            id="settings-default-vat-rate"
            label={settingsText.fields.defaultVatRate}
            required
            error={fieldErrors.default_vat_rate}
          >
            <input
              id="settings-default-vat-rate"
              className="form-field__input"
              inputMode="decimal"
              value={values.default_vat_rate}
              onChange={(event) => updateField("default_vat_rate", event.target.value)}
            />
          </FormField>

          <FormField
            id="settings-default-currency"
            label={settingsText.fields.defaultCurrency}
            hint={settingsText.fields.defaultCurrencyHint}
          >
            <input
              id="settings-default-currency"
              className="form-field__input form-field__input--readonly"
              value={values.default_currency}
              readOnly
              aria-readonly="true"
            />
          </FormField>
        </div>
      </section>

      <section className="settings-form__section">
        <h2 className="settings-form__section-title">{settingsText.sections.files}</h2>
        <p className="settings-form__section-description">{settingsText.extensionsDescription}</p>
        {showLegacyWarning ? (
          <p className="settings-form__warning" role="alert">
            {settingsText.messages.legacyExtensionsWarning}
          </p>
        ) : null}
        <p className="settings-form__effective-policy">
          {settingsText.messages.effectiveExtensionsTemplate.replace(
            "{extensions}",
            formatPolicyExtensions(values.effective_file_extensions),
          )}
        </p>
        <fieldset className="settings-form__extensions">
          <legend className="settings-form__extensions-legend">
            {settingsText.fields.allowedExtensions}
          </legend>
          {SECURE_EXTENSION_OPTIONS.map((option) => (
            <label key={option.value} className="settings-form__checkbox">
              <input
                type="checkbox"
                checked={values.allowed_file_extensions.includes(option.value)}
                onChange={() => toggleExtension(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        {fieldErrors.allowed_file_extensions ? (
          <p className="form-field__error" role="alert">
            {fieldErrors.allowed_file_extensions}
          </p>
        ) : null}
      </section>

      <div className="page-actions">
        <PrimaryButton type="submit" disabled={isSubmitting || !extensionSelectionValid}>
          {settingsText.actions.save}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={handleCancel}>
          {settingsText.actions.cancel}
        </SecondaryButton>
      </div>
    </form>
  );
}
