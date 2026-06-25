import { useEffect, useState } from "react";
import { Link } from "react-router";
import LoadingState from "../LoadingState";
import ErrorMessage from "../ErrorMessage";
import EmptyState from "../EmptyState";
import StatusBadge from "../StatusBadge";
import DateDisplay from "../DateDisplay";
import ClientWorkspaceSection from "./ClientWorkspaceSection";
import { listDocuments } from "../../api/documents";
import { clients as clientsText, ui } from "../../content/he";
import {
  getDocumentStatusLabel,
  getDocumentStatusTone,
} from "../../utils/documentForm";
import { getDocumentErrorMessage } from "../../utils/documentErrors";

export default function ClientDocumentsSection({ clientId }) {
  const { documents, sections } = clientsText.workspace;
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await listDocuments({ clientId, limit: 5 });
        setItems(data);
      } catch (error) {
        const message = getDocumentErrorMessage(error, documents.loadFailed);
        if (message) {
          setErrorMessage(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (clientId) {
      loadDocuments();
    }
  }, [clientId, documents.loadFailed]);

  if (isLoading) {
    return (
      <ClientWorkspaceSection id="client-documents-title" title={sections.documents}>
        <LoadingState message={ui.loading} />
      </ClientWorkspaceSection>
    );
  }

  if (errorMessage) {
    return (
      <ClientWorkspaceSection id="client-documents-title" title={sections.documents}>
        <ErrorMessage message={errorMessage} />
      </ClientWorkspaceSection>
    );
  }

  return (
    <ClientWorkspaceSection id="client-documents-title" title={sections.documents}>
      {items.length === 0 ? (
        <EmptyState title={sections.documents} description={documents.explanation} />
      ) : (
        <ul className="client-documents-list">
          {items.map((document) => (
            <li key={document.id} className="client-documents-list__item">
              <div className="client-documents-list__main">
                <Link to={`/documents/${document.id}`} className="client-documents-list__link">
                  {document.document_name}
                </Link>
                <span className="client-documents-list__date">
                  <DateDisplay value={document.document_date} dateOnly />
                </span>
              </div>
              <StatusBadge
                label={getDocumentStatusLabel(document.status)}
                tone={getDocumentStatusTone(document.status)}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="client-workspace__section-actions">
        <Link
          to={`/documents/upload?client_id=${clientId}`}
          className="button button--primary"
        >
          {documents.addDocument}
        </Link>
        <Link
          to={`/documents?client_id=${clientId}`}
          className="button button--secondary"
        >
          {documents.viewAll}
        </Link>
      </div>
    </ClientWorkspaceSection>
  );
}
