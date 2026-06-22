import { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingState from "../../components/LoadingState";
import ErrorMessage from "../../components/ErrorMessage";
import MockModuleBanner from "../../components/integrations/MockModuleBanner";
import PlannedWorkflowSteps from "../../components/integrations/PlannedWorkflowSteps";
import { getTaxAuthorityStatus } from "../../api/integrations";
import { ApiError } from "../../api/client";
import { integrations as integrationsText, pages } from "../../content/he";

export default function TaxAuthorityPage() {
  const moduleCopy = integrationsText.modules.tax_authority;
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getTaxAuthorityStatus();
      setStatusData(data);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : integrationsText.errors.loadFailed;
      setErrorMessage(message || integrationsText.errors.loadFailed);
      setStatusData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (isLoading) {
    return <LoadingState message={integrationsText.actions.loadingSample} />;
  }

  return (
    <>
      <PageHeader title={pages.taxAuthority.title} description={pages.taxAuthority.description} />
      <MockModuleBanner
        title={moduleCopy.title}
        description={moduleCopy.bannerDescription}
        status="planned"
        extraNotice={integrationsText.taxAuthority.notOfficialNotice}
      />
      {errorMessage ? (
        <>
          <ErrorMessage message={errorMessage} />
          <div className="page-actions">
            <PrimaryButton type="button" onClick={loadStatus}>
              {integrationsText.actions.retry}
            </PrimaryButton>
          </div>
        </>
      ) : null}
      {statusData ? (
        <>
          <p className="integration-readonly-note" role="note">
            {statusData.disclaimer}
          </p>
          <PlannedWorkflowSteps
            title={integrationsText.taxAuthority.workflowTitle}
            description={integrationsText.taxAuthority.workflowDescription}
            steps={statusData.workflow_steps}
          />
        </>
      ) : null}
    </>
  );
}
