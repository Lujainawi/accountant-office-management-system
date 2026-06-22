import MetricCard from "../MetricCard";
import { dashboard as dashboardText } from "../../content/he";

function StatusCount({ label, value }) {
  return (
    <div className="dashboard-summary__status-item">
      <span className="dashboard-summary__status-label">{label}</span>
      <span className="dashboard-summary__status-value">{value}</span>
    </div>
  );
}

export default function DashboardMetrics({ summary, financialSectionTitle }) {
  const { metrics, sections } = dashboardText;

  return (
    <div className="dashboard-summary">
      <section className="dashboard-summary__section" aria-labelledby="dashboard-clients-heading">
        <h2 id="dashboard-clients-heading" className="dashboard-summary__section-title">
          {sections.clients}
        </h2>
        <div className="dashboard-summary__cards dashboard-summary__cards--two">
          <MetricCard label={metrics.totalClients} value={summary.total_clients} />
          <MetricCard label={metrics.activeClients} value={summary.active_clients} />
        </div>
      </section>

      <section className="dashboard-summary__section" aria-labelledby="dashboard-documents-heading">
        <h2 id="dashboard-documents-heading" className="dashboard-summary__section-title">
          {sections.documents}
        </h2>
        <div className="dashboard-summary__cards dashboard-summary__cards--one">
          <MetricCard label={metrics.totalDocuments} value={summary.total_documents} />
        </div>
        <div
          className="dashboard-summary__status-strip"
          aria-label={metrics.documentStatusTitle}
        >
          <StatusCount label={metrics.statusNew} value={summary.documents_by_status.new} />
          <StatusCount
            label={metrics.statusInProgress}
            value={summary.documents_by_status.in_progress}
          />
          <StatusCount
            label={metrics.statusCompleted}
            value={summary.documents_by_status.completed}
          />
          <StatusCount
            label={metrics.statusMissingInfo}
            value={summary.documents_by_status.missing_information}
          />
        </div>
      </section>

      <section className="dashboard-summary__section" aria-labelledby="dashboard-tasks-heading">
        <h2 id="dashboard-tasks-heading" className="dashboard-summary__section-title">
          {sections.tasks}
        </h2>
        <div className="dashboard-summary__cards dashboard-summary__cards--two">
          <MetricCard label={metrics.openTasks} value={summary.open_task_count} />
          <MetricCard label={metrics.urgentTasks} value={summary.urgent_task_count} />
        </div>
      </section>

      <section className="dashboard-summary__section" aria-labelledby="dashboard-financial-heading">
        <h2 id="dashboard-financial-heading" className="dashboard-summary__section-title">
          {financialSectionTitle}
        </h2>
        <div className="dashboard-summary__cards dashboard-summary__cards--three">
          <MetricCard
            label={metrics.totalBeforeVat}
            value={summary.current_month_total_before_vat}
            isMoney
          />
          <MetricCard
            label={metrics.vatTotal}
            value={summary.current_month_vat_total}
            isMoney
          />
          <MetricCard
            label={metrics.totalIncludingVat}
            value={summary.current_month_total_including_vat}
            isMoney
          />
        </div>
      </section>
    </div>
  );
}
