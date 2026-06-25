# Accountant Office Management System

A full-stack internal office-management application for an accountant practice. It helps authorized office staff organize clients, documents, tasks, manual payment records, VAT calculations, and monthly internal summaries in one place. The project is built as a portfolio-quality local MVP demonstrating full-stack development, database design, authentication, secure document handling, validation, and automated backend testing.

**Important boundaries:** This is a **local-development internal MVP**. It is **not deployed to production**, is **not legal or accounting advice software**, and must not be presented as an official tax report or production-ready system for real sensitive client data. The application UI is **Hebrew-first and right-to-left (RTL)**; labels and content appear in Hebrew while this README is in English for reviewers and recruiters.

## Features

### Implemented capabilities

- Staff authentication (login, logout, session check) with protected API routes and frontend pages
- Dashboard with live SQLite-backed metrics and attention items
- Client management: list, search, filter, create, edit, view, and controlled delete/archive
- Client details workspace with related documents, tasks, payments, notes, and financial summary
- Document management: upload, metadata edit, search, filters, status tracking, and authenticated download
- VAT calculator and automatic VAT calculations in document forms (server-validated)
- Internal task tracking with priorities, due dates, and client/document links
- Manual payment-status tracking (no payment processing)
- Monthly internal office summaries (explicitly not a legal tax report)
- Office settings (VAT rate, currency, allowed file types, office identity)
- Responsive layout with desktop sidebar and mobile drawer navigation

### Mock / planned capabilities

These pages and API routes exist for roadmap visibility only. They do **not** connect to real external services:

- Email preview (mock — no sending)
- OCR invoice reader (coming soon / mock sample output)
- Tax authority integration (planned)
- Digital signature (planned)
- Online payments (mock — manual status concept only)
- AI assistant (planned / mock suggestions)

## Technology stack

| Area | Choice |
|---|---|
| Frontend | React 19, Vite 6, React Router 7 |
| Styling | Modular CSS with CSS variables (no heavy UI library) |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Database | SQLite with SQLAlchemy ORM |
| Authentication | Argon2 password hashing, JWT in HttpOnly cookies |
| File storage | Private local `backend/uploads/` (demo files only) |
| Testing | Pytest (backend); manual frontend verification checklist |

## Architecture

The system is a classic local full-stack web application: a React SPA talks to a FastAPI REST API, which persists data in SQLite and stores uploaded files in a private backend folder. Mock integration modules reuse the same API pattern but return sample or status-only responses without external network calls.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for a concise overview, authentication flow, and data-flow diagram.

## Local setup (Windows / PowerShell)

### Prerequisites

- Python 3.12 (the project was verified with Python 3.12; the Windows setup below uses `py -3.12`)
- Node.js 20 or newer
- npm
- Git

### 1. Environment file

From the repository root, create a local `.env` from the example:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set at minimum:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Required. Replace the placeholder with a long random value. The app rejects the example placeholder at startup. |
| `DEV_ADMIN_PASSWORD` | Required for first login. Replace the placeholder with a local dev password. Used only when the users table is empty. |
| `DEV_ADMIN_EMAIL` | Default `admin@example.test`. Email for the seeded development admin user. |
| `DATABASE_URL` | Default `sqlite:///./accountant_app.db` (SQLite file created under `backend/` when the server starts). |
| `FRONTEND_ORIGIN` | Default `http://127.0.0.1:5173`. Must match the Vite dev server origin for CORS. |
| `COOKIE_SECURE` | Default `false` for local HTTP development. Set `true` only with HTTPS in a deployed environment. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Default `60`. |
| `MAX_UPLOAD_SIZE_MB` | Default `10`. |

Integration keys in `.env.example` (`EMAIL_API_KEY`, `OCR_API_KEY`, etc.) are placeholders only. No real integrations are enabled.

Never commit `.env`, database files, or uploaded files.

### 2. Backend

```powershell
cd backend
py -3.12 -m venv .venv312
.\.venv312\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API reads configuration from the `.env` file at the **repository root**. On first startup, the backend creates SQLite tables and seeds default office settings, integration statuses, and a development admin user (if the users table is empty and `DEV_ADMIN_PASSWORD` is set).

Health check:

```text
GET http://127.0.0.1:8000/api/health
```

### 3. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173` or `http://127.0.0.1:5173`). Ensure `FRONTEND_ORIGIN` in `.env` matches the origin you use.

### 4. First login

After both servers are running, sign in with:

- **Email:** value of `DEV_ADMIN_EMAIL` (default `admin@example.test`)
- **Password:** the `DEV_ADMIN_PASSWORD` you set in `.env`

The admin user is created automatically on first backend startup when no users exist. If login fails, confirm `SECRET_KEY` and `DEV_ADMIN_PASSWORD` are not still placeholder values.

For fictitious demo records suitable for local demos, see [`DEMO_DATA.md`](./DEMO_DATA.md).

## Testing

### Backend (automated)

With the backend virtual environment activated:

```powershell
cd backend
python -m pytest
```

The backend includes automated tests for health, authentication, CRUD workflows, document upload security, VAT logic, dashboard, reports, integrations (mock), and error handling. A final pass/fail result and any updated test summary will be recorded after the final verification regression batch; this README does not state a final test count.

### Frontend (manual)

Core frontend flows are verified manually using [`MANUAL_TEST_CHECKLIST.md`](./MANUAL_TEST_CHECKLIST.md). Full frontend regression coverage is not claimed in this MVP.

Before publishing or sharing the repository, complete [`PORTFOLIO_CHECKLIST.md`](./PORTFOLIO_CHECKLIST.md).

## Security and privacy

- Passwords are stored as Argon2 hashes; plain-text passwords are never returned by the API
- JWT access tokens are stored in **HttpOnly** cookies (`SameSite=Lax`; `Secure` controlled by `COOKIE_SECURE`)
- Internal API routes and frontend pages require authentication
- Uploaded files are stored in a private backend folder, not as public static assets
- File download requires authentication and resolves paths from the database — not from user-supplied paths
- Allowed upload types and size limits are enforced server-side
- `.env`, SQLite databases, and `backend/uploads/` contents must not be committed

See [`SECURITY_PRIVACY.md`](./SECURITY_PRIVACY.md) for full requirements.

## Key engineering decisions

- **HttpOnly cookie sessions** — JWT tokens are not stored in `localStorage`; the frontend sends credentialed requests and the backend sets HttpOnly cookies on login.
- **Server-side money handling** — Financial amounts use `Decimal` / SQLAlchemy `Numeric`; VAT totals are recalculated on the backend, not trusted from the client alone.
- **Per-document VAT rate** — Each document stores its own VAT rate at creation time; changing the office default affects new documents only.
- **Private file storage** — Uploads receive server-generated storage names; original filenames are display metadata only; downloads go through an authenticated API route.
- **Layered backend structure** — Routes, Pydantic schemas, CRUD, services, and utilities are separated for readability and testability.
- **Hebrew RTL by design** — UI text is centralized in `frontend/src/content/he.js` with `dir="rtl"` and `lang="he"` at the application root.
- **Honest mock integrations** — Future modules are visibly labeled and backed by mock or status-only endpoints with no real external API calls.

## Limitations and scope boundaries

- **Local MVP only** — intended for development and portfolio review on a developer machine; not production-deployed
- **No client portal** — clients do not register, log in, or self-service upload in this MVP
- **Mock/planned integrations only** — no real OCR, email sending, tax-authority, payment-provider, or AI document processing
- **SQLite with `create_all`** — no Alembic migrations or PostgreSQL configuration in the current MVP
- **Simple role model** — `admin` / `staff` field exists; fine-grained permissions are not implemented
- **Manual payment tracking** — records status internally; does not process cards or online payments
- **Partial manual frontend verification** — automated coverage is backend-focused; see the manual checklist for UI regression scope

## Repository structure

```text
accountant-office-management/
├── README.md
├── PORTFOLIO_CHECKLIST.md
├── docs/
│   └── ARCHITECTURE.md
├── .env.example
├── backend/
│   ├── app/          # FastAPI application (models, routes, services, utils)
│   ├── uploads/      # Private local file storage (gitignored)
│   ├── tests/        # Pytest suite
│   └── requirements.txt
└── frontend/
    ├── src/          # React pages, components, API client, Hebrew content
    └── package.json
```

## Screenshots

Portfolio screenshots will be added in a later documentation batch. They will use only fictitious data from [`DEMO_DATA.md`](./DEMO_DATA.md), portfolio-safe generic branding, and will not include credentials, secrets, real client information, or unapproved office branding.

## Documentation

| Document | Purpose |
|---|---|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System overview, auth flow, and data-flow diagram |
| [`PORTFOLIO_CHECKLIST.md`](./PORTFOLIO_CHECKLIST.md) | Pre-publication verification checklist |
| [`PROJECT_REQUIREMENTS.md`](./PROJECT_REQUIREMENTS.md) | Product scope, entities, routes, definition of done |
| [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) | Data model, relationships, financial field rules |
| [`SECURITY_PRIVACY.md`](./SECURITY_PRIVACY.md) | Authentication, upload safety, secrets, privacy |
| [`UI_UX_GUIDELINES.md`](./UI_UX_GUIDELINES.md) | RTL layout, visual style, responsive behavior |
| [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) | Phase-by-phase implementation history |
| [`MANUAL_TEST_CHECKLIST.md`](./MANUAL_TEST_CHECKLIST.md) | Manual quality and regression checks |
| [`DEMO_DATA.md`](./DEMO_DATA.md) | Safe fictitious data for demos and screenshots |
| [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) | Controlled AI-assisted development process |
| [`CURSOR_START_PROMPT.md`](./CURSOR_START_PROMPT.md) | Initial controlled prompt for starting the project in Cursor |

## Development process

This project was built in controlled phases with review and testing at each step. AI-assisted development was used as a coding assistant under explicit scope approval; see [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) for the full workflow.
