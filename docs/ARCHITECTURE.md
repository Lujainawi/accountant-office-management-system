# Architecture Overview

This document describes the high-level architecture of the Accountant Office Management System local MVP. It is intended for developers and technical reviewers evaluating the repository.

## System overview

The application is a single-tenant internal office tool. Authorized staff use a Hebrew RTL web interface to manage clients, documents, tasks, payments, and reports. All persistent data lives in a local SQLite database; uploaded demo files live in a private backend folder. There is no production deployment, cloud infrastructure, or live third-party integration in the current MVP.

```text
┌─────────────────────────────────────────────────────────────────┐
│  Browser (Hebrew RTL React SPA)                                 │
│  React + Vite + React Router                                    │
│  - Pages, forms, tables, protected routes                       │
│  - API client with credentials (cookies)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / JSON (+ multipart upload)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  FastAPI backend                                                │
│  - REST routes under /api                                       │
│  - Pydantic validation, CRUD, services                          │
│  - Auth dependency on protected routes                          │
└──────────────┬─────────────────────────────┬────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐   ┌──────────────────────────────────┐
│  SQLite (SQLAlchemy)     │   │  Private local uploads folder    │
│  - Users, clients,       │   │  - Server-generated filenames    │
│    documents, tasks,     │   │  - Not served as public static   │
│    payments, settings    │   │    files                         │
└──────────────────────────┘   └──────────────────────────────────┘
```

## Frontend responsibilities

- Render the Hebrew-first RTL interface (`lang="he"`, `dir="rtl"`)
- Route users through login and protected office pages
- Call the backend API with credentialed requests (`credentials: "include"`)
- Present forms, validation feedback, tables, filters, and status badges
- Redirect unauthenticated users to the login page
- Display mock integration pages with visible planned/mock labels

Central UI strings live in `frontend/src/content/he.js`. On desktop, the sidebar is visible by default and can be hidden or reopened from the Topbar; on narrow viewports, navigation uses the existing collapsible mobile drawer.

## Backend responsibilities

- Expose REST endpoints under `/api` for authentication, office data, dashboard, reports, settings, and mock integrations
- Validate all input with Pydantic schemas
- Enforce authentication on internal routes (health and login are public)
- Hash passwords with Argon2; issue JWT access tokens in HttpOnly cookies
- Persist entities through SQLAlchemy models and CRUD modules
- Recalculate VAT and monetary values server-side using `Decimal`
- Validate uploads (type, size, authorization) and store files with generated names
- Serve file downloads only through authenticated document download routes
- Return safe, user-facing error messages without exposing secrets or internal paths

## Database role

SQLite holds all office metadata: users, office settings, clients, documents (including file metadata and financial fields), tasks, payments, and integration status records. Tables are created on startup via SQLAlchemy `create_all` for local development. Month/year reporting derives from each document’s `document_date` rather than duplicate period fields.

## Document upload and download boundary

**Upload path:** An authenticated user submits multipart form data. The backend validates the client reference, file extension, MIME type, and size limit. A server-generated storage name is written to the private uploads folder; metadata is saved in SQLite. The original filename is kept for display only.

**Download path:** An authenticated user requests a document download by ID. The backend loads the database record, resolves the stored file internally, and returns a file response. Users cannot request arbitrary filesystem paths. Missing or invalid files produce a safe error message.

Uploaded files and the database file are gitignored and must not be committed.

## Authentication flow

1. User submits email and password to `POST /api/auth/login`.
2. Backend verifies credentials against the hashed password in SQLite.
3. On success, the backend creates a JWT and sets it in an HttpOnly cookie (`SameSite=Lax`; `Secure` follows the `COOKIE_SECURE` setting).
4. Subsequent API requests include the cookie automatically; the backend dependency decodes the JWT and loads the current user.
5. `POST /api/auth/logout` clears the cookie. `GET /api/auth/me` returns safe user profile fields for session bootstrap.
6. The frontend protects routes with a wrapper that redirects unauthenticated users to login.

Tokens are not stored in browser `localStorage`.

## Request and data flow (typical CRUD page)

1. User opens a protected page (for example, Clients).
2. Frontend checks session via `/api/auth/me` on app load.
3. Page component fetches data from the relevant `/api/...` endpoint.
4. Backend authenticates the request, queries SQLite through CRUD/services, and returns JSON.
5. User submits a form; frontend sends JSON or multipart data to the API.
6. Backend validates input, writes to SQLite (and uploads folder when applicable), and returns the result or a validation error.
7. Frontend updates the UI and shows success or field-level errors.

Dashboard and monthly reports follow the same pattern but aggregate data in service modules before responding.

## Implemented modules vs mock integrations

**Implemented (real local data and workflows):** authentication, dashboard, clients, documents, tasks, manual payments, VAT calculator, monthly reports, office settings.

**Mock / planned (UI and status endpoints only):** email preview, OCR sample, tax authority status, digital signature status, online payments concept, AI assistant suggestions. These modules read placeholder configuration, return sample or status responses, and are labeled in the UI as mock, planned, or coming soon. They do not call external provider APIs.

## Out of scope in the current architecture

- Production hosting, HTTPS termination, or CDN delivery
- PostgreSQL, Alembic migrations, or multi-office tenancy
- Client self-service portal
- Real email, OCR, payment, tax, signature, or AI provider connections
- Cloud object storage for uploads
- Fine-grained role-based authorization beyond the basic admin/staff field
