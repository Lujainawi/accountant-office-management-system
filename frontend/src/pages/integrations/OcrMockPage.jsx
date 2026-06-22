import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import MockModuleBanner from "../../components/integrations/MockModuleBanner";
import OcrPresetSelector from "../../components/integrations/OcrPresetSelector";
import { processOcrPreset } from "../../api/integrations";
import { ApiError } from "../../api/client";
import { integrations as integrationsText, pages } from "../../content/he";

const OCR_PRESETS = integrationsText.ocr.presets;

export default function OcrMockPage() {
  const moduleCopy = integrationsText.modules.ocr;
  const [selectedPreset, setSelectedPreset] = useState(OCR_PRESETS[0]?.id ?? "");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSimulate() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await processOcrPreset(selectedPreset);
      setResult(data);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : integrationsText.errors.ocrFailed;
      setErrorMessage(message || integrationsText.errors.ocrFailed);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <PageHeader title={pages.ocrMock.title} description={pages.ocrMock.description} />
      <MockModuleBanner
        title={moduleCopy.title}
        description={moduleCopy.bannerDescription}
        status="coming_soon"
      />
      <OcrPresetSelector
        presets={OCR_PRESETS}
        selectedPreset={selectedPreset}
        onPresetChange={setSelectedPreset}
        result={result}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSimulate={handleSimulate}
      />
    </>
  );
}
