import MoneyDisplay from "./MoneyDisplay";

export default function MetricCard({ label, value, isMoney = false }) {
  return (
    <article className="metric-card" aria-label={label}>
      <h3 className="metric-card__label">{label}</h3>
      <p className="metric-card__value">
        {isMoney ? <MoneyDisplay value={value} /> : value}
      </p>
    </article>
  );
}
