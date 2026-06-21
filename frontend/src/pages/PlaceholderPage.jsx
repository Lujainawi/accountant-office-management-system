import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { ui } from "../content/he";

export default function PlaceholderPage({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState title={ui.emptyStateTitle} description={description} />
    </>
  );
}
