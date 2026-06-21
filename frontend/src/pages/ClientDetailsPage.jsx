import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import DangerButton from "../components/DangerButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import DateDisplay from "../components/DateDisplay";
import ConfirmDialog from "../components/ConfirmDialog";
import { deleteClient, getClient, updateClient } from "../api/clients";
import { ApiError } from "../api/client";
import { clients as clientsText, pages, ui } from "../content/he";
import {
  getClientStatusLabel,
  getClientStatusTone,
  getClientTypeLabel,
} from "../utils/clientForm";
import { getClientErrorMessage } from "../utils/clientErrors";

function DetailField({ label, value }) {
  const displayValue =
    value == null || value === "" ? ui.notAvailable : value;

  return (
    <div className="client-detail-field">
      <dt className="client-detail-field__label">{label}</dt>
      <dd className="client-detail-field__value">{displayValue}</dd>
    </div>
  );
}

export default function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function loadClient() {
    setIsLoading(true);
    setErrorMessage("");
    setNotFound(false);

    try {
      const data = await getClient(id);
      setClient(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setNotFound(true);
        return;
      }

      const message = getClientErrorMessage(error, clientsText.errors.loadClientFailed);
      if (message) {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadClient();
  }, [id]);

  async function handleArchiveConfirm() {
    setActionError("");
    setShowArchiveDialog(false);

    try {
      const updated = await updateClient(id, { status: "inactive" });
      setClient(updated);
    } catch (error) {
      const message = getClientErrorMessage(error, clientsText.errors.archiveFailed);
      if (message) {
        setActionError(message);
      }
    }
  }

  async function handleDeleteConfirm() {
    setActionError("");
    setShowDeleteDialog(false);

    try {
      await deleteClient(id);
      navigate("/clients", { replace: true });
    } catch (error) {
      const message = getClientErrorMessage(error, clientsText.errors.deleteFailed);
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
        <PageHeader title={pages.clientDetails.title} description={pages.clientDetails.description} />
        <EmptyState
          title={clientsText.details.notFoundTitle}
          description={clientsText.details.notFoundDescription}
        />
        <div className="page-actions">
          <SecondaryButton type="button" onClick={() => navigate("/clients")}>
            {clientsText.actions.backToList}
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
      <PageHeader
        title={client.client_name}
        description={pages.clientDetails.description}
      />

      <div className="client-details__header">
        <StatusBadge
          label={getClientStatusLabel(client.status)}
          tone={getClientStatusTone(client.status)}
        />
        <span className="client-details__type">{getClientTypeLabel(client.client_type)}</span>
      </div>

      <div className="page-actions client-details__actions">
        <PrimaryButton type="button" onClick={() => navigate(`/clients/${client.id}/edit`)}>
          {clientsText.actions.editClient}
        </PrimaryButton>
        {client.status === "active" ? (
          <SecondaryButton type="button" onClick={() => setShowArchiveDialog(true)}>
            {clientsText.actions.archiveClient}
          </SecondaryButton>
        ) : null}
        <DangerButton type="button" onClick={() => setShowDeleteDialog(true)}>
          {clientsText.actions.deleteClient}
        </DangerButton>
        <SecondaryButton type="button" onClick={() => navigate("/clients")}>
          {clientsText.actions.backToList}
        </SecondaryButton>
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}

      <section className="client-details__section" aria-labelledby="client-details-title">
        <h2 id="client-details-title" className="client-details__section-title">
          {clientsText.details.sectionTitle}
        </h2>
        <dl className="client-details__grid">
          <DetailField label={clientsText.fields.clientName} value={client.client_name} />
          <DetailField label={clientsText.fields.businessName} value={client.business_name} />
          <DetailField label={clientsText.fields.clientType} value={getClientTypeLabel(client.client_type)} />
          <DetailField label={clientsText.fields.status} value={getClientStatusLabel(client.status)} />
          <DetailField label={clientsText.fields.phone} value={client.phone} />
          <DetailField label={clientsText.fields.email} value={client.email} />
          <DetailField label={clientsText.fields.businessId} value={client.business_id} />
          <DetailField label={clientsText.fields.address} value={client.address} />
          <DetailField label={clientsText.fields.updatedAt} value={<DateDisplay value={client.updated_at} />} />
        </dl>
      </section>

      <section className="client-details__section" aria-labelledby="client-notes-title">
        <h2 id="client-notes-title" className="client-details__section-title">
          {clientsText.details.internalNotesLabel}
        </h2>
        <p className="client-details__notes">
          {client.notes || clientsText.details.noNotes}
        </p>
      </section>

      <ConfirmDialog
        isOpen={showArchiveDialog}
        title={clientsText.confirm.archiveTitle}
        description={clientsText.confirm.archiveDescription}
        confirmLabel={clientsText.confirm.archiveConfirm}
        cancelLabel={clientsText.confirm.cancel}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setShowArchiveDialog(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={clientsText.confirm.deleteTitle}
        description={clientsText.confirm.deleteDescription}
        confirmLabel={clientsText.confirm.deleteConfirm}
        cancelLabel={clientsText.confirm.cancel}
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
