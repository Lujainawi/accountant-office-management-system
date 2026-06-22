import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/PrimaryButton";
import ErrorMessage from "../../components/ErrorMessage";
import MockModuleBanner from "../../components/integrations/MockModuleBanner";
import { getAiMockSuggestions } from "../../api/integrations";
import { ApiError } from "../../api/client";
import { integrations as integrationsText, pages } from "../../content/he";

export default function AiAssistantPage() {
  const moduleCopy = integrationsText.modules.ai_assistant;
  const [suggestions, setSuggestions] = useState([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  async function handleLoadSuggestions() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getAiMockSuggestions();
      setSuggestions(data.suggestions ?? []);
      setDisclaimer(data.disclaimer ?? "");
      setHasLoaded(true);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : integrationsText.errors.aiFailed;
      setErrorMessage(message || integrationsText.errors.aiFailed);
      setSuggestions([]);
      setDisclaimer("");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <PageHeader title={pages.aiAssistant.title} description={pages.aiAssistant.description} />
      <MockModuleBanner
        title={moduleCopy.title}
        description={moduleCopy.bannerDescription}
        status="planned"
      />
      <section className="integration-preset-panel" aria-labelledby="ai-suggestions-title">
        <h2 id="ai-suggestions-title" className="integration-preset-panel__title">
          {integrationsText.ai.suggestionsTitle}
        </h2>
        <p className="integration-preset-panel__description">
          {integrationsText.ai.suggestionsDescription}
        </p>
        <div className="page-actions">
          <PrimaryButton type="button" onClick={handleLoadSuggestions} disabled={isLoading}>
            {isLoading
              ? integrationsText.actions.loadingSample
              : integrationsText.ai.loadSuggestions}
          </PrimaryButton>
        </div>
        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
        {hasLoaded ? (
          <div className="integration-sample-result">
            <p className="integration-sample-result__label" role="note">
              {integrationsText.sampleResultLabel}
            </p>
            {disclaimer ? (
              <p className="integration-sample-result__disclaimer" role="note">
                {disclaimer}
              </p>
            ) : null}
            <ul className="ai-suggestions-list">
              {suggestions.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </>
  );
}
