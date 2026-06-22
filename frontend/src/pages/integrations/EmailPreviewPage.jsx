import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import MockModuleBanner from "../../components/integrations/MockModuleBanner";
import EmailPresetSelector from "../../components/integrations/EmailPresetSelector";
import { previewEmailPreset } from "../../api/integrations";
import { ApiError } from "../../api/client";
import { integrations as integrationsText, pages } from "../../content/he";

const EMAIL_PRESETS = integrationsText.email.presets;

export default function EmailPreviewPage() {
  const moduleCopy = integrationsText.modules.email;
  const [selectedPreset, setSelectedPreset] = useState(EMAIL_PRESETS[0]?.id ?? "");
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  async function handleGeneratePreview() {
    setIsLoading(true);
    setErrorMessage("");
    setCopyFeedback("");
    try {
      const data = await previewEmailPreset(selectedPreset);
      setPreview(data);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : integrationsText.errors.previewFailed;
      setErrorMessage(message || integrationsText.errors.previewFailed);
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!preview) {
      return;
    }
    const text = `${preview.subject}\n\n${preview.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(integrationsText.email.copySuccess);
    } catch {
      setCopyFeedback(integrationsText.email.copyFallback);
    }
  }

  return (
    <>
      <PageHeader title={pages.emailPreview.title} description={pages.emailPreview.description} />
      <MockModuleBanner
        title={moduleCopy.title}
        description={moduleCopy.bannerDescription}
        status="mock_mode"
        extraNotice={integrationsText.email.noSendNotice}
      />
      <EmailPresetSelector
        presets={EMAIL_PRESETS}
        selectedPreset={selectedPreset}
        onPresetChange={setSelectedPreset}
        preview={preview}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onGeneratePreview={handleGeneratePreview}
        onCopy={handleCopy}
        copyFeedback={copyFeedback}
      />
    </>
  );
}
