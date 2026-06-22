import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import PageHeader from "../components/PageHeader";
import SecondaryButton from "../components/SecondaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import TaskForm from "../components/tasks/TaskForm";
import { listClients } from "../api/clients";
import { createTask } from "../api/tasks";
import { pages, tasks as tasksText, ui } from "../content/he";
import { EMPTY_TASK_FORM_VALUES, buildCreatePayload } from "../utils/taskForm";
import { getTaskErrorMessage } from "../utils/taskErrors";

export default function AddTaskPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetClientId = searchParams.get("client_id") ?? "";

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError("");
      try {
        const clientsData = await listClients();
        setClients(clientsData);
      } catch (error) {
        const message = getTaskErrorMessage(error, tasksText.errors.loadFailed);
        if (message) {
          setLoadError(message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const initialValues = useMemo(
    () => ({
      ...EMPTY_TASK_FORM_VALUES,
      client_id: presetClientId,
    }),
    [presetClientId],
  );

  async function handleSubmit(values) {
    setServerError("");
    try {
      const task = await createTask(buildCreatePayload(values));
      navigate(`/tasks/${task.id}/edit`, { replace: true });
    } catch (error) {
      const message = getTaskErrorMessage(error, tasksText.errors.saveFailed);
      if (message) {
        setServerError(message);
      }
    }
  }

  if (isLoading) {
    return <LoadingState message={ui.loading} />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <>
      <PageHeader title={pages.addTask.title} description={pages.addTask.description} />
      <div className="page-actions">
        <SecondaryButton type="button" onClick={() => navigate("/tasks")}>
          {tasksText.actions.backToTasks}
        </SecondaryButton>
      </div>
      <TaskForm
        clients={clients}
        initialValues={initialValues}
        submitLabel={tasksText.actions.saveTask}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/tasks")}
        serverError={serverError}
      />
    </>
  );
}
