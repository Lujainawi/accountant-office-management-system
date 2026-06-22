import { Link } from "react-router";
import StatusBadge from "../StatusBadge";
import DateDisplay from "../DateDisplay";
import { dashboard as dashboardText, tasks as tasksText } from "../../content/he";
import { getDocumentStatusLabel, getDocumentStatusTone } from "../../utils/documentForm";
import { getTaskStatusLabel, getTaskStatusTone } from "../../utils/taskForm";

export default function DashboardNeedsAttention({ needsAttention }) {
  const { attention } = dashboardText;
  const urgentTasks = needsAttention?.urgent_tasks ?? [];
  const missingDocuments = needsAttention?.missing_information_documents ?? [];

  return (
    <section className="dashboard-attention" aria-labelledby="dashboard-attention-heading">
      <h2 id="dashboard-attention-heading" className="dashboard-summary__section-title">
        {attention.title}
      </h2>

      <div className="dashboard-attention__subsection">
        <h3 className="dashboard-attention__subtitle">{attention.urgentTasksTitle}</h3>
        {urgentTasks.length === 0 ? (
          <p className="dashboard-attention__empty">{attention.noUrgentTasks}</p>
        ) : (
          <ul className="dashboard-attention__list">
            {urgentTasks.map((task) => (
              <li key={task.id} className="dashboard-attention__item">
                <Link to={`/tasks/${task.id}/edit`} className="dashboard-attention__link">
                  <span className="dashboard-attention__primary">{task.title}</span>
                  <span className="dashboard-attention__meta">
                    {task.client_name}
                    {task.due_date ? (
                      <>
                        {" · "}
                        <DateDisplay value={task.due_date} />
                      </>
                    ) : null}
                  </span>
                </Link>
                <div className="dashboard-attention__badges">
                  <StatusBadge label={tasksText.badges.urgent} tone="danger" />
                  {task.is_overdue ? (
                    <StatusBadge label={tasksText.badges.overdue} tone="danger" />
                  ) : null}
                  <StatusBadge
                    label={getTaskStatusLabel(task.status)}
                    tone={getTaskStatusTone(task.status)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dashboard-attention__subsection">
        <h3 className="dashboard-attention__subtitle">{attention.missingDocumentsTitle}</h3>
        {missingDocuments.length === 0 ? (
          <p className="dashboard-attention__empty">{attention.noMissingDocuments}</p>
        ) : (
          <ul className="dashboard-attention__list">
            {missingDocuments.map((document) => (
              <li key={document.id} className="dashboard-attention__item">
                <Link to={`/documents/${document.id}`} className="dashboard-attention__link">
                  <span className="dashboard-attention__primary">{document.document_name}</span>
                  <span className="dashboard-attention__meta">
                    {document.client_name}
                    {" · "}
                    <DateDisplay value={document.document_date} />
                  </span>
                </Link>
                <div className="dashboard-attention__badges">
                  <StatusBadge
                    label={getDocumentStatusLabel(document.status)}
                    tone={getDocumentStatusTone(document.status)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
