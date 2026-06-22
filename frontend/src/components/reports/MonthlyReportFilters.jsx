import PrimaryButton from "../PrimaryButton";
import { dashboard, reports as reportsText } from "../../content/he";

const MONTH_OPTIONS = dashboard.hebrewMonths.map((label, index) => ({
  value: String(index + 1),
  label,
}));

export default function MonthlyReportFilters({
  month,
  year,
  validationError,
  isSubmitting,
  onMonthChange,
  onYearChange,
  onApply,
}) {
  return (
    <section className="monthly-report-filters" aria-labelledby="monthly-report-filters-heading">
      <h2 id="monthly-report-filters-heading" className="monthly-report-filters__title">
        {reportsText.filters.monthLabel} / {reportsText.filters.yearLabel}
      </h2>

      <form
        className="monthly-report-filters__form"
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
      >
        <div className="monthly-report-filters__fields">
          <label className="monthly-report-filters__field" htmlFor="monthly-report-month">
            <span className="monthly-report-filters__label">{reportsText.filters.monthLabel}</span>
            <select
              id="monthly-report-month"
              className="monthly-report-filters__select"
              value={month}
              onChange={(event) => onMonthChange(event.target.value)}
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="monthly-report-filters__field" htmlFor="monthly-report-year">
            <span className="monthly-report-filters__label">{reportsText.filters.yearLabel}</span>
            <input
              id="monthly-report-year"
              className="monthly-report-filters__input"
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              step="1"
              value={year}
              onChange={(event) => onYearChange(event.target.value)}
            />
          </label>
        </div>

        {validationError ? (
          <p className="monthly-report-filters__error" role="alert">
            {validationError}
          </p>
        ) : null}

        <PrimaryButton type="submit" disabled={isSubmitting}>
          {reportsText.filters.apply}
        </PrimaryButton>
      </form>
    </section>
  );
}
