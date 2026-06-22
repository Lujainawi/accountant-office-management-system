import { useEffect, useState } from "react";
import FormField from "../FormField";
import ErrorMessage from "../ErrorMessage";
import PrimaryButton from "../PrimaryButton";
import SecondaryButton from "../SecondaryButton";
import { listDocuments } from "../../api/documents";
import { tasks as tasksText } from "../../content/he";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../../utils/taskForm";
import { getDocumentErrorMessage } from "../../utils/documentErrors";

export default function TaskForm({
  clients,
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
    if (!values.client_id) {
      setDocuments([]);
      setDocumentsLoading(false);
      setDocumentsLoadError("");
      return;
    }

    let cancelled = false;

    async function loadDocuments() {
      setDocumentsLoading(true);
      setDocumentsLoadError("");

      try {
        const data = await listDocuments({ clientId: values.client_id });
        if (!cancelled) {
          setDocuments(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message = getDocumentErrorMessage(error, tasksText.errors.unexpected);
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
  }, [values.client_id]);

  function updateField(field, value) {
    if (field === "client_id") {
      setValues((current) => ({
        ...current,
        client_id: value,
        document_id: "",
      }));
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.document_id;
        return next;
      });
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const errors = {};
    if (!values.client_id) {
      errors.client_id = tasksText.validation.clientRequired;
    }
    if (!values.title.trim()) {
      errors.title = tasksText.validation.titleRequired;
    }
    return errors;
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

  const documentSelectDisabled = !values.client_id || documentsLoading || isSubmitting;
  const documentSelectLabel = documentsLoading
    ? tasksText.fields.documentLoading
    : tasksText.fields.document;

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {serverError ? <ErrorMessage message={serverError} /> : null}
      {documentsLoadError ? <ErrorMessage message={documentsLoadError} /> : null}

      <FormField label={tasksText.fields.client} htmlFor="task-client" error={fieldErrors.client_id} required>
        <select
          id="task-client"
          className="form-control"
          value={values.client_id}
          onChange={(event) => updateField("client_id", event.target.value)}
          disabled={isSubmitting}
        >
          <option value="">{uiSelectPlaceholder()}</option>
          {clients.map((client) => (
            <option key={client.id} value={String(client.id)}>
              {client.client_name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={documentSelectLabel} htmlFor="task-document">
        <select
          id="task-document"
          className="form-control"
          value={values.document_id}
          onChange={(event) => updateField("document_id", event.target.value)}
          disabled={documentSelectDisabled}
          aria-busy={documentsLoading}
        >
          <option value="">{tasksText.fields.noDocument}</option>
          {documents.map((document) => (
            <option key={document.id} value={String(document.id)}>
              {document.document_name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={tasksText.fields.title} htmlFor="task-title" error={fieldErrors.title} required>
        <input
          id="task-title"
          className="form-control"
          type="text"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label={tasksText.fields.description} htmlFor="task-description">
        <textarea
          id="task-description"
          className="form-control"
          rows={4}
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label={tasksText.fields.dueDate} htmlFor="task-due-date">
        <input
          id="task-due-date"
          className="form-control"
          type="date"
          value={values.due_date}
          onChange={(event) => updateField("due_date", event.target.value)}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label={tasksText.fields.priority} htmlFor="task-priority">
        <select
          id="task-priority"
          className="form-control"
          value={values.priority}
          onChange={(event) => updateField("priority", event.target.value)}
          disabled={isSubmitting}
        >
          {TASK_PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={tasksText.fields.status} htmlFor="task-status">
        <select
          id="task-status"
          className="form-control"
          value={values.status}
          onChange={(event) => updateField("status", event.target.value)}
          disabled={isSubmitting}
        >
          {TASK_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="form-actions">
        <PrimaryButton type="submit" disabled={isSubmitting || documentsLoading}>
          {submitLabel}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel} disabled={isSubmitting}>
          {tasksText.confirm.cancel}
        </SecondaryButton>
      </div>
    </form>
  );
}

function uiSelectPlaceholder() {
  return "—";
}
