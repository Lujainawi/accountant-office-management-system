import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import SearchInput from "../components/SearchInput";
import DateDisplay from "../components/DateDisplay";
import MoneyDisplay from "../components/MoneyDisplay";
import ConfirmDialog from "../components/ConfirmDialog";
import { listClients } from "../api/clients";
import { deleteDocument, downloadDocument, listDocuments, triggerBrowserDownload } from "../api/documents";
import { documents as documentsText, pages, ui } from "../content/he";
import {
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  getDocumentStatusLabel,
  getDocumentStatusTone,
  getDocumentTypeLabel,
} from "../utils/documentForm";
import { getDocumentErrorMessage } from "../utils/documentErrors";

const ALL_STATUS_OPTIONS = [{ value: "", label: ui.all }, ...DOCUMENT_STATUS_OPTIONS];
const ALL_TYPE_OPTIONS = [{ value: "", label: ui.all }, ...DOCUMENT_TYPE_OPTIONS];
const MONTH_OPTIONS = [
  { value: "", label: ui.all },
  ...documentsText.hebrewMonths.map((label, index) => ({
    value: String(index + 1),
    label,
  })),
];

export default function DocumentsPage() {
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get("client_id") ?? "";

  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState(initialClientId);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [pendingDeleteDocument, setPendingDeleteDocument] = useState(null);

  const clientNameById = useMemo(() => {
    const map = new Map();
    for (const client of clients) {
      map.set(client.id, client.client_name || client.business_name || ui.notAvailable);
    }
    return map;
  }, [clients]);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [documentsData, clientsData] = await Promise.all([
        listDocuments({
          q: searchQuery,
          clientId: clientFilter || undefined,
          status: statusFilter || undefined,
          documentType: typeFilter || undefined,
          month: monthFilter || undefined,
          year: yearFilter || undefined,
        }),
        listClients(),
      ]);
      setDocuments(documentsData);
      setClients(clientsData);
    } catch (error) {
      const message = getDocumentErrorMessage(error, documentsText.errors.loadFailed);
      if (message) {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, clientFilter, statusFilter, typeFilter, monthFilter, yearFilter]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  function handleResetFilters() {
    setSearchQuery("");
    setClientFilter("");
    setStatusFilter("");
    setTypeFilter("");
    setMonthFilter("");
    setYearFilter("");
  }

  async function handleDownload(documentId) {
    setActionError("");
    try {
      const { blob, filename } = await downloadDocument(documentId);
      triggerBrowserDownload(blob, filename);
    } catch (error) {
      const message = getDocumentErrorMessage(error, documentsText.errors.downloadFailed);
      if (message) {
        setActionError(message);
      }
    }
  }

  async function handleDeleteConfirm() {
    if (!pendingDeleteDocument) {
      return;
    }

    setActionError("");
    try {
      await deleteDocument(pendingDeleteDocument.id);
      setPendingDeleteDocument(null);
      await loadPage();
    } catch (error) {
      const message = getDocumentErrorMessage(error, documentsText.errors.deleteFailed);
      if (message) {
        setActionError(message);
      }
      setPendingDeleteDocument(null);
    }
  }

  const hasFilters = Boolean(
    searchQuery || clientFilter || statusFilter || typeFilter || monthFilter || yearFilter,
  );
  const showEmptyState = !isLoading && !errorMessage && documents.length === 0;
  const emptyTitle = hasFilters
    ? documentsText.list.noResultsTitle
    : documentsText.list.emptyTitle;
  const emptyDescription = hasFilters
    ? documentsText.list.noResultsDescription
    : documentsText.list.emptyDescription;

  return (
    <>
      <PageHeader title={pages.documents.title} description={pages.documents.description} />

      <div className="documents-list-controls">
        <div className="documents-toolbar">
          <Link to="/documents/upload" className="button button--primary documents-toolbar__upload">
            {documentsText.actions.uploadDocument}
          </Link>
        </div>

        <div className="documents-filters">
        <SearchInput
          id="document-search"
          label={documentsText.list.searchLabel}
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={documentsText.list.searchPlaceholder}
        />

        <div className="documents-filters__grid">
          <div className="filter-bar__field">
            <label className="filter-bar__label" htmlFor="document-client-filter">
              {documentsText.list.clientFilter}
            </label>
            <select
              id="document-client-filter"
              className="filter-bar__select form-field__input"
              value={clientFilter}
              onChange={(event) => setClientFilter(event.target.value)}
            >
              <option value="">{ui.all}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.client_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-bar__field">
            <label className="filter-bar__label" htmlFor="document-status-filter">
              {documentsText.list.statusFilter}
            </label>
            <select
              id="document-status-filter"
              className="filter-bar__select form-field__input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {ALL_STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-bar__field">
            <label className="filter-bar__label" htmlFor="document-type-filter">
              {documentsText.list.typeFilter}
            </label>
            <select
              id="document-type-filter"
              className="filter-bar__select form-field__input"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {ALL_TYPE_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-bar__field">
            <label className="filter-bar__label" htmlFor="document-month-filter">
              {documentsText.list.monthFilter}
            </label>
            <select
              id="document-month-filter"
              className="filter-bar__select form-field__input"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-bar__field">
            <label className="filter-bar__label" htmlFor="document-year-filter">
              {documentsText.list.yearFilter}
            </label>
            <input
              id="document-year-filter"
              className="form-field__input"
              inputMode="numeric"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              placeholder={ui.all}
            />
          </div>
        </div>

        <SecondaryButton type="button" onClick={handleResetFilters}>
          {ui.resetFilters}
        </SecondaryButton>
        </div>
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}
      {isLoading ? <LoadingState message={ui.loading} /> : null}
      {!isLoading && errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      {showEmptyState ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}

      {showEmptyState && !hasFilters ? (
        <div className="documents-empty-action">
          <Link to="/documents/upload" className="button button--primary">
            {documentsText.actions.uploadDocument}
          </Link>
        </div>
      ) : null}

      {!isLoading && !errorMessage && documents.length > 0 ? (
        <div className="documents-table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th scope="col">{documentsText.list.columns.name}</th>
                <th scope="col">{documentsText.list.columns.client}</th>
                <th scope="col">{documentsText.list.columns.type}</th>
                <th scope="col">{documentsText.list.columns.date}</th>
                <th scope="col" className="documents-table__total-header">
                  {documentsText.list.columns.total}
                </th>
                <th scope="col">{documentsText.list.columns.status}</th>
                <th scope="col">{documentsText.list.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td data-label={documentsText.list.columns.name}>
                    <Link to={`/documents/${document.id}`} className="documents-table__link">
                      {document.document_name}
                    </Link>
                  </td>
                  <td data-label={documentsText.list.columns.client}>
                    {clientNameById.get(document.client_id) ?? ui.notAvailable}
                  </td>
                  <td data-label={documentsText.list.columns.type}>
                    {getDocumentTypeLabel(document.document_type)}
                  </td>
                  <td data-label={documentsText.list.columns.date}>
                    <DateDisplay value={document.document_date} dateOnly />
                  </td>
                  <td data-label={documentsText.list.columns.total} className="documents-table__total">
                    <MoneyDisplay value={document.total_amount} />
                  </td>
                  <td data-label={documentsText.list.columns.status}>
                    <StatusBadge
                      label={getDocumentStatusLabel(document.status)}
                      tone={getDocumentStatusTone(document.status)}
                    />
                  </td>
                  <td data-label={documentsText.list.columns.actions}>
                    <div className="documents-table__actions">
                      <div className="documents-table__actions-group">
                        <Link to={`/documents/${document.id}`} className="button button--secondary">
                          {ui.view}
                        </Link>
                        <Link
                          to={`/documents/${document.id}/edit`}
                          className="button button--secondary"
                        >
                          {ui.edit}
                        </Link>
                        <SecondaryButton type="button" onClick={() => handleDownload(document.id)}>
                          {documentsText.actions.downloadDocument}
                        </SecondaryButton>
                      </div>
                      <SecondaryButton
                        type="button"
                        className="documents-table__delete"
                        onClick={() => setPendingDeleteDocument(document)}
                      >
                        {documentsText.actions.deleteDocument}
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
        isOpen={Boolean(pendingDeleteDocument)}
        title={documentsText.confirm.deleteTitle}
        description={documentsText.confirm.deleteDescription}
        confirmLabel={documentsText.confirm.deleteConfirm}
        cancelLabel={documentsText.confirm.cancel}
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteDocument(null)}
      />
    </>
  );
}
