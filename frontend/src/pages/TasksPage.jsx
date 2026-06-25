import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import DateDisplay from "../components/DateDisplay";
import ConfirmDialog from "../components/ConfirmDialog";
import { listClients } from "../api/clients";
import { deleteTask, listTasks, updateTask } from "../api/tasks";
import { pages, tasks as tasksText, ui } from "../content/he";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  getTaskPriorityLabel,
  getTaskPriorityTone,
  getTaskStatusLabel,
  getTaskStatusTone,
} from "../utils/taskForm";
import { getTaskErrorMessage } from "../utils/taskErrors";

const ALL_STATUS_OPTIONS = [{ value: "", label: ui.all }, ...TASK_STATUS_OPTIONS];
const ALL_PRIORITY_OPTIONS = [{ value: "", label: ui.all }, ...TASK_PRIORITY_OPTIONS];

function TaskIndicators({ task }) {
  if (!task.is_overdue) {
    return null;
  }

  return (
    <div className="task-indicators">
      <StatusBadge label={tasksText.badges.overdue} tone="danger" />
    </div>
  );
}

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get("client_id") ?? "";

  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [clientFilter, setClientFilter] = useState(initialClientId);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [pendingDeleteTask, setPendingDeleteTask] = useState(null);
  const [pendingDoneTask, setPendingDoneTask] = useState(null);

  const clientNameById = useMemo(() => {
    const map = new Map();
    for (const client of clients) {
      map.set(client.id, client.client_name || ui.notAvailable);
    }
    return map;
  }, [clients]);

  async function loadPage() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [tasksData, clientsData] = await Promise.all([
        listTasks({
          clientId: clientFilter || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        }),
        listClients(),
      ]);
      setItems(tasksData);
      setClients(clientsData);
    } catch (error) {
      const message = getTaskErrorMessage(error, tasksText.errors.loadFailed);
      if (message) {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, [clientFilter, statusFilter, priorityFilter]);

  async function handleDeleteConfirm() {
    if (!pendingDeleteTask) {
      return;
    }

    setActionError("");
    try {
      await deleteTask(pendingDeleteTask.id);
      setPendingDeleteTask(null);
      await loadPage();
    } catch (error) {
      const message = getTaskErrorMessage(error, tasksText.errors.deleteFailed);
      if (message) {
        setActionError(message);
      }
      setPendingDeleteTask(null);
    }
  }

  async function handleMarkDoneConfirm() {
    if (!pendingDoneTask) {
      return;
    }

    setActionError("");
    try {
      await updateTask(pendingDoneTask.id, { status: "done" });
      setPendingDoneTask(null);
      await loadPage();
    } catch (error) {
      const message = getTaskErrorMessage(error, tasksText.errors.markDoneFailed);
      if (message) {
        setActionError(message);
      }
      setPendingDoneTask(null);
    }
  }

  const hasFilters = Boolean(clientFilter || statusFilter || priorityFilter);
  const showEmptyState = !isLoading && !errorMessage && items.length === 0;
  const emptyTitle = hasFilters ? tasksText.list.noResultsTitle : tasksText.list.emptyTitle;
  const emptyDescription = hasFilters
    ? tasksText.list.noResultsDescription
    : tasksText.list.emptyDescription;

  return (
    <>
      <PageHeader title={pages.tasks.title} description={pages.tasks.description} />

      <div className="tasks-toolbar">
        <Link to="/tasks/new" className="button button--primary tasks-toolbar__add">
          {tasksText.actions.addTask}
        </Link>
      </div>

      <div className="tasks-filters">
        <div className="tasks-filters__grid">
          <div className="filter-bar__field">
            <label className="filter-bar__label" htmlFor="task-client-filter">
              {tasksText.fields.clientFilter}
            </label>
            <select
              id="task-client-filter"
              className="filter-bar__select form-field__input"
              value={clientFilter}
              onChange={(event) => setClientFilter(event.target.value)}
            >
              <option value="">{ui.all}</option>
              {clients.map((client) => (
                <option key={client.id} value={String(client.id)}>
                  {client.client_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-bar__field">
            <label className="filter-bar__label" htmlFor="task-status-filter">
              {tasksText.fields.statusFilter}
            </label>
            <select
              id="task-status-filter"
              className="filter-bar__select form-field__input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {ALL_STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-bar__field">
            <label className="filter-bar__label" htmlFor="task-priority-filter">
              {tasksText.fields.priorityFilter}
            </label>
            <select
              id="task-priority-filter"
              className="filter-bar__select form-field__input"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              {ALL_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters ? (
          <div className="tasks-filters__actions">
            <SecondaryButton
              type="button"
              onClick={() => {
                setClientFilter("");
                setStatusFilter("");
                setPriorityFilter("");
              }}
            >
              {ui.resetFilters}
            </SecondaryButton>
          </div>
        ) : null}
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}

      {isLoading ? <LoadingState message={ui.loading} /> : null}
      {!isLoading && errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      {showEmptyState ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}

      {!isLoading && !errorMessage && items.length > 0 ? (
        <div className="tasks-table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th scope="col">{tasksText.list.columnTitle}</th>
                <th scope="col">{tasksText.list.columnClient}</th>
                <th scope="col">{tasksText.list.columnDueDate}</th>
                <th scope="col">{tasksText.list.columnPriority}</th>
                <th scope="col">{tasksText.list.columnStatus}</th>
                <th scope="col">{tasksText.list.columnActions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((task) => (
                <tr
                  key={task.id}
                  className={task.is_overdue ? "tasks-table__row--overdue" : undefined}
                >
                  <td data-label={tasksText.list.columnTitle}>
                    <div className="task-row__title-cell">
                      <Link to={`/tasks/${task.id}/edit`} className="tasks-table__link">
                        {task.title}
                      </Link>
                      <TaskIndicators task={task} />
                    </div>
                  </td>
                  <td data-label={tasksText.list.columnClient}>
                    {clientNameById.get(task.client_id) ?? ui.notAvailable}
                  </td>
                  <td data-label={tasksText.list.columnDueDate}>
                    {task.due_date ? <DateDisplay value={task.due_date} /> : ui.notAvailable}
                  </td>
                  <td data-label={tasksText.list.columnPriority}>
                    <StatusBadge
                      label={getTaskPriorityLabel(task.priority)}
                      tone={getTaskPriorityTone(task.priority)}
                    />
                  </td>
                  <td data-label={tasksText.list.columnStatus}>
                    <StatusBadge
                      label={getTaskStatusLabel(task.status)}
                      tone={getTaskStatusTone(task.status)}
                    />
                  </td>
                  <td data-label={tasksText.list.columnActions}>
                    <div className="tasks-table__actions">
                      {task.status !== "done" ? (
                        <PrimaryButton type="button" onClick={() => setPendingDoneTask(task)}>
                          {tasksText.actions.markDone}
                        </PrimaryButton>
                      ) : null}
                      <Link to={`/tasks/${task.id}/edit`} className="button button--secondary">
                        {ui.edit}
                      </Link>
                      <SecondaryButton
                        type="button"
                        className="tasks-table__delete"
                        onClick={() => setPendingDeleteTask(task)}
                      >
                        {tasksText.actions.deleteTask}
                      </SecondaryButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteTask)}
        title={tasksText.confirm.deleteTitle}
        description={tasksText.confirm.deleteDescription}
        confirmLabel={tasksText.confirm.deleteConfirm}
        cancelLabel={tasksText.confirm.cancel}
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteTask(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDoneTask)}
        title={tasksText.confirm.markDoneTitle}
        description={tasksText.confirm.markDoneDescription}
        confirmLabel={tasksText.confirm.markDoneConfirm}
        cancelLabel={tasksText.confirm.cancel}
        onConfirm={handleMarkDoneConfirm}
        onCancel={() => setPendingDoneTask(null)}
      />
    </>
  );
}
