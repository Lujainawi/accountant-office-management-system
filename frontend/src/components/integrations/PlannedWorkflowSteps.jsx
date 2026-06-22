export default function PlannedWorkflowSteps({ steps, title, description }) {
  if (!steps?.length) {
    return null;
  }

  return (
    <section className="planned-workflow" aria-labelledby="planned-workflow-title">
      <h2 id="planned-workflow-title" className="planned-workflow__title">
        {title}
      </h2>
      {description ? <p className="planned-workflow__description">{description}</p> : null}
      <ol className="planned-workflow__list">
        {steps.map((step) => (
          <li key={step.order} className="planned-workflow__item">
            <span className="planned-workflow__step-number">{step.order}</span>
            <div>
              <h3 className="planned-workflow__step-title">{step.title}</h3>
              <p className="planned-workflow__step-description">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
