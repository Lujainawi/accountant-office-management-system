import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import PageHeader from "../components/PageHeader";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import DocumentForm from "../components/documents/DocumentForm";
import { listClients } from "../api/clients";
import { createDocument, getDocumentUploadPolicy } from "../api/documents";
import { documents as documentsText, pages, ui } from "../content/he";
import {
  EMPTY_DOCUMENT_FORM_VALUES,
  buildCreateFormData,
  formatPolicyExtensions,
} from "../utils/documentForm";
import { getDocumentErrorMessage } from "../utils/documentErrors";

export default function UploadDocumentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetClientId = searchParams.get("client_id") ?? "";

  const [clients, setClients] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError("");
      try {
        const [clientsData, policyData] = await Promise.all([
          listClients(),
          getDocumentUploadPolicy(),
        ]);
        setClients(clientsData);
        setPolicy(policyData);
      } catch (error) {
        const message = getDocumentErrorMessage(error, documentsText.errors.loadFailed);
        if (message) {
          setLoadError(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const initialValues = useMemo(
    () => ({
      ...EMPTY_DOCUMENT_FORM_VALUES,
      client_id: presetClientId,
      vat_rate: "18.00",
    }),
    [presetClientId],
  );

  const fileHint = policy
    ? documentsText.fields.fileHintTemplate
        .replace("{extensions}", formatPolicyExtensions(policy.allowed_extensions))
        .replace("{maxSizeMb}", String(policy.max_upload_size_mb))
    : "";

  async function handleSubmit(values, file) {
    setServerError("");
    try {
      const formData = buildCreateFormData(values, file);
      const document = await createDocument(formData);
      navigate(`/documents/${document.id}`, { replace: true });
    } catch (error) {
      const message = getDocumentErrorMessage(error, documentsText.errors.uploadFailed);
      if (message) {
        setServerError(message);
      }
    }
  }

  if (isLoading) {
    return <LoadingState message={ui.loading} />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <>
      <PageHeader title={pages.uploadDocument.title} description={pages.uploadDocument.description} />
      <div className="page-actions">
        <SecondaryButton type="button" onClick={() => navigate("/documents")}>
          {documentsText.actions.backToDocuments}
        </SecondaryButton>
      </div>
      <DocumentForm
        mode="create"
        clients={clients}
        initialValues={initialValues}
        submitLabel={documentsText.actions.saveDocument}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/documents")}
        serverError={serverError}
        fileRequired
        showFileField
        fileHint={fileHint}
      />
    </>
  );
}
