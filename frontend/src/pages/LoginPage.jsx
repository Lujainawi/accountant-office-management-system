import { Link } from "react-router";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import PrimaryButton from "../components/PrimaryButton";
import { pages, ui } from "../content/he";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page__card">
        <PageHeader title={pages.login.title} description={pages.login.description} />
        <EmptyState title={ui.emptyStateTitle} description={pages.login.description} />
        <div className="not-found-actions">
          <Link to="/">
            <PrimaryButton>{ui.backToDashboard}</PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
