import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import SettingsForm from "../components/settings/SettingsForm";
import { getSettings, updateSettings } from "../api/settings";
import { ApiError } from "../api/client";
import { pages, settings as settingsText, ui } from "../content/he";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    setServerError("");
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : settingsText.errors.loadFailed;
      setLoadError(message || settingsText.errors.loadFailed);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  async function handleSubmit(payload) {
    setServerError("");
    try {
      return await updateSettings(payload);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : settingsText.errors.saveFailed;
      setServerError(message || settingsText.errors.saveFailed);
      throw error;
    }
  }

  if (isLoading) {
    return <LoadingState message={ui.loading} />;
  }

  if (loadError) {
    return (
      <>
        <PageHeader title={pages.settings.title} description={pages.settings.description} />
        <ErrorMessage message={loadError} />
        <div className="page-actions">
          <PrimaryButton type="button" onClick={loadSettings}>
            {settingsText.actions.retryLoad}
          </PrimaryButton>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={pages.settings.title} description={pages.settings.description} />
      <SettingsForm
        initialSettings={settings}
        onSubmit={handleSubmit}
        serverError={serverError}
      />
    </>
  );
}
