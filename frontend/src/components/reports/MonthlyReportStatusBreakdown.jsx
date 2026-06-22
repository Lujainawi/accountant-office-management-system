import { reports as reportsText } from "../../content/he";
import { DOCUMENT_STATUS_OPTIONS } from "../../utils/documentForm";

export default function MonthlyReportStatusBreakdown({ documentsByStatus }) {
  return (
    <section
      className="monthly-report-status"
      aria-labelledby="monthly-report-status-heading"
    >
      <h2 id="monthly-report-status-heading" className="monthly-report-status__title">
        {reportsText.statusBreakdown.title}
      </h2>
      <div className="monthly-report-status__strip" aria-label={reportsText.statusBreakdown.title}>
        {DOCUMENT_STATUS_OPTIONS.map((option) => (
          <div key={option.value} className="monthly-report-status__item">
            <span className="monthly-report-status__label">{option.label}</span>
            <span className="monthly-report-status__value">
              {documentsByStatus[option.value] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
