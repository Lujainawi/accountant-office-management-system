import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import DangerButton from "../components/DangerButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import DateDisplay from "../components/DateDisplay";
import MoneyDisplay from "../components/MoneyDisplay";
import ConfirmDialog from "../components/ConfirmDialog";
import { listClients } from "../api/clients";
import { ApiError } from "../api/client";
import {
  deleteDocument,
  downloadDocument,
  getDocument,
  triggerBrowserDownload,
} from "../api/documents";
import { documents as documentsText, pages, ui } from "../content/he";
import {
  formatFileSize,
  getDocumentStatusLabel,
  getDocumentStatusTone,
  getDocumentTypeLabel,
} from "../utils/documentForm";
import { getDocumentErrorMessage } from "../utils/documentErrors";

function DetailField({ label, value }) {
  return (
    <div className="document-detail-field">
      <dt className="document-detail-field__label">{label}</dt>
      <dd className="document-detail-field__value">{value ?? ui.notAvailable}</dd>
    </div>
  );
}

export default function DocumentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage("");
      setNotFound(false);

      try {
        const [documentData, clientsData] = await Promise.all([
          getDocument(id),
          listClients(),
        ]);
        setDocument(documentData);
        const client = clientsData.find((item) => item.id === documentData.client_id);
        setClientName(client?.client_name ?? ui.notAvailable);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
          return;
        }
        const message = getDocumentErrorMessage(error, documentsText.errors.loadDocumentFailed);
        if (message) {
          setErrorMessage(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleDownload() {
    setActionError("");
    try {
      const { blob, filename } = await downloadDocument(id);
      triggerBrowserDownload(blob, filename);
    } catch (error) {
      const message = getDocumentErrorMessage(error, documentsText.errors.downloadFailed);
      if (message) {
        setActionError(message);
      }
    }
  }

  async function handleDeleteConfirm() {
    setActionError("");
    setShowDeleteDialog(false);
    try {
      await deleteDocument(id);
      navigate("/documents", { replace: true });
    } catch (error) {
      const message = getDocumentErrorMessage(error, documentsText.errors.deleteFailed);
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
        <PageHeader
          title={pages.documentDetails.title}
          description={pages.documentDetails.description}
        />
        <EmptyState
          title={documentsText.details.notFoundTitle}
          description={documentsText.details.notFoundDescription}
        />
        <div className="page-actions">
          <SecondaryButton type="button" onClick={() => navigate("/documents")}>
            {documentsText.actions.backToDocuments}
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
        title={document.document_name}
        description={pages.documentDetails.description}
      />

      <div className="document-details__header">
        <StatusBadge
          label={getDocumentStatusLabel(document.status)}
          tone={getDocumentStatusTone(document.status)}
        />
      </div>

      <div className="page-actions">
        <PrimaryButton type="button" onClick={() => navigate(`/documents/${id}/edit`)}>
          {documentsText.actions.editDocument}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={handleDownload}>
          {documentsText.actions.downloadDocument}
        </SecondaryButton>
        <DangerButton type="button" onClick={() => setShowDeleteDialog(true)}>
          {documentsText.actions.deleteDocument}
        </DangerButton>
        <SecondaryButton type="button" onClick={() => navigate("/documents")}>
          {documentsText.actions.backToDocuments}
        </SecondaryButton>
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}

      <section className="document-details__section" aria-labelledby="document-general-title">
        <h2 id="document-general-title" className="document-details__section-title">
          {documentsText.details.generalSection}
        </h2>
        <dl className="document-details__grid">
          <DetailField label={documentsText.fields.client} value={clientName} />
          <DetailField
            label={documentsText.fields.documentType}
            value={getDocumentTypeLabel(document.document_type)}
          />
          <DetailField
            label={documentsText.fields.documentDate}
            value={<DateDisplay value={document.document_date} dateOnly />}
          />
          <DetailField label={documentsText.fields.notes} value={document.notes} />
        </dl>
      </section>

      <section className="document-details__section" aria-labelledby="document-file-title">
        <h2 id="document-file-title" className="document-details__section-title">
          {documentsText.details.fileSection}
        </h2>
        <dl className="document-details__grid">
          <DetailField
            label={documentsText.fields.originalFilename}
            value={document.original_filename}
          />
          <DetailField
            label={documentsText.fields.fileSize}
            value={formatFileSize(document.file_size_bytes)}
          />
        </dl>
      </section>

      <section className="document-details__section" aria-labelledby="document-financial-title">
        <h2 id="document-financial-title" className="document-details__section-title">
          {documentsText.details.financialSection}
        </h2>
        <dl className="document-details__grid document-details__grid--financial">
          <DetailField
            label={documentsText.fields.amountBeforeVat}
            value={<MoneyDisplay value={document.amount_before_vat} />}
          />
          <DetailField
            label={documentsText.fields.vatRate}
            value={`${document.vat_rate}%`}
          />
          <DetailField
            label={documentsText.fields.vatAmount}
            value={<MoneyDisplay value={document.vat_amount} />}
          />
          <DetailField
            label={documentsText.fields.totalAmount}
            value={<MoneyDisplay value={document.total_amount} />}
          />
        </dl>
      </section>

      <div className="page-actions">
        <Link to={`/clients/${document.client_id}`} className="button button--secondary">
          {ui.view} {documentsText.fields.client}
        </Link>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={documentsText.confirm.deleteTitle}
        description={documentsText.confirm.deleteDescription}
        confirmLabel={documentsText.confirm.deleteConfirm}
        cancelLabel={documentsText.confirm.cancel}
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
