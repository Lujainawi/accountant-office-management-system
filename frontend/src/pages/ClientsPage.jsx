import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import SearchInput from "../components/SearchInput";
import FilterBar from "../components/FilterBar";
import DateDisplay from "../components/DateDisplay";
import ConfirmDialog from "../components/ConfirmDialog";
import { listClients, deleteClient, updateClient } from "../api/clients";
import { clients as clientsText, pages, ui } from "../content/he";
import {
  CLIENT_STATUS_OPTIONS,
  CLIENT_TYPE_OPTIONS,
  getClientStatusLabel,
  getClientStatusTone,
  getClientTypeLabel,
} from "../utils/clientForm";
import { getClientErrorMessage } from "../utils/clientErrors";

const ALL_STATUS_OPTIONS = [{ value: "", label: ui.all }, ...CLIENT_STATUS_OPTIONS];
const ALL_TYPE_OPTIONS = [{ value: "", label: ui.all }, ...CLIENT_TYPE_OPTIONS];

function formatContact(client) {
  const parts = [client.phone, client.email].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : ui.notAvailable;
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pendingArchiveClient, setPendingArchiveClient] = useState(null);
  const [pendingDeleteClient, setPendingDeleteClient] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listClients({
        q: searchQuery,
        status: statusFilter || undefined,
        clientType: typeFilter || undefined,
      });
      setClients(data);
    } catch (error) {
      const message = getClientErrorMessage(error, clientsText.errors.loadFailed);
      if (message) {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  function handleResetFilters() {
    setSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
  }

  async function handleArchiveConfirm() {
    if (!pendingArchiveClient) {
      return;
    }

    setActionError("");

    try {
      await updateClient(pendingArchiveClient.id, { status: "inactive" });
      setPendingArchiveClient(null);
      await loadClients();
    } catch (error) {
      const message = getClientErrorMessage(error, clientsText.errors.archiveFailed);
      if (message) {
        setActionError(message);
      }
      setPendingArchiveClient(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!pendingDeleteClient) {
      return;
    }

    setActionError("");

    try {
      await deleteClient(pendingDeleteClient.id);
      setPendingDeleteClient(null);
      await loadClients();
    } catch (error) {
      const message = getClientErrorMessage(error, clientsText.errors.deleteFailed);
      if (message) {
        setActionError(message);
      }
      setPendingDeleteClient(null);
    }
  }

  const hasFilters = Boolean(searchQuery || statusFilter || typeFilter);
  const showEmptyState = !isLoading && !errorMessage && clients.length === 0;
  const emptyTitle = hasFilters ? clientsText.list.noResultsTitle : clientsText.list.emptyTitle;
  const emptyDescription = hasFilters
    ? clientsText.list.noResultsDescription
    : clientsText.list.emptyDescription;

  return (
    <>
      <PageHeader title={pages.clients.title} description={pages.clients.description} />

      <div className="clients-list-controls">
        <div className="clients-toolbar">
          <Link to="/clients/new" className="button button--primary clients-toolbar__add">
            {clientsText.actions.addClient}
          </Link>
        </div>

        <div className="clients-filters">
          <SearchInput
            id="client-search"
            label={clientsText.list.searchLabel}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={clientsText.list.searchPlaceholder}
          />
          <FilterBar
            statusLabel={clientsText.list.statusFilter}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={ALL_STATUS_OPTIONS}
            typeLabel={clientsText.list.typeFilter}
            typeValue={typeFilter}
            onTypeChange={setTypeFilter}
            typeOptions={ALL_TYPE_OPTIONS}
            resetLabel={ui.resetFilters}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}
      {isLoading ? <LoadingState message={ui.loading} /> : null}
      {!isLoading && errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      {showEmptyState ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}

      {showEmptyState && !hasFilters ? (
        <div className="clients-empty-action">
          <Link to="/clients/new" className="button button--primary">
            {clientsText.actions.addClient}
          </Link>
        </div>
      ) : null}

      {!isLoading && !errorMessage && clients.length > 0 ? (
        <div className="clients-table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th scope="col">{clientsText.list.columns.name}</th>
                <th scope="col">{clientsText.list.columns.business}</th>
                <th scope="col">{clientsText.list.columns.contact}</th>
                <th scope="col">{clientsText.list.columns.type}</th>
                <th scope="col">{clientsText.list.columns.status}</th>
                <th scope="col">{clientsText.list.columns.updated}</th>
                <th scope="col">{clientsText.list.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td data-label={clientsText.list.columns.name}>
                    <Link to={`/clients/${client.id}`} className="clients-table__link">
                      {client.client_name}
                    </Link>
                  </td>
                  <td data-label={clientsText.list.columns.business}>
                    {client.business_name || ui.notAvailable}
                  </td>
                  <td data-label={clientsText.list.columns.contact}>{formatContact(client)}</td>
                  <td data-label={clientsText.list.columns.type}>
                    {getClientTypeLabel(client.client_type)}
                  </td>
                  <td data-label={clientsText.list.columns.status}>
                    <StatusBadge
                      label={getClientStatusLabel(client.status)}
                      tone={getClientStatusTone(client.status)}
                    />
                  </td>
                  <td data-label={clientsText.list.columns.updated}>
                    <DateDisplay value={client.updated_at} />
                  </td>
                  <td data-label={clientsText.list.columns.actions}>
                    <div className="clients-table__actions">
                      <div className="clients-table__actions-group">
                        <Link to={`/clients/${client.id}`} className="button button--secondary">
                          {ui.view}
                        </Link>
                        <Link to={`/clients/${client.id}/edit`} className="button button--secondary">
                          {ui.edit}
                        </Link>
                        {client.status === "active" ? (
                          <SecondaryButton
                            type="button"
                            onClick={() => setPendingArchiveClient(client)}
                          >
                            {clientsText.actions.archiveClient}
                          </SecondaryButton>
                        ) : null}
                      </div>
                      <SecondaryButton
                        type="button"
                        className="clients-table__delete"
                        onClick={() => setPendingDeleteClient(client)}
                      >
                        {clientsText.actions.deleteClient}
                      </SecondaryButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(pendingArchiveClient)}
        title={clientsText.confirm.archiveTitle}
        description={clientsText.confirm.archiveDescription}
        confirmLabel={clientsText.confirm.archiveConfirm}
        cancelLabel={clientsText.confirm.cancel}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setPendingArchiveClient(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteClient)}
        title={clientsText.confirm.deleteTitle}
        description={clientsText.confirm.deleteDescription}
        confirmLabel={clientsText.confirm.deleteConfirm}
        cancelLabel={clientsText.confirm.cancel}
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteClient(null)}
      />
    </>
  );
}
