import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import PageHeader from "../components/PageHeader";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import PaymentForm from "../components/payments/PaymentForm";
import { ApiError } from "../api/client";
import { getClient } from "../api/clients";
import { createPayment } from "../api/payments";
import { clients as clientsText, pages, payments as paymentsText, ui } from "../content/he";
import { EMPTY_PAYMENT_FORM_VALUES, buildCreatePayload } from "../utils/paymentForm";
import { getPaymentErrorMessage } from "../utils/paymentErrors";
import { getClientErrorMessage } from "../utils/clientErrors";

export default function AddPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdParam = searchParams.get("client_id") ?? "";
  const clientId = clientIdParam ? Number(clientIdParam) : NaN;

  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [invalidClient, setInvalidClient] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function load() {
      if (!clientIdParam || Number.isNaN(clientId)) {
        setInvalidClient(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");
      setInvalidClient(false);

      try {
        const clientData = await getClient(clientId);
        setClient(clientData);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setInvalidClient(true);
          return;
        }
        const message = getClientErrorMessage(error, clientsText.errors.loadClientFailed);
        if (message) {
          setLoadError(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [clientId, clientIdParam]);

  const initialValues = useMemo(() => ({ ...EMPTY_PAYMENT_FORM_VALUES }), []);

  async function handleSubmit(values) {
    setServerError("");
    try {
      await createPayment(buildCreatePayload(clientId, values));
      navigate(`/clients/${clientId}`, { replace: true });
    } catch (error) {
      const message = getPaymentErrorMessage(error, paymentsText.errors.saveFailed);
      if (message) {
        setServerError(message);
      }
    }
  }

  if (isLoading) {
    return <LoadingState message={ui.loading} />;
  }

  if (invalidClient) {
    return (
      <>
        <PageHeader title={pages.addPayment.title} description={pages.addPayment.description} />
        <EmptyState
          title={paymentsText.errors.missingClientTitle}
          description={paymentsText.errors.missingClientDescription}
        />
        <div className="page-actions">
          <Link to="/clients" className="button button--secondary">
            {clientsText.actions.backToList}
          </Link>
        </div>
      </>
    );
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <>
      <PageHeader title={pages.addPayment.title} description={pages.addPayment.description} />
      <div className="page-actions">
        <SecondaryButton type="button" onClick={() => navigate(`/clients/${clientId}`)}>
          {paymentsText.actions.backToClient}
        </SecondaryButton>
      </div>
      <PaymentForm
        clientName={client.client_name}
        clientId={clientId}
        initialValues={initialValues}
        submitLabel={paymentsText.actions.savePayment}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/clients/${clientId}`)}
        serverError={serverError}
      />
    </>
  );
}
