\
# Accountant Office Management System — Development Plan

## 1. Purpose

This document defines the controlled implementation order for the Accountant Office Management System.

The project must be built in small, working phases. Cursor must not build the complete system in one request. After every phase, run the application, test the delivered feature, review unfamiliar code, fix issues, commit, and only then continue.

## 2. Development Principles

- Build **vertical slices**: a useful feature should include the database/model, validation, API, and UI when relevant.
- Keep every phase small enough to understand and test.
- Follow `PROJECT_REQUIREMENTS.md` as the functional source of truth.
- Follow `DATABASE_SCHEMA.md`, `SECURITY_PRIVACY.md`, and `UI_UX_GUIDELINES.md` for the corresponding rules.
- Do not add a dependency, library, table, route, or feature that is not needed for the approved phase without explaining it first.
- Use fictitious demo data only.
- Make one clear Git commit per meaningful, working phase.

## 3. Before Cursor Writes Any Code

Use `CURSOR_START_PROMPT.md` first.

Cursor must:

1. Read all project documents.
2. Summarize the product and MVP boundaries.
3. Identify working MVP features versus future/mock modules.
4. Propose the folder structure and SQLAlchemy schema.
5. List any required dependencies and why each one is needed.
6. Identify the exact first phase to implement.
7. Wait for approval.

It must not write code, install packages, or create files before that approval.

## 4. Recommended Technical Direction

### Frontend

- React + Vite.
- React Router.
- Simple CSS/CSS variables.
- RTL Hebrew-first layout.
- Fetch or Axios.

### Backend

- Python + FastAPI.
- SQLAlchemy.
- Pydantic.
- Uvicorn.
- Password hashing library and JWT/session support only as needed for authentication.

### Database and Storage

- SQLite file: `accountant_app.db` for local MVP.
- `DATABASE_URL` environment variable with SQLite default.
- Private local `backend/uploads/` folder for fictitious demo files only.

## 5. Phase 0 — Documentation Baseline

### Goal

Place the approved documentation files in the project root before coding.

### Tasks

- Add `README.md`.
- Add `PROJECT_REQUIREMENTS.md`.
- Add `DEVELOPMENT_PLAN.md`.
- Add `DATABASE_SCHEMA.md`.
- Add `UI_UX_GUIDELINES.md`.
- Add `SECURITY_PRIVACY.md`.
- Add `CURSOR_START_PROMPT.md`.
- Add `AI_WORKFLOW.md`.
- Add `MANUAL_TEST_CHECKLIST.md`.
- Add `DEMO_DATA.md`.

### Definition of Done

- Documentation files exist with consistent project scope.
- README refers to the right file names.
- The project is clearly described as an internal MVP, not a public client portal.

### Suggested commit

```text
Add project documentation and MVP scope
```

## 6. Phase 1 — Repository and Project Initialization

### Goal

Create a clean full-stack repository skeleton and safe local configuration.

### Tasks

- Create `backend/` and `frontend/` folders.
- Add `.gitignore`.
- Add `.env.example` with placeholders only.
- Create `backend/uploads/.gitkeep`.
- Add basic setup instructions to README if needed.
- Do not implement product features yet.

### Required `.gitignore` coverage

```text
.env
.env.*
!.env.example
__pycache__/
*.py[cod]
.pytest_cache/
.venv/
*.db
backend/uploads/*
!backend/uploads/.gitkeep
node_modules/
dist/
build/
```

### Definition of Done

- Structure is clean.
- Secrets, database files, uploads, and generated files are protected from Git.
- No real data exists in the repository.

### Suggested commit

```text
Initialize full-stack project structure
```

## 7. Phase 2 — FastAPI Backend Foundation

### Goal

Create a minimal backend that runs locally.

### Tasks

- Create FastAPI application.
- Add configuration module.
- Add `GET /api/health`.
- Configure CORS for the configured frontend origin only.
- Add requirements file.
- Add backend run instructions.
- Add basic consistent API error format if useful.

### Definition of Done

- `uvicorn app.main:app --reload` starts without errors.
- `GET /api/health` returns `{ "status": "ok" }`.
- CORS is not a wildcard configuration for a credentialed production-style session.

### Suggested commit

```text
Set up FastAPI backend foundation
```

## 8. Phase 3 — React Frontend Foundation and RTL Layout

### Goal

Create a polished but empty frontend shell.

### Tasks

- Create React + Vite application.
- Add routing.
- Apply RTL root settings and basic CSS variables.
- Create `AppLayout`, sidebar, topbar, page header, status badge, empty/error/loading components.
- Create placeholder pages for working MVP sections only.
- Do not create mock integration pages yet.

### Definition of Done

- Frontend runs locally.
- Navigation works.
- Layout is readable in RTL on desktop and mobile widths.
- No hard-coded fake dashboard metrics are presented as real data.

### Suggested commit

```text
Build RTL frontend shell and navigation
```

## 9. Phase 4 — Database Foundation and Settings

### Goal

Configure SQLite and create the first stable shared data layer.

### Tasks

- Create SQLAlchemy engine, `SessionLocal`, `Base`, and `get_db`.
- Read `DATABASE_URL` from configuration.
- Create database tables automatically for the local MVP.
- Add TODO comments for Alembic/PostgreSQL future work.
- Create `OfficeSettings` model, schemas, CRUD, routes, and basic settings API.
- Seed safe default settings: VAT `18.00`, currency `ILS`, approved extensions.

### Definition of Done

- Database is created locally.
- Settings can be read from the API.
- Financial values use `Numeric`/`Decimal`, not float.

### Suggested commit

```text
Configure SQLite and office settings
```

## 10. Phase 5 — Authentication Vertical Slice

### Goal

Secure internal access before adding office data.

### Tasks

- Create `User` model and schemas.
- Add secure password hashing.
- Add development seed/admin user or seed script using environment-safe demo credentials.
- Implement login, logout, and current-user routes.
- Implement backend protection dependency.
- Implement login UI, logout UI, route protection, loading/error state.

### Definition of Done

- Authorized demo user can log in and out.
- Unauthenticated users cannot access protected UI/API routes.
- Passwords are hashed.
- Tokens are handled safely according to `SECURITY_PRIVACY.md`.

### Suggested commit

```text
Implement accountant authentication flow
```

## 11. Phase 6 — Client Management Vertical Slice

### Goal

Deliver the first core working feature from database to UI.

### Tasks

- Create Client model, schemas, CRUD, routes, and validation.
- Implement list, add, edit, view, search, filters, and controlled delete/archive behavior.
- Build Client list, Add Client, Edit Client, and basic Client Details UI.
- Include empty, loading, error, and confirmation states.

### Definition of Done

- Client data persists in SQLite.
- Search and filters work.
- UI remains usable after refresh.
- Unauthenticated access is blocked.

### Suggested commit

```text
Implement client management end to end
```

## 12. Phase 7 — Client Details Summary

### Goal

Turn client details into the office's central workspace.

### Tasks

- Complete client header and internal notes area.
- Add safe empty sections for documents, tasks, and payments before those modules are implemented.
- Add client financial-summary API that returns zero/empty values safely before documents exist.
- Add client summary cards and navigation actions.

### Definition of Done

- Client Details page is useful even before all related modules exist.
- Summary does not use fake data.

### Suggested commit

```text
Build client details workspace
```

## 13. Phase 8 — Document Management Vertical Slice

### Goal

Implement secure document metadata and demo-file handling.

### Tasks

- Create Document model, schemas, CRUD, routes, and filters.
- Implement upload validation: authorization, extension, MIME type, max size, generated storage name.
- Implement private local file storage and authenticated download.
- Implement document list, upload form, edit form, details, search, filters, and confirmation on delete/archive.
- Connect documents and summaries to Client Details.
- Recalculate money/VAT values on the backend.

### Definition of Done

- Approved demo files upload and download correctly.
- Unsupported and oversized files are rejected.
- Files cannot be downloaded without authentication.
- Document metadata and financial values persist correctly.

### Suggested commit

```text
Implement secure document management
```

## 14. Phase 9 — Task Tracking Vertical Slice

### Goal

Add internal work tracking tied to clients and optional documents.

### Tasks

- Create Task model, schemas, CRUD, routes, and validation.
- Create Tasks UI with create/edit/delete/mark-done actions.
- Add filters by client, status, and priority.
- Add task list to Client Details.
- Highlight urgent and overdue tasks without relying only on color.

### Definition of Done

- Tasks persist and appear on associated client pages.
- Invalid client/document references are rejected.
- Mark-as-done works from UI.

### Suggested commit

```text
Implement internal task tracking
```

## 15. Phase 10 — Dashboard with Real Data

### Goal

Connect the dashboard to real database summaries.

### Tasks

- Implement `GET /api/dashboard/summary`.
- Calculate client counts, document status counts, task counts, and current-month financial totals.
- Connect dashboard metric cards and “needs attention” section.
- Add empty states for a new database.

### Definition of Done

- Dashboard changes when data changes.
- No hard-coded metrics remain after this phase.

### Suggested commit

```text
Connect dashboard to live database summaries
```

## 16. Phase 11 — VAT Calculator and Settings UI

### Goal

Make VAT behavior visible, configurable, and consistent.

### Tasks

- Build standalone VAT Calculator.
- Connect document form calculations.
- Create Settings page and connect to settings API.
- Explain in UI that VAT-setting changes affect new documents only.

### Definition of Done

- Both calculator modes work correctly.
- Document calculations agree with backend calculations.
- Settings persist and affect new document defaults.

### Suggested commit

```text
Add VAT calculator and office settings UI
```

## 17. Phase 12 — Manual Payments Vertical Slice

### Goal

Track payment status internally without online payments.

### Tasks

- Create Payment model, schemas, CRUD, routes, and validation.
- Add payment section to Client Details.
- Add controlled create/edit/delete forms.
- Make it explicit that this is manual tracking only.

### Definition of Done

- Payment records persist.
- No card fields, checkout, provider calls, or payment secrets exist.

### Suggested commit

```text
Add manual payment tracking
```

## 18. Phase 13 — Monthly Internal Reports

### Goal

Create useful monthly office summaries.

### Tasks

- Implement monthly report aggregation route.
- Filter by selected month/year derived from `document_date`.
- Show summary totals, client breakdown, and status breakdown.
- Build report UI with required disclaimer.

### Definition of Done

- Report values are calculated from database data.
- Selected month/year changes results.
- Report clearly says it is not a legal tax report.

### Suggested commit

```text
Add monthly internal reports
```

## 19. Phase 14 — Future/Mock Module Pages

### Goal

Show the product roadmap honestly without adding real integrations.

### Tasks

- Create Future Modules page.
- Create Email Preview mock page.
- Create OCR mock page.
- Create Tax Authority, Digital Signature, Online Payments, and AI Assistant planned/mock pages.
- Add `IntegrationStatus` seed data and mock-only routes/services.
- Make every mock visibly labeled.

### Definition of Done

- No external API call is made.
- No real API key is used.
- Every mock output identifies itself as mock/sample data.

### Suggested commit

```text
Add clearly labeled future integration mocks
```

## 20. Phase 15 — Validation, Error Handling, and Security Review

### Goal

Make common mistakes safe and understandable.

### Tasks

- Review schemas, form validation, API error messages, and file validation.
- Confirm protected routes/downloads.
- Confirm no path/secret/password data appears in errors.
- Add confirmation dialogs for destructive actions.
- Test invalid IDs, malformed input, invalid amount/date, fake file extension, oversized upload, and missing files.

### Definition of Done

- Common invalid input does not crash the app.
- Security rules in `SECURITY_PRIVACY.md` are followed.
- UI errors are helpful and not overly technical.

### Suggested commit

```text
Improve validation error handling and security checks
```

## 21. Phase 16 — Automated Tests and Manual Regression Checklist

### Goal

Add repeatable confidence checks.

### Minimum backend tests

- Health route.
- Login/authentication protection.
- Client CRUD and search/filter.
- Document metadata and VAT calculation.
- Unsupported upload rejection.
- Task CRUD.
- Dashboard summary.
- Monthly report calculation.

### Manual checks

- Complete `MANUAL_TEST_CHECKLIST.md`.
- Record any known limitations.

### Definition of Done

- Test suite runs locally.
- Core tests pass.
- Manual checklist is updated and completed for the tested version.

### Suggested commit

```text
Add core tests and regression checklist
```

## 22. Phase 17 — Documentation, Demo Data, and Final Review

### Goal

Prepare the project for GitHub, portfolio review, and future maintenance.

### Tasks

- Update README setup/run instructions.
- Verify all documentation matches the implemented result.
- Add safe screenshots using only fictitious data.
- Verify `.gitignore`, `.env.example`, and upload folder hygiene.
- Run backend tests and manual checklist.
- Review Git history and commit messages.
- Record remaining planned work without claiming it is complete.

### Final checklist

- App starts locally.
- Backend and frontend run.
- SQLite database is created locally.
- Authentication works.
- Client, document, task, payment, dashboard, VAT, settings, and reports work as implemented.
- Mock pages are clearly marked.
- No `.env`, database file, upload, real secret, or real client data is committed.
- README is accurate.

### Suggested commit

```text
Finalize documentation tests and portfolio cleanup
```

## 23. Recommended Cursor Prompts by Phase

### First prompt

Use `CURSOR_START_PROMPT.md` exactly.

### Generic phase prompt

```text
Start Phase <NUMBER> only from DEVELOPMENT_PLAN.md.

Before changing files:
1. Restate the goal and definition of done.
2. List the files you expect to create or change.
3. List any dependency you need and why.
4. Identify risks or assumptions.

Wait for my approval before writing code.
```

### After approval

```text
Implement only the approved phase.

Do not add features from later phases.
Keep the implementation readable.
After implementation, provide:
1. Files changed
2. What was implemented
3. How to run/test it
4. Manual test steps
5. Any known limitation
6. Suggested Git commit message
```

## 24. Final Reminder

Cursor is an assistant, not a replacement for understanding the project.

Review every phase, run it, test it, ask about unfamiliar code, and commit only when it works.
