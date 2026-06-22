import { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingState from "../../components/LoadingState";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import MockModuleBanner from "../../components/integrations/MockModuleBanner";
import { getDigitalSignatureStatus } from "../../api/integrations";
import { ApiError } from "../../api/client";
import { integrations as integrationsText, pages } from "../../content/he";

export default function DigitalSignaturePage() {
  const moduleCopy = integrationsText.modules.digital_signature;
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getDigitalSignatureStatus();
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
        title={pages.digitalSignature.title}
        description={pages.digitalSignature.description}
      />
      <MockModuleBanner
        title={moduleCopy.title}
        description={moduleCopy.bannerDescription}
        status="planned"
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
          <section className="integration-sample-table" aria-labelledby="signature-sample-title">
            <h2 id="signature-sample-title" className="integration-sample-table__title">
              {integrationsText.digitalSignature.sampleTableTitle}
            </h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">{integrationsText.digitalSignature.columns.document}</th>
                  <th scope="col">{integrationsText.digitalSignature.columns.status}</th>
                  <th scope="col">{integrationsText.digitalSignature.columns.note}</th>
                </tr>
              </thead>
              <tbody>
                {statusData.sample_documents.map((row) => (
                  <tr key={row.document_label}>
                    <td>{row.document_label}</td>
                    <td>
                      <StatusBadge label={row.signature_status} tone="neutral" />
                    </td>
                    <td>{row.status_note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}
    </>
  );
}
