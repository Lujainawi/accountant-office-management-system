import { Link } from "react-router";
import MoneyDisplay from "../MoneyDisplay";
import { reports as reportsText } from "../../content/he";

export default function MonthlyReportClientBreakdown({ clients }) {
  if (clients.length === 0) {
    return null;
  }

  return (
    <section
      className="monthly-report-clients"
      aria-labelledby="monthly-report-clients-heading"
    >
      <h2 id="monthly-report-clients-heading" className="monthly-report-clients__title">
        {reportsText.clientBreakdown.title}
      </h2>
      <div className="monthly-report-clients__table-wrap">
        <table className="monthly-report-clients__table">
          <caption className="monthly-report-clients__caption">
            {reportsText.clientBreakdown.title}
          </caption>
          <thead>
            <tr>
              <th scope="col">{reportsText.clientBreakdown.clientName}</th>
              <th scope="col">{reportsText.clientBreakdown.documentCount}</th>
              <th scope="col">{reportsText.clientBreakdown.totalBeforeVat}</th>
              <th scope="col">{reportsText.clientBreakdown.vatTotal}</th>
              <th scope="col">{reportsText.clientBreakdown.totalIncludingVat}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.client_id}>
                <td>
                  <Link to={`/clients/${client.client_id}`} className="monthly-report-clients__link">
                    {client.client_name}
                  </Link>
                </td>
                <td>{client.document_count}</td>
                <td>
                  <MoneyDisplay value={client.total_before_vat} />
                </td>
                <td>
                  <MoneyDisplay value={client.vat_total} />
                </td>
                <td>
                  <MoneyDisplay value={client.total_including_vat} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
