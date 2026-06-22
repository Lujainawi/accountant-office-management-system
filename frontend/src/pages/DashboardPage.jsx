import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import DashboardNeedsAttention from "../components/dashboard/DashboardNeedsAttention";
import { getDashboardSummary } from "../api/dashboard";
import { ApiError } from "../api/client";
import { dashboard as dashboardText, pages } from "../content/he";

function formatHebrewMonthYear(year, month) {
  const monthLabel = dashboardText.hebrewMonths[month - 1] ?? String(month);
  return `${monthLabel} ${year}`;
}

function formatWelcome(officeName) {
  return dashboardText.welcomeTemplate.replace("{officeName}", officeName);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : dashboardText.errors.loadFailed;
      setSummary(null);
      setErrorMessage(message || dashboardText.errors.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const isEmptyOffice = useMemo(() => {
    if (!summary) {
      return false;
    }
    return (
      summary.total_clients === 0 &&
      summary.total_documents === 0 &&
      summary.open_task_count === 0
    );
  }, [summary]);

  const financialSectionTitle = useMemo(() => {
    if (!summary?.current_month) {
      return dashboardText.financialSectionTemplate.replace("{monthLabel}", "—");
    }
    const monthLabel = formatHebrewMonthYear(
      summary.current_month.year,
      summary.current_month.month,
    );
    return dashboardText.financialSectionTemplate.replace("{monthLabel}", monthLabel);
  }, [summary]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (errorMessage) {
    return (
      <>
        <PageHeader title={pages.dashboard.title} description={pages.dashboard.description} />
        <ErrorMessage message={errorMessage} />
        <div className="dashboard-page__retry">
          <PrimaryButton type="button" onClick={loadSummary}>
            {dashboardText.errors.retry}
          </PrimaryButton>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={pages.dashboard.title}
        description={formatWelcome(summary.office_name)}
      />

      {isEmptyOffice ? (
        <EmptyState
          title={dashboardText.emptyOffice.title}
          description={dashboardText.emptyOffice.description}
          actionLabel={dashboardText.emptyOffice.actionLabel}
          onAction={() => navigate("/clients/new")}
        />
      ) : null}

      <DashboardMetrics summary={summary} financialSectionTitle={financialSectionTitle} />
      <DashboardNeedsAttention needsAttention={summary.needs_attention} />
    </>
  );
}
