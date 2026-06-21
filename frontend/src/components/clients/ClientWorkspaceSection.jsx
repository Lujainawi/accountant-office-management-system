export default function ClientWorkspaceSection({ id, title, children }) {
  return (
    <section className="client-workspace__section" aria-labelledby={id}>
      <h2 id={id} className="client-workspace__section-title">
        {title}
      </h2>
      {children}
    </section>
  );
}
