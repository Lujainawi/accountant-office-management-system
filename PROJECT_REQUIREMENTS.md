\
# Accountant Office Management System — Project Requirements

## 1. Purpose and Product Definition

This document is the main functional source of truth for the project.

The project is a realistic **internal office-management system for an accountant**. It is not a public marketing website and it is not a client portal.

The MVP is designed for the accountant and authorized office staff. Clients do not log in, upload files, view reports, send messages, or pay through the system during the MVP.

The project must demonstrate:

- Full-stack development skills.
- Clean and understandable architecture.
- SQLite database design through SQLAlchemy.
- Authentication and protected internal routes.
- Client, document, task, and payment workflows.
- File-upload safety rules.
- Dashboard and reporting logic using real local data.
- Controlled AI-assisted development with Cursor.
- A clear distinction between working features and future/mock integrations.

## 2. Product Goal

The system should help the accountant organize daily office work in one place:

- Manage client profiles.
- Organize document metadata and associated demo files.
- Track whether documents are new, in progress, completed, or missing information.
- Track internal tasks and deadlines.
- Calculate VAT and totals accurately.
- Track manual payment status.
- View dashboard metrics and monthly internal summaries.
- Keep future integration ideas visible without pretending they work.

## 3. Target Users and Access

### MVP users

- `admin` — accountant/owner; manages all office data and settings.
- `staff` — authorized office worker; uses office features according to the MVP rules.

### Out of scope in the MVP

- Client accounts.
- Client signup or login.
- Client dashboard.
- Client self-service document upload.
- Client messaging portal.
- Client payment portal.
- Public access to any internal data.

## 4. Product Rules and Non-Negotiable Scope

1. Build a useful, clean MVP first; do not build everything at once.
2. Work phase by phase and do not move to the next phase until the current one runs and is tested.
3. Use React + Vite, FastAPI, SQLAlchemy, and SQLite for the MVP unless explicitly approved otherwise.
4. Use simple CSS and reusable components; do not add a heavy UI library by default.
5. Do not add Docker, Kubernetes, Redis, Celery, microservices, advanced deployment, or complex permissions in the MVP.
6. Do not use real API keys or external services in the MVP.
7. Do not store real client documents, real financial data, passwords in plain text, or card data in the repository.
8. Clearly label every future module as `Planned`, `Mock Mode`, or `Coming Soon`.
9. The UI must be Hebrew-first and RTL-ready; code should avoid permanently hardcoding layout assumptions that prevent later translations.
10. This internal summary system must not be presented as a legal tax report or official government submission tool.

## 5. Technology Requirements

### Frontend

- React with Vite.
- React Router for navigation.
- Simple CSS/CSS variables for the MVP.
- Fetch or Axios for API calls.
- Responsive, RTL-ready layout.
- Frontend validation that complements, but never replaces, backend validation.

### Backend

- Python and FastAPI.
- SQLAlchemy ORM.
- Pydantic schemas for input/output validation.
- Clear route, schema, CRUD, model, service, and utility separation.
- API routes under `/api`.

### Database

- SQLite for the local MVP.
- Default file: `accountant_app.db`.
- Read `DATABASE_URL` from environment variables.
- Default when it is not set: `sqlite:///./accountant_app.db`.
- Keep the database layer portable enough for a future PostgreSQL migration.
- Add a TODO for Alembic migrations and PostgreSQL when production work begins.

### Money and VAT Rules

- Use `Decimal` in Python and `Numeric` in SQLAlchemy for all financial amounts.
- Do **not** use `float` for money calculations.
- Default VAT rate is `18.00` percent, stored as a configurable office setting.
- Every document stores its own `vat_rate`, `vat_amount`, and `total_amount` at creation/update time.
- Changing the default VAT rate affects **new documents only**; historic documents keep the VAT rate stored on them.
- Monetary values display in ILS by default, using two decimal places.
- The system must validate that amounts are non-negative unless a later approved feature explicitly supports refunds/credits.

### Environment Variables

Required local configuration:

```env
DATABASE_URL=sqlite:///./accountant_app.db
SECRET_KEY=change_me_in_real_environment
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_ORIGIN=http://localhost:5173
MAX_UPLOAD_SIZE_MB=10
```

Future integration keys may appear in `.env.example` as placeholders only. The real `.env` file must never be committed.

## 6. MVP Features

### 6.1 Authentication

The system must support login for accountant/office staff.

Required behavior:

- Login with email and password.
- Logout.
- `GET /api/auth/me` for the current authenticated user.
- Protected internal API routes and protected frontend pages.
- Password hashing; never store plain text passwords.
- A local development seed/admin user or seed script is acceptable.
- In deployment, use secure `HttpOnly`, `Secure`, and `SameSite=Lax` cookies for token-based authentication; configure local development appropriately.
- Authentication errors must be clear but must not reveal whether a particular email exists.

MVP note: one admin user is enough initially. A simple `admin` / `staff` role field is sufficient.

### 6.2 Dashboard

The dashboard is the first page after login and uses real database data.

Required dashboard data:

- Total clients.
- Active clients.
- Total documents.
- New documents.
- Documents in progress.
- Completed documents.
- Documents missing information.
- Open tasks.
- Urgent tasks.
- Current-month total before VAT.
- Current-month VAT total.
- Current-month total including VAT.
- Helpful empty state when the database has no demo data.

### 6.3 Client Management

Required client fields:

- `id`
- `client_name`
- `business_name`
- `phone`
- `email`
- `business_id`
- `client_type`
- `address`
- `status`
- `notes`
- `created_at`
- `updated_at`

Allowed client types:

- `private_client`
- `exempt_dealer`
- `authorized_dealer`
- `company`
- `other`

Allowed client statuses:

- `active`
- `inactive`

Required functionality:

- Create a client.
- List clients.
- View one client.
- Edit a client.
- Delete a client only after a confirmation step; the MVP may use archive behavior if implemented consistently.
- Search by client name, business name, phone, email, or business ID.
- Filter by status and client type.
- Show useful empty states and not-found messages.

### 6.4 Client Details Page

Every client must have a dedicated details page containing:

- Client information and editable internal notes.
- Related documents.
- Related tasks.
- Related manual payment records.
- Financial summary.
- Document-status overview.

Client summary must include:

- Document count.
- New/in-progress/completed/missing-information document counts.
- Total before VAT.
- VAT total.
- Total including VAT.
- Open-task count.
- Payment-status overview.

### 6.5 Document Management

Required document data:

- `id`
- `client_id`
- `document_name`
- `document_type`
- `original_filename`
- `stored_filename`
- `file_path`
- `mime_type`
- `file_size_bytes`
- `document_date`
- `amount_before_vat`
- `vat_rate`
- `vat_amount`
- `total_amount`
- `status`
- `notes`
- `created_at`
- `updated_at`

Allowed document types:

- `invoice`
- `receipt`
- `report`
- `bank_document`
- `other`

Allowed document statuses:

- `new`
- `in_progress`
- `completed`
- `missing_information`

Required functionality:

- Upload a document with approved demo content only.
- Save file metadata and private storage path in SQLite.
- View document details.
- Download through an authenticated API route.
- Edit document metadata.
- Delete/archive with a confirmation step.
- Search by name and notes.
- Filter by client, document date month/year, document status, and type.
- Calculate VAT automatically from the entered amount and the selected VAT rate.

Required file safety rules:

- Allow only PDF, PNG, JPG, JPEG, DOCX, and XLSX.
- Validate extension, MIME type, size, and authorization.
- Maximum size is controlled by `MAX_UPLOAD_SIZE_MB`.
- Generate a server-side safe filename; do not trust or use the original filename as storage name.
- Store files outside a public static folder.
- Block executable, script, archive, and unsupported file types.
- Do not expose file-system paths in API responses or error messages.

### 6.6 VAT Calculator

The system must include:

- A standalone VAT Calculator page.
- Automatic calculation in document forms.

Required calculations:

- Amount before VAT → VAT amount and total including VAT.
- Total including VAT → amount before VAT and VAT amount.
- A configurable default VAT rate from settings.
- Clear rounding to two decimal places for display and stored monetary values.

Example:

```text
Amount before VAT: 1000.00
VAT rate: 18.00%
VAT amount: 180.00
Total including VAT: 1180.00
```

### 6.7 Task Tracking

Required task fields:

- `id`
- `client_id`
- `document_id` (optional)
- `title`
- `description`
- `due_date`
- `priority`
- `status`
- `created_at`
- `updated_at`

Allowed task statuses:

- `open`
- `in_progress`
- `done`

Allowed priorities:

- `low`
- `medium`
- `high`
- `urgent`

Required functionality:

- Create, view, edit, delete, and mark task as done.
- Filter by client, priority, and status.
- Show tasks on the related client page.
- Validate that referenced client and optional document exist.

### 6.8 Manual Payment Tracking

This module records internal payment status only. It must never process a real payment or store card details.

Required payment fields:

- `id`
- `client_id`
- `document_id` (optional)
- `amount`
- `status`
- `payment_date`
- `notes`
- `created_at`
- `updated_at`

Allowed payment statuses:

- `unpaid`
- `paid`
- `partially_paid`
- `pending`
- `failed`

Required functionality:

- Add payment record.
- Edit payment record and status.
- List payment records in client details.
- Show a payment summary where useful.

### 6.9 Monthly Internal Reports

The report is an internal office summary, not a legal tax report.

Required behavior:

- Select a month and year.
- Show number of clients handled.
- Show uploaded-document count.
- Show total before VAT, VAT total, and total including VAT.
- Show breakdown by client.
- Show breakdown by document status.
- Use `document_date` to derive the selected month and year; do not store duplicate month/year fields that can become inconsistent.
- Display a visible label: `Internal office summary — not a legal tax report`.

### 6.10 Office Settings

The system requires one office settings record.

Required settings:

- Accountant name.
- Office name.
- Default VAT rate.
- Default currency.
- Allowed file types.
- Optional display of future integration statuses.

Default values:

- VAT rate: `18.00`.
- Currency: `ILS`.
- Allowed files: PDF, PNG, JPG, JPEG, DOCX, XLSX.

### 6.11 Future / Mock Modules

These modules are pages or mock flows only. They must be visually useful but explicitly non-functional for external services.

| Module | MVP behavior | Required label |
|---|---|---|
| Email | Prepare a preview and ready-to-copy message; do not send. | Mock Mode / Not Configured |
| OCR Invoice Reader | Upload UI and safe mock extraction example; do not process real invoices. | Coming Soon / Mock Mode |
| Tax Authority | Show planned workflow and mock status only. | Planned |
| Digital Signature | Show mock signature statuses only. | Planned |
| Online Payments | Show manual status concept only; no checkout or card data. | Mock Mode / Planned |
| AI Assistant | Show mock suggestions; never send documents to a model. | Planned / Mock Mode |

For every external integration, use this exact rule:

> Build the integration layer with placeholder configuration, environment variables, mock service, error handling, and clear TODOs. Do not use real API keys.

## 7. Database Entities

The MVP includes:

- `User`
- `OfficeSettings`
- `Client`
- `Document`
- `Task`
- `Payment`
- `IntegrationStatus`

The exact field definitions, relationships, validations, and indexes are in `DATABASE_SCHEMA.md`.

## 8. Required API Routes

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Clients

- `POST /api/clients`
- `GET /api/clients`
- `GET /api/clients/{client_id}`
- `PUT /api/clients/{client_id}`
- `DELETE /api/clients/{client_id}`

### Documents

- `POST /api/documents`
- `GET /api/documents`
- `GET /api/documents/{document_id}`
- `PUT /api/documents/{document_id}`
- `DELETE /api/documents/{document_id}`
- `GET /api/documents/{document_id}/download`

### Tasks

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/{task_id}`
- `PUT /api/tasks/{task_id}`
- `DELETE /api/tasks/{task_id}`

### Payments

- `POST /api/payments`
- `GET /api/payments`
- `GET /api/payments/{payment_id}`
- `PUT /api/payments/{payment_id}`
- `DELETE /api/payments/{payment_id}`

### Dashboard, Reports, and Settings

- `GET /api/dashboard/summary`
- `GET /api/reports/monthly?month={month}&year={year}`
- `GET /api/settings`
- `PUT /api/settings`

### Future mock routes only

- `POST /api/integrations/email/preview`
- `POST /api/integrations/ocr/mock-process`
- `GET /api/integrations/tax-authority/status`
- `GET /api/integrations/digital-signature/status`
- `GET /api/integrations/payments/status`
- `GET /api/integrations/ai-assistant/mock-suggestions`

## 9. Required Frontend Pages

### Working MVP pages

- Login
- Dashboard
- Clients
- Add Client
- Edit Client
- Client Details
- Documents
- Upload Document
- Edit Document
- VAT Calculator
- Tasks
- Monthly Reports
- Settings

### Future/mock pages

- Future Modules
- Email Module — Mock Mode
- OCR Invoice Reader — Coming Soon
- Tax Authority Integration — Planned
- Digital Signature — Planned
- Online Payments — Mock Mode
- AI Assistant — Planned

## 10. What Cursor Must Not Do

Cursor must not:

- Build the entire system in one request.
- Create a client portal in the MVP.
- Add public access to internal data.
- Use real API keys or real external connections.
- Send real emails, process payments, submit government data, or create legal signatures.
- Send real documents to AI.
- Store card data or plain-text passwords.
- Hardcode secrets or expose local file-system paths.
- Add dependencies or change scope without explaining why and receiving approval.
- Present mocks as fully working integrations.

## 11. Definition of Done

A feature is done only when:

- Its scope matches this document.
- The data model, schema, CRUD/service logic, and API route exist when required.
- The user can complete the feature from the UI when relevant.
- Validation and understandable error handling exist.
- Data persists in SQLite when relevant.
- Refreshing the page does not erase saved data.
- Protected data is not accessible to an unauthenticated user.
- Tests or documented manual checks cover the feature.
- The feature is reviewed, run locally, and committed in a separate meaningful Git commit.
- Future/mock features are explicitly labeled.

## 12. Cursor Workflow Rule

Before writing code, Cursor must read `README.md`, this file, `DATABASE_SCHEMA.md`, `SECURITY_PRIVACY.md`, `UI_UX_GUIDELINES.md`, and `DEVELOPMENT_PLAN.md`.

It must first summarize the project, identify the first approved phase, propose folder/file changes, state any proposed dependencies, and wait for approval. It must not begin implementing the full system immediately.
