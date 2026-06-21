import StatusBadge from "../StatusBadge";
import {
  getClientStatusLabel,
  getClientStatusTone,
  getClientTypeLabel,
} from "../../utils/clientForm";
import { ui } from "../../content/he";

function ContactItem({ label, value }) {
  if (value == null || value === "") {
    return null;
  }

  return (
    <span className="client-workspace-header__contact-item">
      <span className="client-workspace-header__contact-label">{label}:</span>{" "}
      <span dir="ltr">{value}</span>
    </span>
  );
}

export default function ClientWorkspaceHeader({ client }) {
  const contactItems = [
    client.phone ? { label: ui.contactPhone, value: client.phone } : null,
    client.email ? { label: ui.contactEmail, value: client.email } : null,
    client.business_id ? { label: ui.contactBusinessId, value: client.business_id } : null,
  ].filter(Boolean);

  return (
    <div className="client-workspace-header">
      <div className="client-workspace-header__identity">
        <StatusBadge
          label={getClientStatusLabel(client.status)}
          tone={getClientStatusTone(client.status)}
        />
        <span className="client-workspace-header__type">
          {getClientTypeLabel(client.client_type)}
        </span>
      </div>

      {client.business_name ? (
        <p className="client-workspace-header__business">{client.business_name}</p>
      ) : null}

      {contactItems.length > 0 ? (
        <div className="client-workspace-header__contact">
          {contactItems.map((item) => (
            <ContactItem key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
