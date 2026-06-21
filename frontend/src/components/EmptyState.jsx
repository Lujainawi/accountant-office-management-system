import StatusBadge from "./StatusBadge";
import PrimaryButton from "./PrimaryButton";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <div className="empty-state__header">
        <StatusBadge label={title} tone="neutral" />
      </div>
      <h2 id="empty-state-title" className="empty-state__title">
        {title}
      </h2>
      <p className="empty-state__description">{description}</p>
      {actionLabel && onAction && (
        <div>
          <PrimaryButton type="button" onClick={onAction}>
            {actionLabel}
          </PrimaryButton>
        </div>
      )}
    </section>
  );
}
