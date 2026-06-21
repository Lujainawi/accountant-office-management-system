import MetricCard from "../MetricCard";
import { clients as clientsText } from "../../content/he";

function StatusCount({ label, value }) {
  return (
    <div className="client-workspace-summary__status-item">
      <span className="client-workspace-summary__status-label">{label}</span>
      <span className="client-workspace-summary__status-value">{value}</span>
    </div>
  );
}

export default function ClientWorkspaceSummary({ summary }) {
  const { workspace } = clientsText;

  return (
    <div className="client-workspace-summary">
      <div className="client-workspace-summary__cards">
        <MetricCard label={workspace.summary.documents} value={summary.document_count} />
        <MetricCard label={workspace.summary.openTasks} value={summary.open_task_count} />
        <MetricCard
          label={workspace.summary.totalBeforeVat}
          value={summary.total_before_vat}
          isMoney
        />
        <MetricCard label={workspace.summary.vatTotal} value={summary.vat_total} isMoney />
        <MetricCard
          label={workspace.summary.totalIncludingVat}
          value={summary.total_including_vat}
          isMoney
        />
        <MetricCard
          label={workspace.summary.paymentRecords}
          value={summary.payment_record_count}
        />
      </div>

      <div
        className="client-workspace-summary__status-strip"
        aria-label={workspace.summary.documentStatusTitle}
      >
        <StatusCount
          label={workspace.summary.statusNew}
          value={summary.documents_by_status.new}
        />
        <StatusCount
          label={workspace.summary.statusInProgress}
          value={summary.documents_by_status.in_progress}
        />
        <StatusCount
          label={workspace.summary.statusCompleted}
          value={summary.documents_by_status.completed}
        />
        <StatusCount
          label={workspace.summary.statusMissingInfo}
          value={summary.documents_by_status.missing_information}
        />
      </div>
    </div>
  );
}
