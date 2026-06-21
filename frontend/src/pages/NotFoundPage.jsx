import { Link } from "react-router";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import PrimaryButton from "../components/PrimaryButton";
import { pages, ui } from "../content/he";

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title={pages.notFound.title} description={pages.notFound.description} />
      <EmptyState title={pages.notFound.title} description={pages.notFound.description} />
      <div className="not-found-actions">
        <Link to="/">
          <PrimaryButton>{ui.backToDashboard}</PrimaryButton>
        </Link>
      </div>
    </>
  );
}
