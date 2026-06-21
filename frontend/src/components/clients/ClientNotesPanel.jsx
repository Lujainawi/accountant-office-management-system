import { useEffect, useState } from "react";
import FormField from "../FormField";
import PrimaryButton from "../PrimaryButton";
import { clients as clientsText } from "../../content/he";

export default function ClientNotesPanel({ clientId, initialNotes, onSaved }) {
  const { fields, workspace } = clientsText;
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    setNotes(initialNotes ?? "");
    setSaveError("");
    setSaveSuccess("");
  }, [clientId, initialNotes]);

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const updated = await onSaved(notes);
      setNotes(updated.notes ?? "");
      setSaveSuccess(workspace.notes.saveSuccess);
    } catch (error) {
      setSaveError(
        error?.message && typeof error.message === "string"
          ? error.message
          : workspace.notes.saveFailed,
      );
    } finally {
      setIsSaving(false);
    }
  }

  const trimmedNotes = notes.trim();
  const initialTrimmed = (initialNotes ?? "").trim();
  const hasChanges = trimmedNotes !== initialTrimmed;

  return (
    <section className="client-workspace__section" aria-labelledby="client-notes-title">
      <h2 id="client-notes-title" className="client-workspace__section-title">
        {fields.notes}
      </h2>

      <form className="client-notes-panel" onSubmit={handleSave}>
        <FormField id="client-notes" label={fields.notes} hint={fields.notesHint}>
          <textarea
            id="client-notes"
            className="client-notes-panel__textarea"
            rows={6}
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setSaveSuccess("");
            }}
            disabled={isSaving}
          />
        </FormField>

        <div className="client-notes-panel__actions">
          <PrimaryButton type="submit" disabled={isSaving || !hasChanges}>
            {workspace.notes.saveNotes}
          </PrimaryButton>
        </div>

        {saveSuccess ? (
          <p className="client-notes-panel__feedback client-notes-panel__feedback--success" aria-live="polite">
            {saveSuccess}
          </p>
        ) : null}

        {saveError ? (
          <p className="client-notes-panel__feedback client-notes-panel__feedback--error" role="alert">
            {saveError}
          </p>
        ) : null}
      </form>
    </section>
  );
}
