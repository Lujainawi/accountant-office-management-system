\
# Manual Test Checklist

Use this checklist after every development phase. Do not continue to the next phase until the current phase works, errors are understood, and relevant checks are complete.

## 1. Repository and Configuration

- [ ] Project folder structure exists.
- [ ] `README.md` exists.
- [ ] `PROJECT_REQUIREMENTS.md` exists.
- [ ] `DATABASE_SCHEMA.md` exists.
- [ ] `UI_UX_GUIDELINES.md` exists.
- [ ] `SECURITY_PRIVACY.md` exists.
- [ ] `DEVELOPMENT_PLAN.md` exists.
- [ ] `CURSOR_START_PROMPT.md` exists.
- [ ] `AI_WORKFLOW.md` exists.
- [ ] `MANUAL_TEST_CHECKLIST.md` exists.
- [ ] `DEMO_DATA.md` exists.
- [ ] `.gitignore` exists.
- [ ] `.env.example` exists.
- [ ] Real `.env` is not committed.
- [ ] Database files are not committed.
- [ ] Upload folder contains no real client files.

## 2. Backend Foundation

- [ ] Backend starts successfully.
- [ ] `GET /api/health` returns status `ok`.
- [ ] CORS is configured for the expected frontend origin.
- [ ] Backend errors are readable and do not expose stack traces or secrets.
- [ ] API docs, if enabled for development, do not expose secrets or real demo credentials.

## 3. Frontend and RTL UX

- [ ] Frontend starts successfully.
- [ ] Main layout uses RTL correctly.
- [ ] Sidebar/navigation works.
- [ ] Pages have clear titles.
- [ ] Layout remains usable on a narrow screen.
- [ ] Keyboard focus is visible.
- [ ] Statuses are not communicated by color alone.
- [ ] Loading, empty, and error states are shown where relevant.

## 4. Database and Settings

- [ ] SQLite database file is created locally.
- [ ] `DATABASE_URL` is read from environment variables.
- [ ] Missing `DATABASE_URL` falls back to `sqlite:///./accountant_app.db`.
- [ ] Tables are created correctly.
- [ ] `OfficeSettings` exists and has one usable record.
- [ ] Default VAT rate is `18.00`.
- [ ] Default currency is `ILS`.
- [ ] Monetary values use Decimal/Numeric rather than float.
- [ ] Changing default VAT rate does not change historic document VAT rates.

## 5. Authentication

- [ ] Development admin/accountant user exists safely.
- [ ] Login works with correct email/password.
- [ ] Invalid login shows a safe, clear error.
- [ ] Logout works.
- [ ] Protected pages require login.
- [ ] Protected API routes return unauthorized for an unauthenticated request.
- [ ] Passwords are hashed.
- [ ] Plain text passwords are not stored or returned by the API.
- [ ] Authentication token/session is not stored in localStorage.
- [ ] Browser refresh behavior matches the chosen secure session approach.

## 6. Clients

- [ ] Add client works.
- [ ] Client list loads.
- [ ] View one client works.
- [ ] Edit client works.
- [ ] Delete/archive flow requires confirmation.
- [ ] Search by name works.
- [ ] Search by business name, phone, email, and business ID works.
- [ ] Filter by status works.
- [ ] Filter by client type works.
- [ ] Empty client list shows a helpful action.
- [ ] Refreshing page does not delete saved client data.
- [ ] Invalid client input produces helpful validation feedback.

## 7. Client Details

- [ ] Client details page opens.
- [ ] Client information is displayed correctly.
- [ ] Internal notes are clearly labeled.
- [ ] Document section appears.
- [ ] Task section appears.
- [ ] Payment section appears.
- [ ] Financial summary is displayed.
- [ ] Empty related-data states are useful before records exist.
- [ ] Summary values update when related data changes.

## 8. Documents and Upload Safety

- [ ] Upload document works with a permitted demo file.
- [ ] Allowed types work: PDF, PNG, JPG, JPEG, DOCX, XLSX.
- [ ] Unsupported extension is blocked.
- [ ] File with a fake/incorrect MIME type is blocked where detection is available.
- [ ] Oversized file is blocked according to configured limit.
- [ ] Executable/script/archive files are blocked.
- [ ] Stored filename is server-generated and not equal to an untrusted original name.
- [ ] File metadata is saved in SQLite.
- [ ] Server file path is not exposed in UI/API response.
- [ ] Download works for authenticated user.
- [ ] Unauthenticated user cannot download a document.
- [ ] Edit metadata works.
- [ ] Delete/archive flow requires confirmation.
- [ ] Filter by client works.
- [ ] Filter by document month/year works.
- [ ] Filter by status works.
- [ ] Search by name/notes works.
- [ ] Missing stored file is handled with a safe user-facing message.

## 9. VAT Calculator and Money Rules

- [ ] Default VAT rate is shown correctly.
- [ ] Amount before VAT calculates VAT amount correctly.
- [ ] Amount before VAT calculates total including VAT correctly.
- [ ] Total including VAT calculates amount before VAT correctly.
- [ ] Values display two decimal places consistently.
- [ ] Document forms calculate VAT automatically.
- [ ] Backend recalculates/validates totals instead of trusting frontend-only totals.
- [ ] Negative amounts are rejected unless explicitly supported.
- [ ] VAT rate can be changed from settings for newly created documents.

## 10. Tasks

- [ ] Create task works.
- [ ] View tasks works.
- [ ] Edit task works.
- [ ] Delete task requires confirmation.
- [ ] Filter by status works.
- [ ] Filter by priority works.
- [ ] Filter by client works.
- [ ] Mark as done works.
- [ ] Tasks appear in client details.
- [ ] Invalid client/document references are rejected.
- [ ] Urgent/overdue state is understandable without relying only on color.

## 11. Manual Payments

- [ ] Create payment record works.
- [ ] Edit payment status works.
- [ ] Payment data is saved in SQLite.
- [ ] Payment status appears in client details.
- [ ] Payment amount validates as a non-negative monetary value.
- [ ] No real payment processing exists.
- [ ] No credit-card or checkout fields are stored.

## 12. Dashboard

- [ ] Dashboard loads after login.
- [ ] Total clients count is real.
- [ ] Active clients count is real.
- [ ] Document counts by status are real.
- [ ] Open and urgent task counts are real.
- [ ] Current-month totals are real.
- [ ] Dashboard updates when data changes.
- [ ] Empty-state dashboard does not pretend empty data is complete data.

## 13. Monthly Reports

- [ ] User can select month and year.
- [ ] Number of clients handled is shown.
- [ ] Number of uploaded documents is shown.
- [ ] Total before VAT is shown.
- [ ] VAT total is shown.
- [ ] Total including VAT is shown.
- [ ] Breakdown by client is shown.
- [ ] Breakdown by document status is shown.
- [ ] Report uses `document_date` consistently.
- [ ] Report has visible text that it is an internal summary, not a legal tax report.

## 14. Settings

- [ ] Settings page loads.
- [ ] Accountant name can be edited.
- [ ] Office name can be edited.
- [ ] Default VAT rate can be edited.
- [ ] Default currency can be edited.
- [ ] Allowed file types are visible.
- [ ] Settings save successfully and show feedback.
- [ ] VAT rate behavior for new versus historic documents is explained.

## 15. Future / Mock Modules

- [ ] Future Modules page exists.
- [ ] Email module is marked Mock Mode / Not Configured.
- [ ] OCR module is marked Coming Soon / Mock Mode.
- [ ] Tax Authority module is marked Planned.
- [ ] Digital Signature module is marked Planned.
- [ ] Online Payments module is marked Mock Mode / Planned.
- [ ] AI Assistant module is marked Planned / Mock Mode.
- [ ] Mock outputs are clearly identified as example/sample data.
- [ ] No real external API is called.
- [ ] No real API key is used.
- [ ] Mock features are not presented as fully working.

## 16. Final Security and Privacy Check

- [ ] `.env` is not committed.
- [ ] Real API keys are not committed.
- [ ] Database files are not committed.
- [ ] Uploads contain no real client documents.
- [ ] Passwords are not stored as plain text.
- [ ] Tokens/secrets are not logged or rendered in UI.
- [ ] No real payments are processed.
- [ ] No real government/tax authority connection exists.
- [ ] No real AI processing of client documents exists.
- [ ] Downloads require authentication.
- [ ] API errors do not expose internal paths, raw exceptions, secrets, or hashes.
- [ ] Screenshots and demo records are fictional.

## 17. Final Portfolio Check

- [ ] README has clear setup and run instructions.
- [ ] README describes the project as an internal MVP.
- [ ] README separates working features from mock/planned features.
- [ ] Documentation matches the implementation.
- [ ] Screenshots use only demo data.
- [ ] Core automated tests pass.
- [ ] Manual checklist is completed for the final version.
- [ ] Git history uses meaningful phase commits.
- [ ] Known limitations are documented honestly.
