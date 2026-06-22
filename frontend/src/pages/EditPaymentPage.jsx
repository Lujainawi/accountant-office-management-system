import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageHeader from "../components/PageHeader";
import SecondaryButton from "../components/SecondaryButton";
import DangerButton from "../components/DangerButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import PaymentForm from "../components/payments/PaymentForm";
import { ApiError } from "../api/client";
import { getClient } from "../api/clients";
import { deletePayment, getPayment, updatePayment } from "../api/payments";
import { pages, payments as paymentsText, ui } from "../content/he";
import { buildUpdatePayload, paymentToFormValues } from "../utils/paymentForm";
import { getPaymentErrorMessage } from "../utils/paymentErrors";
import { getClientErrorMessage } from "../utils/clientErrors";

export default function EditPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage("");
      setNotFound(false);

      try {
        const paymentData = await getPayment(id);
        setPayment(paymentData);

        try {
          const clientData = await getClient(paymentData.client_id);
          setClient(clientData);
        } catch (error) {
          const message = getClientErrorMessage(error, paymentsText.errors.loadClientFailed);
          if (message) {
            setErrorMessage(message);
          }
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
          return;
        }
        const message = getPaymentErrorMessage(error, paymentsText.errors.loadFailed);
        if (message) {
          setErrorMessage(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSubmit(values) {
    setServerError("");
    const payload = buildUpdatePayload(values, payment);
    if (Object.keys(payload).length === 0) {
      setServerError(paymentsText.validation.noChanges);
      return;
    }

    try {
      const updated = await updatePayment(id, payload);
      setPayment(updated);
      navigate(`/clients/${updated.client_id}`, { replace: true });
    } catch (error) {
      const message = getPaymentErrorMessage(error, paymentsText.errors.saveFailed);
      if (message) {
        setServerError(message);
      }
    }
  }

  async function handleDeleteConfirm() {
    setActionError("");
    setShowDeleteDialog(false);

    try {
      await deletePayment(id);
      navigate(`/clients/${payment.client_id}`, { replace: true });
    } catch (error) {
      const message = getPaymentErrorMessage(error, paymentsText.errors.deleteFailed);
      if (message) {
        setActionError(message);
      }
    }
  }

  if (isLoading) {
    return <LoadingState message={ui.loading} />;
  }

  if (notFound) {
    return (
      <>
        <PageHeader title={pages.editPayment.title} description={pages.editPayment.description} />
        <EmptyState
          title={paymentsText.details.notFoundTitle}
          description={paymentsText.details.notFoundDescription}
        />
        <div className="page-actions">
          <SecondaryButton type="button" onClick={() => navigate("/clients")}>
            {paymentsText.actions.backToClients}
          </SecondaryButton>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  return (
    <>
      <PageHeader title={pages.editPayment.title} description={pages.editPayment.description} />

      <div className="page-actions">
        <DangerButton type="button" onClick={() => setShowDeleteDialog(true)}>
          {paymentsText.actions.deletePayment}
        </DangerButton>
        <SecondaryButton type="button" onClick={() => navigate(`/clients/${payment.client_id}`)}>
          {paymentsText.actions.backToClient}
        </SecondaryButton>
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}

      <PaymentForm
        clientName={client?.client_name ?? ui.notAvailable}
        clientId={payment.client_id}
        initialValues={paymentToFormValues(payment)}
        submitLabel={paymentsText.actions.saveChanges}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/clients/${payment.client_id}`)}
        serverError={serverError}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={paymentsText.confirm.deleteTitle}
        description={paymentsText.confirm.deleteDescription}
        confirmLabel={paymentsText.confirm.deleteConfirm}
        cancelLabel={paymentsText.confirm.cancel}
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
