import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageHeader from "../components/PageHeader";
import SecondaryButton from "../components/SecondaryButton";
import DangerButton from "../components/DangerButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import TaskForm from "../components/tasks/TaskForm";
import { ApiError } from "../api/client";
import { listClients } from "../api/clients";
import { deleteTask, getTask, updateTask } from "../api/tasks";
import { pages, tasks as tasksText, ui } from "../content/he";
import { buildUpdatePayload, taskToFormValues } from "../utils/taskForm";
import { getTaskErrorMessage } from "../utils/taskErrors";

export default function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage("");
      setNotFound(false);

      try {
        const [taskData, clientsData] = await Promise.all([getTask(id), listClients()]);
        setTask(taskData);
        setClients(clientsData);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
          return;
        }
        const message = getTaskErrorMessage(error, tasksText.errors.loadTaskFailed);
        if (message) {
          setErrorMessage(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSubmit(values) {
    setServerError("");
    const payload = buildUpdatePayload(values, task);
    if (Object.keys(payload).length === 0) {
      setServerError(tasksText.validation.noChanges);
      return;
    }

    try {
      const updated = await updateTask(id, payload);
      setTask(updated);
      navigate("/tasks", { replace: true });
    } catch (error) {
      const message = getTaskErrorMessage(error, tasksText.errors.saveFailed);
      if (message) {
        setServerError(message);
      }
    }
  }

  async function handleDeleteConfirm() {
    setActionError("");
    setShowDeleteDialog(false);

    try {
      await deleteTask(id);
      navigate("/tasks", { replace: true });
    } catch (error) {
      const message = getTaskErrorMessage(error, tasksText.errors.deleteFailed);
      if (message) {
        setActionError(message);
      }
    }
  }

  if (isLoading) {
    return <LoadingState message={ui.loading} />;
  }

  if (notFound) {
    return (
      <>
        <PageHeader title={pages.editTask.title} description={pages.editTask.description} />
        <EmptyState
          title={tasksText.details.notFoundTitle}
          description={tasksText.details.notFoundDescription}
        />
        <div className="page-actions">
          <SecondaryButton type="button" onClick={() => navigate("/tasks")}>
            {tasksText.actions.backToTasks}
          </SecondaryButton>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  return (
    <>
      <PageHeader title={pages.editTask.title} description={pages.editTask.description} />

      <div className="page-actions">
        <DangerButton type="button" onClick={() => setShowDeleteDialog(true)}>
          {tasksText.actions.deleteTask}
        </DangerButton>
        <SecondaryButton type="button" onClick={() => navigate("/tasks")}>
          {tasksText.actions.backToTasks}
        </SecondaryButton>
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}

      <TaskForm
        clients={clients}
        initialValues={taskToFormValues(task)}
        submitLabel={tasksText.actions.saveChanges}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/tasks")}
        serverError={serverError}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={tasksText.confirm.deleteTitle}
        description={tasksText.confirm.deleteDescription}
        confirmLabel={tasksText.confirm.deleteConfirm}
        cancelLabel={tasksText.confirm.cancel}
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
