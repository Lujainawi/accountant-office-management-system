import { Link } from "react-router";
import StatusBadge from "../StatusBadge";
import { integrations as integrationsText } from "../../content/he";
import {
  getIntegrationStatusLabel,
  getIntegrationStatusTone,
} from "./MockModuleBanner";

const MODULE_ROUTES = {
  email: "/future-modules/email",
  ocr: "/future-modules/ocr",
  tax_authority: "/future-modules/tax-authority",
  digital_signature: "/future-modules/digital-signature",
  online_payments: "/future-modules/online-payments",
  ai_assistant: "/future-modules/ai-assistant",
};

export default function IntegrationStatusCard({ statusRow }) {
  const moduleKey = statusRow.service_name;
  const moduleCopy = integrationsText.modules[moduleKey] ?? {};
  const route = MODULE_ROUTES[moduleKey] ?? "/future-modules";

  return (
    <article className="integration-card">
      <div className="integration-card__header">
        <h2 className="integration-card__title">{moduleCopy.title ?? moduleKey}</h2>
        <StatusBadge
          label={getIntegrationStatusLabel(statusRow.status)}
          tone={getIntegrationStatusTone(statusRow.status)}
        />
      </div>
      <p className="integration-card__description">{moduleCopy.shortDescription}</p>
      {statusRow.notes ? (
        <p className="integration-card__notes">{statusRow.notes}</p>
      ) : null}
      <p className="integration-card__mock-note">{integrationsText.cardMockNote}</p>
      <Link to={route} className="integration-card__link">
        {integrationsText.actions.viewModule}
      </Link>
    </article>
  );
}
