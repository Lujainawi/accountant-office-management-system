import { Routes, Route } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import AddClientPage from "./pages/AddClientPage";
import EditClientPage from "./pages/EditClientPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import DocumentsPage from "./pages/DocumentsPage";
import UploadDocumentPage from "./pages/UploadDocumentPage";
import EditDocumentPage from "./pages/EditDocumentPage";
import TasksPage from "./pages/TasksPage";
import VatCalculatorPage from "./pages/VatCalculatorPage";
import MonthlyReportsPage from "./pages/MonthlyReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<AddClientPage />} />
        <Route path="clients/:id" element={<ClientDetailsPage />} />
        <Route path="clients/:id/edit" element={<EditClientPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/new" element={<UploadDocumentPage />} />
        <Route path="documents/:id/edit" element={<EditDocumentPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="vat-calculator" element={<VatCalculatorPage />} />
        <Route path="reports" element={<MonthlyReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
