import PrimaryButton from "../PrimaryButton";
import ClientWorkspaceSection from "./ClientWorkspaceSection";
import { clients as clientsText } from "../../content/he";

export default function ClientDocumentsSection() {
  const { documents, sections } = clientsText.workspace;

  return (
    <ClientWorkspaceSection id="client-documents-title" title={sections.documents}>
      <p className="client-workspace__section-text">{documents.explanation}</p>
      <div className="client-workspace__disabled-action">
        <PrimaryButton type="button" disabled>
          {documents.disabledAction}
        </PrimaryButton>
      </div>
    </ClientWorkspaceSection>
  );
}
