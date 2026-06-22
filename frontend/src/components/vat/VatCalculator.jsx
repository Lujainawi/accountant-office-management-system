import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import FormField from "../FormField";
import PrimaryButton from "../PrimaryButton";
import SecondaryButton from "../SecondaryButton";
import ErrorMessage from "../ErrorMessage";
import MoneyDisplay from "../MoneyDisplay";
import { calculateVat } from "../../api/vat";
import { ApiError } from "../../api/client";
import { vatCalculator as calculatorText } from "../../content/he";
import {
  normalizeVatRateDisplay,
  validateMoneyInput,
  validateVatRateInput,
} from "../../utils/vat";

export default function VatCalculator({ defaultVatRate }) {
  const [mode, setMode] = useState("from_before_vat");
  const [amount, setAmount] = useState("");
  const [vatRate, setVatRate] = useState(defaultVatRate);
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setVatRate(defaultVatRate);
  }, [defaultVatRate]);

  function updateAmount(value) {
    setAmount(value);
    setResult(null);
    if (fieldErrors.amount) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.amount;
        return next;
      });
    }
  }

  function updateVatRate(value) {
    setVatRate(value);
    setResult(null);
    if (fieldErrors.vat_rate) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.vat_rate;
        return next;
      });
    }
  }

  function validate() {
    const errors = {};
    const amountError = validateMoneyInput(amount, { required: true });
    if (amountError) {
      errors.amount = amountError;
    }
    const vatError = validateVatRateInput(vatRate, { required: true });
    if (vatError) {
      errors.vat_rate = vatError;
    }
    return errors;
  }

  async function handleCalculate(event) {
    event.preventDefault();
    setErrorMessage("");
    setResult(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsCalculating(true);
    try {
      const response = await calculateVat({
        mode,
        amount: amount.trim(),
        vat_rate: vatRate.trim(),
      });
      setResult(response);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : calculatorText.errors.calculateFailed;
      setErrorMessage(message || calculatorText.errors.calculateFailed);
    } finally {
      setIsCalculating(false);
    }
  }

  function handleReset() {
    setAmount("");
    setVatRate(defaultVatRate);
    setFieldErrors({});
    setErrorMessage("");
    setResult(null);
  }

  const amountLabel =
    mode === "from_before_vat"
      ? calculatorText.fields.amountBeforeVat
      : calculatorText.fields.totalIncludingVat;

  return (
    <form className="vat-calculator" onSubmit={handleCalculate} noValidate>
      <fieldset className="vat-calculator__modes">
        <legend className="vat-calculator__modes-legend">{calculatorText.fields.modeLegend}</legend>
        <label className="vat-calculator__mode-option">
          <input
            type="radio"
            name="vat-calculator-mode"
            value="from_before_vat"
            checked={mode === "from_before_vat"}
            onChange={() => {
              setMode("from_before_vat");
              setResult(null);
            }}
          />
          <span>{calculatorText.modes.fromBeforeVat}</span>
        </label>
        <label className="vat-calculator__mode-option">
          <input
            type="radio"
            name="vat-calculator-mode"
            value="from_total_including_vat"
            checked={mode === "from_total_including_vat"}
            onChange={() => {
              setMode("from_total_including_vat");
              setResult(null);
            }}
          />
          <span>{calculatorText.modes.fromTotalIncludingVat}</span>
        </label>
      </fieldset>

      <div className="vat-calculator__grid">
        <FormField
          id="vat-calculator-amount"
          label={amountLabel}
          required
          error={fieldErrors.amount}
        >
          <input
            id="vat-calculator-amount"
            className="form-field__input"
            inputMode="decimal"
            value={amount}
            onChange={(event) => updateAmount(event.target.value)}
          />
        </FormField>

        <FormField
          id="vat-calculator-rate"
          label={calculatorText.fields.vatRate}
          required
          error={fieldErrors.vat_rate}
          hint={calculatorText.fields.vatRateHint.replace(
            "{rate}",
            normalizeVatRateDisplay(defaultVatRate),
          )}
        >
          <input
            id="vat-calculator-rate"
            className="form-field__input"
            inputMode="decimal"
            value={vatRate}
            onChange={(event) => updateVatRate(event.target.value)}
          />
        </FormField>
      </div>

      <p className="vat-calculator__formula">{calculatorText.formulaHint}</p>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      <section className="vat-calculator__results" aria-live="polite">
        <h2 className="vat-calculator__results-title">{calculatorText.results.title}</h2>
        {isCalculating ? <p>{calculatorText.results.loading}</p> : null}
        {!isCalculating && result ? (
          <dl className="vat-calculator__results-list">
            <div>
              <dt>{calculatorText.results.amountBeforeVat}</dt>
              <dd>
                <MoneyDisplay value={result.amount_before_vat} />
              </dd>
            </div>
            <div>
              <dt>{calculatorText.results.vatAmount}</dt>
              <dd>
                <MoneyDisplay value={result.vat_amount} />
              </dd>
            </div>
            <div>
              <dt>{calculatorText.results.totalAmount}</dt>
              <dd>
                <MoneyDisplay value={result.total_amount} />
              </dd>
            </div>
          </dl>
        ) : null}
        {!isCalculating && !result ? (
          <p className="vat-calculator__results-empty">{calculatorText.results.empty}</p>
        ) : null}
      </section>

      <div className="page-actions">
        <PrimaryButton type="submit" disabled={isCalculating}>
          {calculatorText.actions.calculate}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={handleReset}>
          {calculatorText.actions.reset}
        </SecondaryButton>
        <Link className="text-link" to="/settings">
          {calculatorText.actions.settingsLink}
        </Link>
      </div>
    </form>
  );
}
