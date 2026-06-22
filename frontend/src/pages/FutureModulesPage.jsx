import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import IntegrationStatusCard from "../components/integrations/IntegrationStatusCard";
import { getIntegrationStatuses } from "../api/integrations";
import { ApiError } from "../api/client";
import { integrations as integrationsText, pages } from "../content/he";

export default function FutureModulesPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStatuses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getIntegrationStatuses();
      setItems(data.items ?? []);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : integrationsText.errors.loadFailed;
      setErrorMessage(message || integrationsText.errors.loadFailed);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  if (isLoading) {
    return <LoadingState message={integrationsText.actions.loadingSample} />;
  }

  return (
    <>
      <PageHeader
        title={pages.futureModules.title}
        description={pages.futureModules.description}
      />
      <p className="mock-module-overview-disclaimer" role="note">
        {integrationsText.overviewDisclaimer}
      </p>

      {errorMessage ? (
        <>
          <ErrorMessage message={errorMessage} />
          <div className="page-actions">
            <PrimaryButton type="button" onClick={loadStatuses}>
              {integrationsText.actions.retry}
            </PrimaryButton>
          </div>
        </>
      ) : (
        <div className="integration-cards-grid">
          {items.map((item) => (
            <IntegrationStatusCard key={item.service_name} statusRow={item} />
          ))}
        </div>
      )}
    </>
  );
}
