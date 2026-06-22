import PrimaryButton from "../PrimaryButton";
import ErrorMessage from "../ErrorMessage";
import MoneyDisplay from "../MoneyDisplay";
import { integrations as integrationsText } from "../../content/he";

export default function OcrPresetSelector({
  presets,
  selectedPreset,
  onPresetChange,
  result,
  isLoading,
  errorMessage,
  onSimulate,
}) {
  return (
    <section className="integration-preset-panel" aria-labelledby="ocr-preset-title">
      <h2 id="ocr-preset-title" className="integration-preset-panel__title">
        {integrationsText.ocr.presetSectionTitle}
      </h2>
      <p className="integration-preset-panel__description">
        {integrationsText.ocr.presetSectionDescription}
      </p>
      <p className="integration-preset-panel__warning" role="note">
        {integrationsText.ocr.noFileNotice}
      </p>

      <label className="form-field" htmlFor="ocr-demo-preset">
        <span className="form-field__label">{integrationsText.ocr.presetLabel}</span>
        <select
          id="ocr-demo-preset"
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
        <PrimaryButton type="button" onClick={onSimulate} disabled={isLoading}>
          {isLoading
            ? integrationsText.actions.loadingSample
            : integrationsText.ocr.simulateExtraction}
        </PrimaryButton>
      </div>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      {result ? (
        <div className="integration-sample-result">
          <p className="integration-sample-result__label" role="note">
            {integrationsText.sampleResultLabel}
          </p>
          <p className="integration-sample-result__disclaimer" role="note">
            {result.disclaimer}
          </p>
          <dl className="integration-sample-result__grid">
            <div>
              <dt>{integrationsText.ocr.fields.vendorName}</dt>
              <dd>{result.extracted_fields.vendor_name}</dd>
            </div>
            <div>
              <dt>{integrationsText.ocr.fields.documentName}</dt>
              <dd>{result.extracted_fields.document_name}</dd>
            </div>
            <div>
              <dt>{integrationsText.ocr.fields.documentDate}</dt>
              <dd>{result.extracted_fields.document_date}</dd>
            </div>
            <div>
              <dt>{integrationsText.ocr.fields.amountBeforeVat}</dt>
              <dd>
                <MoneyDisplay value={result.extracted_fields.amount_before_vat} />
              </dd>
            </div>
            <div>
              <dt>{integrationsText.ocr.fields.vatRate}</dt>
              <dd>{result.extracted_fields.vat_rate}%</dd>
            </div>
            <div>
              <dt>{integrationsText.ocr.fields.vatAmount}</dt>
              <dd>
                <MoneyDisplay value={result.extracted_fields.vat_amount} />
              </dd>
            </div>
            <div>
              <dt>{integrationsText.ocr.fields.totalAmount}</dt>
              <dd>
                <MoneyDisplay value={result.extracted_fields.total_amount} />
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}
