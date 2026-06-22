import { useEffect, useState } from "react";
import { Link } from "react-router";
import LoadingState from "../LoadingState";
import ErrorMessage from "../ErrorMessage";
import EmptyState from "../EmptyState";
import StatusBadge from "../StatusBadge";
import DateDisplay from "../DateDisplay";
import ClientWorkspaceSection from "./ClientWorkspaceSection";
import { listTasks } from "../../api/tasks";
import { clients as clientsText, tasks as tasksText, ui } from "../../content/he";
import {
  getTaskPriorityLabel,
  getTaskPriorityTone,
  getTaskStatusLabel,
  getTaskStatusTone,
} from "../../utils/taskForm";
import { getTaskErrorMessage } from "../../utils/taskErrors";

export default function ClientTasksSection({ clientId }) {
  const { tasks, sections } = clientsText.workspace;
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await listTasks({ clientId, limit: 5 });
        setItems(data);
      } catch (error) {
        const message = getTaskErrorMessage(error, tasks.loadFailed);
        if (message) {
          setErrorMessage(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (clientId) {
      loadTasks();
    }
  }, [clientId, tasks.loadFailed]);

  if (isLoading) {
    return (
      <ClientWorkspaceSection id="client-tasks-title" title={sections.tasks}>
        <LoadingState message={ui.loading} />
      </ClientWorkspaceSection>
    );
  }

  if (errorMessage) {
    return (
      <ClientWorkspaceSection id="client-tasks-title" title={sections.tasks}>
        <ErrorMessage message={errorMessage} />
      </ClientWorkspaceSection>
    );
  }

  return (
    <ClientWorkspaceSection id="client-tasks-title" title={sections.tasks}>
      {items.length === 0 ? (
        <EmptyState title={sections.tasks} description={tasks.explanation} />
      ) : (
        <ul className="client-tasks-list">
          {items.map((task) => (
            <li key={task.id} className="client-tasks-list__item">
              <div className="client-tasks-list__main">
                <Link to={`/tasks/${task.id}/edit`} className="client-tasks-list__link">
                  {task.title}
                </Link>
                <span className="client-tasks-list__date">
                  {task.due_date ? <DateDisplay value={task.due_date} /> : ui.notAvailable}
                </span>
              </div>
              <div className="client-tasks-list__badges">
                {task.priority === "urgent" ? (
                  <StatusBadge label={tasksText.badges.urgent} tone="danger" />
                ) : null}
                {task.is_overdue ? (
                  <StatusBadge label={tasksText.badges.overdue} tone="danger" />
                ) : null}
                <StatusBadge
                  label={getTaskPriorityLabel(task.priority)}
                  tone={getTaskPriorityTone(task.priority)}
                />
                <StatusBadge
                  label={getTaskStatusLabel(task.status)}
                  tone={getTaskStatusTone(task.status)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="client-workspace__section-actions">
        <Link
          to={`/tasks/new?client_id=${clientId}`}
          className="button button--primary"
        >
          {tasks.addTask}
        </Link>
        <Link
          to={`/tasks?client_id=${clientId}`}
          className="button button--secondary"
        >
          {tasks.viewAll}
        </Link>
      </div>
    </ClientWorkspaceSection>
  );
}
