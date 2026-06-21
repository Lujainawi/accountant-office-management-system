import PrimaryButton from "../PrimaryButton";
import ClientWorkspaceSection from "./ClientWorkspaceSection";
import { clients as clientsText } from "../../content/he";

export default function ClientTasksSection() {
  const { tasks, sections } = clientsText.workspace;

  return (
    <ClientWorkspaceSection id="client-tasks-title" title={sections.tasks}>
      <p className="client-workspace__section-text">{tasks.explanation}</p>
      <div className="client-workspace__disabled-action">
        <PrimaryButton type="button" disabled>
          {tasks.disabledAction}
        </PrimaryButton>
      </div>
    </ClientWorkspaceSection>
  );
}
