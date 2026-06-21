import { useState } from "react";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import ClientForm from "../components/ClientForm";
import SecondaryButton from "../components/SecondaryButton";
import { createClient } from "../api/clients";
import { clients as clientsText, pages } from "../content/he";
import { getClientErrorMessage } from "../utils/clientErrors";

export default function AddClientPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  async function handleSubmit(payload) {
    setServerError("");

    try {
      const client = await createClient(payload);
      navigate(`/clients/${client.id}`, { replace: true });
    } catch (error) {
      const message = getClientErrorMessage(error, clientsText.errors.saveFailed);
      if (message) {
        setServerError(message);
      }
    }
  }

  return (
    <>
      <PageHeader title={pages.addClient.title} description={pages.addClient.description} />
      <div className="page-actions">
        <SecondaryButton type="button" onClick={() => navigate("/clients")}>
          {clientsText.actions.backToList}
        </SecondaryButton>
      </div>
      <ClientForm
        mode="create"
        submitLabel={clientsText.actions.saveClient}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/clients")}
        serverError={serverError}
      />
    </>
  );
}
