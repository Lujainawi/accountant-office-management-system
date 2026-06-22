import PrimaryButton from "../PrimaryButton";
import SecondaryButton from "../SecondaryButton";
import ErrorMessage from "../ErrorMessage";
import { integrations as integrationsText } from "../../content/he";

export default function EmailPresetSelector({
  presets,
  selectedPreset,
  onPresetChange,
  preview,
  isLoading,
  errorMessage,
  onGeneratePreview,
  onCopy,
  copyFeedback,
}) {
  return (
    <section className="integration-preset-panel" aria-labelledby="email-preset-title">
      <h2 id="email-preset-title" className="integration-preset-panel__title">
        {integrationsText.email.presetSectionTitle}
      </h2>
      <p className="integration-preset-panel__description">
        {integrationsText.email.presetSectionDescription}
      </p>

      <label className="form-field" htmlFor="email-demo-preset">
        <span className="form-field__label">{integrationsText.email.presetLabel}</span>
        <select
          id="email-demo-preset"
          className="form-field__input"
          value={selectedPreset}
          onChange={(event) => onPresetChange(event.target.value)}
        >
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <div className="page-actions">
        <PrimaryButton type="button" onClick={onGeneratePreview} disabled={isLoading}>
          {isLoading
            ? integrationsText.actions.loadingSample
            : integrationsText.email.generatePreview}
        </PrimaryButton>
        {preview ? (
          <SecondaryButton type="button" onClick={onCopy}>
            {integrationsText.email.copySample}
          </SecondaryButton>
        ) : null}
      </div>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      {copyFeedback ? (
        <p className="form-success" role="status" aria-live="polite">
          {copyFeedback}
        </p>
      ) : null}

      {preview ? (
        <div className="integration-sample-result">
          <p className="integration-sample-result__label" role="note">
            {integrationsText.sampleResultLabel}
          </p>
          <p className="integration-sample-result__disclaimer" role="note">
            {preview.disclaimer}
          </p>
          <dl className="integration-sample-result__details">
            <div>
              <dt>{integrationsText.email.subjectLabel}</dt>
              <dd>{preview.subject}</dd>
            </div>
          </dl>
          <pre className="integration-sample-result__body">{preview.body}</pre>
        </div>
      ) : null}
    </section>
  );
}
