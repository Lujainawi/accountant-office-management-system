import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import MonthlyReportFilters from "../components/reports/MonthlyReportFilters";
import MonthlyReportSummary from "../components/reports/MonthlyReportSummary";
import MonthlyReportStatusBreakdown from "../components/reports/MonthlyReportStatusBreakdown";
import MonthlyReportClientBreakdown from "../components/reports/MonthlyReportClientBreakdown";
import { getMonthlyReport } from "../api/reports";
import { ApiError } from "../api/client";
import { pages, reports as reportsText } from "../content/he";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

function getCurrentMonthValue() {
  return String(new Date().getMonth() + 1);
}

function getCurrentYearValue() {
  return String(new Date().getFullYear());
}

function mapApiValidationError(message) {
  const validationMessages = reportsText.validation;
  if (message === "יש לבחור חודש.") {
    return validationMessages.monthRequired;
  }
  if (message === "יש לבחור שנה.") {
    return validationMessages.yearRequired;
  }
  if (message === "חודש לא תקין. יש לבחור ערך בין 1 ל-12.") {
    return validationMessages.invalidMonth;
  }
  if (message === "שנה לא תקינה. יש לבחור ערך בין 1900 ל-2100.") {
    return validationMessages.invalidYear;
  }
  return message;
}

function validateFilters(monthValue, yearValue) {
  const month = Number.parseInt(monthValue, 10);
  if (!monthValue) {
    return reportsText.validation.monthRequired;
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return reportsText.validation.invalidMonth;
  }

  if (!yearValue.trim()) {
    return reportsText.validation.yearRequired;
  }
  if (!/^\d+$/.test(yearValue.trim())) {
    return reportsText.validation.invalidYear;
  }

  const year = Number.parseInt(yearValue, 10);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return reportsText.validation.invalidYear;
  }

  return "";
}

export default function MonthlyReportsPage() {
  const [draftMonth, setDraftMonth] = useState(getCurrentMonthValue);
  const [draftYear, setDraftYear] = useState(getCurrentYearValue);
  const [appliedMonth, setAppliedMonth] = useState(getCurrentMonthValue);
  const [appliedYear, setAppliedYear] = useState(getCurrentYearValue);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const loadReport = useCallback(async (monthValue, yearValue, { submitting = false } = {}) => {
    if (submitting) {
      setIsSubmitting(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage("");

    try {
      const month = Number.parseInt(monthValue, 10);
      const year = Number.parseInt(yearValue, 10);
      const data = await getMonthlyReport(month, year);
      setReport(data);
      setAppliedMonth(monthValue);
      setAppliedYear(yearValue);
      setValidationError("");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? mapApiValidationError(error.message)
          : reportsText.errors.loadFailed;
      setReport(null);
      setErrorMessage(message || reportsText.errors.loadFailed);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    loadReport(getCurrentMonthValue(), getCurrentYearValue());
  }, [loadReport]);

  const isEmptyPeriod = useMemo(() => {
    if (!report) {
      return false;
    }
    return report.summary.document_count === 0;
  }, [report]);

  function handleApplyFilters() {
    const nextValidationError = validateFilters(draftMonth, draftYear);
    if (nextValidationError) {
      setValidationError(nextValidationError);
      return;
    }

    setValidationError("");
    loadReport(draftMonth, draftYear, { submitting: true });
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader title={pages.reports.title} description={pages.reports.description} />

      <p className="monthly-report-disclaimer" role="note">
        {reportsText.disclaimer}
      </p>

      <MonthlyReportFilters
        month={draftMonth}
        year={draftYear}
        validationError={validationError}
        isSubmitting={isSubmitting}
        onMonthChange={setDraftMonth}
        onYearChange={setDraftYear}
        onApply={handleApplyFilters}
      />

      {errorMessage ? (
        <>
          <ErrorMessage message={errorMessage} />
          <div className="monthly-report-page__retry">
            <PrimaryButton type="button" onClick={() => loadReport(appliedMonth, appliedYear)}>
              {reportsText.errors.retry}
            </PrimaryButton>
          </div>
        </>
      ) : null}

      {!errorMessage && report ? (
        <>
          {isEmptyPeriod ? (
            <EmptyState
              title={reportsText.emptyPeriod.title}
              description={reportsText.emptyPeriod.description}
            />
          ) : null}

          <MonthlyReportSummary summary={report.summary} />
          <MonthlyReportStatusBreakdown documentsByStatus={report.documents_by_status} />
          <MonthlyReportClientBreakdown clients={report.clients} />
        </>
      ) : null}
    </>
  );
}
