import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageHeader from "../components/PageHeader";
import ClientForm from "../components/ClientForm";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getClient, updateClient } from "../api/clients";
import { ApiError } from "../api/client";
import { clients as clientsText, pages, ui } from "../content/he";
import { clientToFormValues } from "../utils/clientForm";
import { getClientErrorMessage } from "../utils/clientErrors";

export default function EditClientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadClient() {
      setIsLoading(true);
      setLoadError("");
      setNotFound(false);

      try {
        const data = await getClient(id);
        if (isActive) {
          setClient(data);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
          return;
        }

        const message = getClientErrorMessage(error, clientsText.errors.loadClientFailed);
        if (message) {
          setLoadError(message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadClient();

    return () => {
      isActive = false;
    };
  }, [id]);

  async function handleSubmit(payload) {
    setServerError("");

    try {
      const updatedClient = await updateClient(id, payload);
      navigate(`/clients/${updatedClient.id}`, { replace: true });
    } catch (error) {
      const message = getClientErrorMessage(error, clientsText.errors.saveFailed);
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
        <PageHeader title={pages.editClient.title} description={pages.editClient.description} />
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

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <>
      <PageHeader title={pages.editClient.title} description={pages.editClient.description} />
      <div className="page-actions">
        <SecondaryButton type="button" onClick={() => navigate(`/clients/${id}`)}>
          {clientsText.actions.viewDetails}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => navigate("/clients")}>
          {clientsText.actions.backToList}
        </SecondaryButton>
      </div>
      <ClientForm
        mode="edit"
        initialValues={clientToFormValues(client)}
        submitLabel={clientsText.actions.saveChanges}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/clients/${id}`)}
        serverError={serverError}
      />
    </>
  );
}
