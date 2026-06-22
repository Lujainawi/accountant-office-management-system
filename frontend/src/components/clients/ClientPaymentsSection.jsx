import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import LoadingState from "../LoadingState";
import ErrorMessage from "../ErrorMessage";
import EmptyState from "../EmptyState";
import StatusBadge from "../StatusBadge";
import MoneyDisplay from "../MoneyDisplay";
import DateDisplay from "../DateDisplay";
import ClientWorkspaceSection from "./ClientWorkspaceSection";
import { listDocuments } from "../../api/documents";
import { listPayments } from "../../api/payments";
import { clients as clientsText, payments as paymentsText, ui } from "../../content/he";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusTone,
} from "../../utils/paymentForm";
import { getPaymentErrorMessage } from "../../utils/paymentErrors";

export default function ClientPaymentsSection({ clientId }) {
  const { payments: paymentsSection, sections } = clientsText.workspace;
  const [items, setItems] = useState([]);
  const [documentNames, setDocumentNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPayments() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [paymentsData, documentsData] = await Promise.all([
          listPayments({ clientId }),
          listDocuments({ clientId }),
        ]);
        setItems(paymentsData);
        const names = {};
        for (const document of documentsData) {
          names[document.id] = document.document_name;
        }
        setDocumentNames(names);
      } catch (error) {
        const message = getPaymentErrorMessage(error, paymentsSection.loadFailed);
        if (message) {
          setErrorMessage(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (clientId) {
      loadPayments();
    }
  }, [clientId, paymentsSection.loadFailed]);

  const sortedItems = useMemo(() => items, [items]);

  if (isLoading) {
    return (
      <ClientWorkspaceSection id="client-payments-title" title={sections.payments}>
        <LoadingState message={ui.loading} />
      </ClientWorkspaceSection>
    );
  }

  if (errorMessage) {
    return (
      <ClientWorkspaceSection id="client-payments-title" title={sections.payments}>
        <ErrorMessage message={errorMessage} />
      </ClientWorkspaceSection>
    );
  }

  return (
    <ClientWorkspaceSection id="client-payments-title" title={sections.payments}>
      <p className="client-workspace__section-text payment-disclaimer">{paymentsText.disclaimer}</p>

      {sortedItems.length === 0 ? (
        <EmptyState title={sections.payments} description={paymentsSection.explanation} />
      ) : (
        <ul className="client-payments-list">
          {sortedItems.map((payment) => (
            <li key={payment.id} className="client-payments-list__item">
              <div className="client-payments-list__main">
                <Link to={`/payments/${payment.id}/edit`} className="client-payments-list__link">
                  <MoneyDisplay value={payment.amount} />
                </Link>
                <div className="client-payments-list__meta">
                  {payment.payment_date ? (
                    <span>
                      {paymentsText.list.paymentDateLabel}:{" "}
                      <DateDisplay value={payment.payment_date} dateOnly />
                    </span>
                  ) : null}
                  {payment.payment_method ? (
                    <span>
                      {paymentsText.list.methodLabel}: {getPaymentMethodLabel(payment.payment_method)}
                    </span>
                  ) : null}
                  {payment.payment_period ? (
                    <span>
                      {paymentsText.list.periodLabel}: {payment.payment_period}
                    </span>
                  ) : null}
                  {payment.document_id ? (
                    <span>
                      {paymentsText.list.documentLabel}:{" "}
                      {documentNames[payment.document_id] ?? ui.notAvailable}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="client-payments-list__badges">
                <StatusBadge
                  label={getPaymentStatusLabel(payment.status)}
                  tone={getPaymentStatusTone(payment.status)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="client-workspace__section-actions">
        <Link
          to={`/payments/new?client_id=${clientId}`}
          className="button button--primary"
        >
          {paymentsSection.addPayment}
        </Link>
      </div>
    </ClientWorkspaceSection>
  );
}
