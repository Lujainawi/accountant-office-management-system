import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingState from "../../components/LoadingState";
import ErrorMessage from "../../components/ErrorMessage";
import MockModuleBanner from "../../components/integrations/MockModuleBanner";
import { getOnlinePaymentsStatus } from "../../api/integrations";
import { ApiError } from "../../api/client";
import { integrations as integrationsText, pages } from "../../content/he";

export default function OnlinePaymentsMockPage() {
  const moduleCopy = integrationsText.modules.online_payments;
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getOnlinePaymentsStatus();
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
      <PageHeader
        title={pages.onlinePaymentsMock.title}
        description={pages.onlinePaymentsMock.description}
      />
      <MockModuleBanner
        title={moduleCopy.title}
        description={moduleCopy.bannerDescription}
        status="mock_mode"
        extraNotice={integrationsText.onlinePayments.manualTrackingNotice}
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
        <section className="integration-concept-panel">
          <h2 className="integration-concept-panel__title">{statusData.concept_title}</h2>
          <p className="integration-readonly-note" role="note">
            {statusData.disclaimer}
          </p>
          <p>{statusData.concept_description}</p>
          <p>{statusData.manual_tracking_note}</p>
          <Link to="/clients" className="button button--secondary">
            {integrationsText.onlinePayments.manualLinkLabel}
          </Link>
        </section>
      ) : null}
    </>
  );
}
