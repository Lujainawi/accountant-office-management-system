import { Routes, Route } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import AddClientPage from "./pages/AddClientPage";
import EditClientPage from "./pages/EditClientPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import DocumentsPage from "./pages/DocumentsPage";
import UploadDocumentPage from "./pages/UploadDocumentPage";
import DocumentDetailsPage from "./pages/DocumentDetailsPage";
import EditDocumentPage from "./pages/EditDocumentPage";
import EditTaskPage from "./pages/EditTaskPage";
import AddTaskPage from "./pages/AddTaskPage";
import AddPaymentPage from "./pages/AddPaymentPage";
import EditPaymentPage from "./pages/EditPaymentPage";
import TasksPage from "./pages/TasksPage";
import VatCalculatorPage from "./pages/VatCalculatorPage";
import MonthlyReportsPage from "./pages/MonthlyReportsPage";
import SettingsPage from "./pages/SettingsPage";
import FutureModulesPage from "./pages/FutureModulesPage";
import EmailPreviewPage from "./pages/integrations/EmailPreviewPage";
import OcrMockPage from "./pages/integrations/OcrMockPage";
import TaxAuthorityPage from "./pages/integrations/TaxAuthorityPage";
import DigitalSignaturePage from "./pages/integrations/DigitalSignaturePage";
import OnlinePaymentsMockPage from "./pages/integrations/OnlinePaymentsMockPage";
import AiAssistantPage from "./pages/integrations/AiAssistantPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/new" element={<AddClientPage />} />
          <Route path="clients/:id" element={<ClientDetailsPage />} />
          <Route path="clients/:id/edit" element={<EditClientPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/upload" element={<UploadDocumentPage />} />
          <Route path="documents/:id" element={<DocumentDetailsPage />} />
          <Route path="documents/:id/edit" element={<EditDocumentPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/new" element={<AddTaskPage />} />
          <Route path="tasks/:id/edit" element={<EditTaskPage />} />
          <Route path="payments/new" element={<AddPaymentPage />} />
          <Route path="payments/:id/edit" element={<EditPaymentPage />} />
          <Route path="vat-calculator" element={<VatCalculatorPage />} />
          <Route path="reports" element={<MonthlyReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="future-modules" element={<FutureModulesPage />} />
          <Route path="future-modules/email" element={<EmailPreviewPage />} />
          <Route path="future-modules/ocr" element={<OcrMockPage />} />
          <Route path="future-modules/tax-authority" element={<TaxAuthorityPage />} />
          <Route path="future-modules/digital-signature" element={<DigitalSignaturePage />} />
          <Route path="future-modules/online-payments" element={<OnlinePaymentsMockPage />} />
          <Route path="future-modules/ai-assistant" element={<AiAssistantPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
