import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageHeader from "../components/PageHeader";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import DocumentForm from "../components/documents/DocumentForm";
import { listClients } from "../api/clients";
import { ApiError } from "../api/client";
import { getDocument, updateDocument } from "../api/documents";
import { documents as documentsText, pages, ui } from "../content/he";
import { buildUpdatePayload, documentToFormValues } from "../utils/documentForm";
import { getDocumentErrorMessage } from "../utils/documentErrors";

export default function EditDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState("");

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
        setClients(clientsData);
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

  async function handleSubmit(values) {
    setServerError("");
    const payload = buildUpdatePayload(values, document);
    if (Object.keys(payload).length === 0) {
      setServerError(documentsText.validation.noChanges);
      return;
    }

    try {
      const updated = await updateDocument(id, payload);
      navigate(`/documents/${updated.id}`, { replace: true });
    } catch (error) {
      const message = getDocumentErrorMessage(error, documentsText.errors.saveFailed);
      if (message) {
        setServerError(message);
      }
    }
  }

  if (isLoading) {
    return <LoadingState message={ui.loading} />;
  }

  if (notFound) {
    return (
      <>
        <PageHeader title={pages.editDocument.title} description={pages.editDocument.description} />
        <EmptyState
          title={documentsText.details.notFoundTitle}
          description={documentsText.details.notFoundDescription}
        />
      </>
    );
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  return (
    <>
      <PageHeader title={pages.editDocument.title} description={pages.editDocument.description} />
      <div className="page-actions">
        <SecondaryButton type="button" onClick={() => navigate(`/documents/${id}`)}>
          {documentsText.actions.viewDocument}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => navigate("/documents")}>
          {documentsText.actions.backToDocuments}
        </SecondaryButton>
      </div>
      <DocumentForm
        mode="edit"
        clients={clients}
        initialValues={documentToFormValues(document)}
        submitLabel={documentsText.actions.saveDocument}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/documents/${id}`)}
        serverError={serverError}
      />
    </>
  );
}
