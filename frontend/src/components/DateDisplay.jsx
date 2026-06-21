export default function DateDisplay({ value, className = "" }) {
  if (!value) {
    return <span className={className}>—</span>;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className={className}>—</span>;
  }

  const formatted = new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

  return (
    <time className={className} dateTime={date.toISOString()}>
      {formatted}
    </time>
  );
}
