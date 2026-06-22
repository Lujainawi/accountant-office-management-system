import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import DocumentForm from "../components/documents/DocumentForm";
import { listClients } from "../api/clients";
import { getSettings } from "../api/settings";
import { createDocument, getDocumentUploadPolicy } from "../api/documents";
import { ApiError } from "../api/client";
import { documents as documentsText, pages, ui } from "../content/he";
import {
  EMPTY_DOCUMENT_FORM_VALUES,
  buildCreateFormData,
  formatPolicyExtensions,
} from "../utils/documentForm";
import { getDocumentErrorMessage } from "../utils/documentErrors";
import { normalizeVatRateDisplay } from "../utils/vat";

export default function UploadDocumentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetClientId = searchParams.get("client_id") ?? "";

  const [clients, setClients] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [defaultVatRate, setDefaultVatRate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [clientsData, policyData, settingsData] = await Promise.all([
        listClients(),
        getDocumentUploadPolicy(),
        getSettings(),
      ]);
      setClients(clientsData);
      setPolicy(policyData);
      setDefaultVatRate(normalizeVatRateDisplay(settingsData.default_vat_rate));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : documentsText.errors.loadUploadPageFailed;
      setLoadError(message || documentsText.errors.loadUploadPageFailed);
      setClients([]);
      setPolicy(null);
      setDefaultVatRate("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const initialValues = useMemo(
    () => ({
      ...EMPTY_DOCUMENT_FORM_VALUES,
      client_id: presetClientId,
      vat_rate: defaultVatRate,
    }),
    [presetClientId, defaultVatRate],
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
    return (
      <>
        <PageHeader title={pages.uploadDocument.title} description={pages.uploadDocument.description} />
        <ErrorMessage message={loadError} />
        <div className="page-actions">
          <PrimaryButton type="button" onClick={loadPageData}>
            {documentsText.actions.retryLoad}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={() => navigate("/documents")}>
            {documentsText.actions.backToDocuments}
          </SecondaryButton>
        </div>
      </>
    );
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
        key={defaultVatRate}
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
