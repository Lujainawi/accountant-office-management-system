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
- [x] Login works with correct email/password. *(Phase 16 smoke — 2026-06-23)*
- [ ] Invalid login shows a safe, clear error.
- [x] Logout works. *(Phase 16 smoke — 2026-06-23)*
- [x] Protected pages require login. *(Phase 16 smoke — logout and protected-page redirect)*
- [ ] Protected API routes return unauthorized for an unauthenticated request.
- [ ] Passwords are hashed.
- [ ] Plain text passwords are not stored or returned by the API.
- [ ] Authentication token/session is not stored in localStorage.
- [ ] Browser refresh behavior matches the chosen secure session approach.

## 6. Clients

- [x] Add client works. *(Phase 16 smoke — 2026-06-23)*
- [x] Client list loads. *(Phase 16 smoke — 2026-06-23)*
- [ ] View one client works.
- [x] Edit client works. *(Phase 16 smoke — update test client)*
- [x] Delete/archive flow requires confirmation. *(Phase 16 smoke — destructive-action confirmations)*
- [x] Search by name works. *(Phase 16 smoke — search test client)*
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

- [x] Upload document works with a permitted demo file. *(Phase 16 smoke — 2026-06-23)*
- [ ] Allowed types work: PDF, PNG, JPG, JPEG, DOCX, XLSX.
- [ ] Unsupported extension is blocked.
- [ ] File with a fake/incorrect MIME type is blocked where detection is available.
- [ ] Oversized file is blocked according to configured limit.
- [ ] Executable/script/archive files are blocked.
- [ ] Stored filename is server-generated and not equal to an untrusted original name.
- [ ] File metadata is saved in SQLite.
- [ ] Server file path is not exposed in UI/API response. *(Phase 16 automated regression only — not manually verified in browser smoke; see §18)*
- [x] Download works for authenticated user. *(Phase 16 smoke — 2026-06-23)*
- [ ] Unauthenticated user cannot download a document.
- [ ] Edit metadata works.
- [x] Delete/archive flow requires confirmation. *(Phase 16 smoke — destructive-action confirmations)*
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

- [x] Dashboard loads after login. *(Phase 16 smoke — 2026-06-23)*
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

- [x] Future Modules page exists. *(Phase 16 smoke — mock label check)*
- [ ] Email module is marked Mock Mode / Not Configured.
- [ ] OCR module is marked Coming Soon / Mock Mode.
- [ ] Tax Authority module is marked Planned.
- [ ] Digital Signature module is marked Planned.
- [ ] Online Payments module is marked Mock Mode / Planned.
- [ ] AI Assistant module is marked Planned / Mock Mode.
- [ ] Mock outputs are clearly identified as example/sample data.
- [ ] No real external API is called.
- [ ] No real API key is used.
- [x] Mock features are not presented as fully working. *(Phase 16 smoke — future module mock label)*

## 16. Final Security and Privacy Check

- [ ] `.env` is not committed.
- [ ] Real API keys are not committed.
- [ ] Database files are not committed.
- [ ] Uploads contain no real client documents.
- [ ] Passwords are not stored as plain text.
- [ ] Tokens/secrets are not logged or rendered in UI. *(Phase 16 automated regression only — not manually verified in browser smoke; see §18)*
- [ ] No real payments are processed.
- [ ] No real government/tax authority connection exists.
- [ ] No real AI processing of client documents exists.
- [ ] Downloads require authentication.
- [ ] API errors do not expose internal paths, raw exceptions, secrets, or hashes. *(Phase 16 automated regression only — not manually verified in browser smoke; see §18)*
- [ ] Screenshots and demo records are fictional.

## 17. Final Portfolio Check

- [ ] README has clear setup and run instructions.
- [ ] README describes the project as an internal MVP.
- [ ] README separates working features from mock/planned features.
- [ ] Documentation matches the implementation.
- [ ] Screenshots use only demo data.
- [x] Core automated tests pass. *(Phase 16 — focused: 182 passed; full backend suite: 251 passed; frontend build: passed)*
- [ ] Manual checklist is completed for the final version.
- [ ] Git history uses meaningful phase commits.
- [ ] Known limitations are documented honestly.

## 18. Phase 16 — Automated Test Expansion Verification

**Recorded:** 2026-06-23  
**Git baseline:** `7511191 Harden validation and error handling`

### Automated verification (passed)

- Focused Phase 16 tests: **182 passed**
- Full backend suite: **251 passed**
- Frontend build: **passed**

The following broad security assertions were **not** fully exercised in the Phase 16 browser smoke test, but have **automated regression evidence** (for example in `backend/tests/test_error_handling.py`, `backend/tests/test_documents.py`, `backend/tests/test_document_upload_security.py`, and related suites):

- Server file path is not exposed in UI/API response
- Tokens/secrets are not logged or rendered in UI
- API errors do not expose internal paths, raw exceptions, secrets, or hashes

These remain **unchecked** in sections 8 and 16 above until a dedicated manual review confirms them.

### Manual browser smoke test (passed)

Scope was intentionally narrow — regression confidence after test-only Phase 16 changes, not a full MVP checklist walkthrough.

| Check | Result |
|---|---|
| Login and dashboard | Pass |
| Create, search, update, and delete test client | Pass |
| Upload, open, download, and delete test document | Pass |
| Destructive-action confirmations | Pass |
| Logout and protected-page redirect | Pass |
| Future module mock label | Pass |
| No technical errors or obvious data leakage observed in tested flows | Pass *(limited smoke observation — not a full security review)* |

### Not covered in this Phase 16 smoke test

The following were **not** manually re-tested in this smoke session and remain unchecked above unless marked in an earlier phase: unsupported/oversized upload rejection, unauthenticated download, settings edits, VAT calculator UI, tasks, payments, monthly reports, every individual mock module page, invalid-login UI, API-level auth checks, portfolio/documentation final review, the three broad security/path-leakage checklist items in sections 8 and 16 (automated evidence only — see above), and the remainder of sections 1–4, 7, 9–14, and 16–17.
