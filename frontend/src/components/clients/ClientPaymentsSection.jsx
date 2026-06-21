import PrimaryButton from "../PrimaryButton";
import ClientWorkspaceSection from "./ClientWorkspaceSection";
import { clients as clientsText } from "../../content/he";

export default function ClientPaymentsSection() {
  const { payments, sections } = clientsText.workspace;

  return (
    <ClientWorkspaceSection id="client-payments-title" title={sections.payments}>
      <p className="client-workspace__section-text">{payments.explanation}</p>
      <div className="client-workspace__disabled-action">
        <PrimaryButton type="button" disabled>
          {payments.disabledAction}
        </PrimaryButton>
      </div>
    </ClientWorkspaceSection>
  );
}
