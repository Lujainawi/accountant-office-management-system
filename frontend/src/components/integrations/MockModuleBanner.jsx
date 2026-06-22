import StatusBadge from "../StatusBadge";
import { integrations as integrationsText } from "../../content/he";

const STATUS_TONE_MAP = {
  planned: "neutral",
  mock_mode: "warning",
  coming_soon: "warning",
  not_configured: "neutral",
};

export function getIntegrationStatusLabel(status) {
  return integrationsText.statusLabels[status] ?? status;
}

export function getIntegrationStatusTone(status) {
  return STATUS_TONE_MAP[status] ?? "neutral";
}

export default function MockModuleBanner({
  title,
  description,
  status,
  statusLabel,
  extraNotice,
}) {
  const badgeLabel = statusLabel ?? getIntegrationStatusLabel(status);
  const tone = getIntegrationStatusTone(status);

  return (
    <section className="mock-module-banner" aria-labelledby="mock-module-banner-title">
      <div className="mock-module-banner__header">
        <h2 id="mock-module-banner-title" className="mock-module-banner__title">
          {title}
        </h2>
        {badgeLabel ? <StatusBadge label={badgeLabel} tone={tone} /> : null}
      </div>
      <p className="mock-module-banner__description">{description}</p>
      <p className="mock-module-banner__notice" role="note">
        {integrationsText.globalDisclaimer}
      </p>
      {extraNotice ? (
        <p className="mock-module-banner__extra" role="note">
          {extraNotice}
        </p>
      ) : null}
    </section>
  );
}
