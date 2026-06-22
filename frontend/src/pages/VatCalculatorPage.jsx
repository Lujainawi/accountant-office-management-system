import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import VatCalculator from "../components/vat/VatCalculator";
import { getSettings } from "../api/settings";
import { ApiError } from "../api/client";
import { pages, vatCalculator as calculatorText, ui } from "../content/he";
import { normalizeVatRateDisplay } from "../utils/vat";

export default function VatCalculatorPage() {
  const [defaultVatRate, setDefaultVatRate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const settings = await getSettings();
      setDefaultVatRate(normalizeVatRateDisplay(settings.default_vat_rate));
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : calculatorText.errors.loadFailed;
      setLoadError(message || calculatorText.errors.loadFailed);
      setDefaultVatRate("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (isLoading) {
    return <LoadingState message={ui.loading} />;
  }

  if (loadError) {
    return (
      <>
        <PageHeader title={pages.vatCalculator.title} description={pages.vatCalculator.description} />
        <ErrorMessage message={loadError} />
        <div className="page-actions">
          <PrimaryButton type="button" onClick={loadSettings}>
            {calculatorText.actions.retryLoad}
          </PrimaryButton>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={pages.vatCalculator.title} description={pages.vatCalculator.description} />
      <VatCalculator defaultVatRate={defaultVatRate} />
    </>
  );
}
