function parseLocalDateOnly(value) {
  const text = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { date, dateTime: text };
}

export default function DateDisplay({ value, className = "", dateOnly = false }) {
  if (!value) {
    return <span className={className}>—</span>;
  }

  if (dateOnly) {
    const parsed = parseLocalDateOnly(value);
    if (!parsed) {
      return <span className={className}>—</span>;
    }

    const formatted = new Intl.DateTimeFormat("he-IL", {
      dateStyle: "medium",
    }).format(parsed.date);

    return (
      <time className={className} dateTime={parsed.dateTime}>
        {formatted}
      </time>
    );
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
