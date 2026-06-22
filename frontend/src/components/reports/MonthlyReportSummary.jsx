import MetricCard from "../MetricCard";
import { reports as reportsText } from "../../content/he";

export default function MonthlyReportSummary({ summary }) {
  return (
    <section className="monthly-report-summary" aria-labelledby="monthly-report-summary-heading">
      <h2 id="monthly-report-summary-heading" className="monthly-report-summary__title">
        {reportsText.summary.sectionTitle}
      </h2>
      <div className="monthly-report-summary__cards">
        <MetricCard label={reportsText.summary.clientsHandled} value={summary.clients_handled} />
        <MetricCard
          label={reportsText.summary.documentsInPeriod}
          value={summary.document_count}
        />
        <MetricCard
          label={reportsText.summary.totalBeforeVat}
          value={summary.total_before_vat}
          isMoney
        />
        <MetricCard label={reportsText.summary.vatTotal} value={summary.vat_total} isMoney />
        <MetricCard
          label={reportsText.summary.totalIncludingVat}
          value={summary.total_including_vat}
          isMoney
        />
      </div>
    </section>
  );
}
