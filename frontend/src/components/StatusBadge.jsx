const toneClassMap = {
  neutral: "status-badge--neutral",
  success: "status-badge--success",
  warning: "status-badge--warning",
  danger: "status-badge--danger",
};

export default function StatusBadge({ label, tone = "neutral" }) {
  return (
    <span className={`status-badge ${toneClassMap[tone] ?? toneClassMap.neutral}`}>
      {label}
    </span>
  );
}
