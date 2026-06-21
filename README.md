\
# Accountant Office Management System

> **Internal MVP for an accountant office** — a full-stack system for organizing clients, documents, tasks, payments, VAT calculations, and monthly internal summaries.

## Project Overview

This project is an **internal office-management system**, not a public marketing website and not a client portal.

Only the accountant and authorized office staff use the system. In the MVP, clients do not create accounts, log in, upload documents, or make payments through the application. Client documents arrive through external channels such as email, WhatsApp, or physical delivery; an authorized office user then manages them in the system.

The project is intentionally built as a realistic, understandable portfolio application using Cursor as an AI-assisted development tool. It demonstrates full-stack development, database design, authentication, document-management workflow, dashboard/reporting logic, validation, testing, and careful AI-assisted development.

## Core Goals

The system should help an accountant:

- Keep client records in one organized place.
- Store and find document metadata and approved demo files.
- Track the stage of each document and missing information.
- Track internal tasks, deadlines, and priorities.
- Calculate VAT and document totals correctly.
- See a concise dashboard and monthly internal summaries.
- Record payment status manually without processing real payments.
- Keep future integrations visible as clearly labeled mock or planned modules.

## Scope and Important Boundaries

### Included in the MVP

1. Accountant/staff authentication.
2. Dashboard with data from SQLite.
3. Client management and a client-details page.
4. Document metadata, controlled demo-file upload, download, search, and filters.
5. VAT calculator and automatic VAT calculations in document forms.
6. Internal task tracking.
7. Manual payment-status tracking.
8. Monthly internal summaries.
9. Office settings.
10. Clearly labeled future/mock module pages.

### Explicitly excluded from the MVP

- Public marketing website.
- Client registration, login, portal, messaging, or self-service upload.
- Real email sending, OCR, payment processing, tax-authority submission, digital signatures, or AI processing.
- Real client documents, real secrets, credit-card data, or production deployment claims.
- Docker, Kubernetes, Redis, Celery, microservices, and complex permissions unless explicitly approved later.

> **Important:** This is a portfolio/MVP system. It must not be presented as legal accounting software, an official tax report, or a production-ready system for real sensitive client data without further security, privacy, operational, and legal work.

## Technology Stack

| Area | Choice |
|---|---|
| Frontend | React + Vite + React Router |
| Styling | Simple modular CSS / CSS variables; no heavy UI library in the MVP |
| Backend | Python + FastAPI |
| Database | SQLite for the local MVP |
| ORM | SQLAlchemy |
| Validation | Pydantic schemas and frontend form validation |
| Authentication | Password hashing + token-based session in secure cookies for deployed environments |
| File storage | Private local `backend/uploads/` folder for demo files only |
| Tests | Pytest for backend plus manual test checklist |

SQLite is intentionally used for the local MVP. The application should use SQLAlchemy and environment-based configuration so the database can be migrated to PostgreSQL later without rewriting the business logic.

## Main Screens

1. Login
2. Dashboard
3. Clients
4. Add/Edit Client
5. Client Details
6. Documents
7. Upload/Edit Document
8. VAT Calculator
9. Tasks
10. Monthly Reports
11. Settings
12. Future Modules
13. Email Preview — Mock Mode
14. OCR Invoice Reader — Coming Soon
15. Tax Authority Integration — Planned
16. Digital Signature — Planned
17. Online Payments — Mock Mode
18. AI Assistant — Planned

## Design Direction

The application should look like a calm, modern, trustworthy office tool:

- Hebrew-first, right-to-left (RTL) interface for the MVP.
- Layout prepared for future Arabic/English translation without implementing a language selector yet.
- Clean sidebar, clear page titles, readable tables, and visible status badges.
- Professional, accessible forms with explicit labels and understandable errors.
- Responsive layout for laptop, tablet, and basic mobile use.
- No public pages that expose document data or client information.

See [`UI_UX_GUIDELINES.md`](./UI_UX_GUIDELINES.md) for the detailed design rules.

## Project Documentation

| File | Purpose |
|---|---|
| `PROJECT_REQUIREMENTS.md` | Product scope, mandatory behavior, entities, routes, and definition of done. |
| `DEVELOPMENT_PLAN.md` | Controlled phase-by-phase implementation sequence. |
| `DATABASE_SCHEMA.md` | Data model, field rules, relationships, indexes, and financial-data decisions. |
| `UI_UX_GUIDELINES.md` | RTL layout, visual style, accessibility, responsive behavior, and screen guidance. |
| `SECURITY_PRIVACY.md` | Authentication, file-upload, privacy, secrets, and deployment safety requirements. |
| `CURSOR_START_PROMPT.md` | First prompt to use in Cursor. |
| `AI_WORKFLOW.md` | How AI-assisted development is reviewed and controlled. |
| `MANUAL_TEST_CHECKLIST.md` | Manual quality, safety, and regression checks. |
| `DEMO_DATA.md` | Safe fictitious data for screenshots, demos, and tests. |

## Suggested Folder Structure

```text
accountant-office-management-system/
├── README.md
├── PROJECT_REQUIREMENTS.md
├── DEVELOPMENT_PLAN.md
├── DATABASE_SCHEMA.md
├── UI_UX_GUIDELINES.md
├── SECURITY_PRIVACY.md
├── CURSOR_START_PROMPT.md
├── AI_WORKFLOW.md
├── MANUAL_TEST_CHECKLIST.md
├── DEMO_DATA.md
├── .gitignore
├── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── crud/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── uploads/
│   │       └── .gitkeep
│   ├── tests/
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── styles/
    │   ├── utils/
    │   └── main.jsx
    └── package.json
```

## Local Setup (after the code is generated)

### Prerequisites

- Python 3.12 or newer
- Node.js 20 or newer
- npm
- Git

### Backend

```bash
cd backend
python -m venv .venv
```

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**Linux / WSL / macOS:**

```bash
source .venv/bin/activate
```

```bash
pip install -r requirements.txt
copy .env.example .env          # Windows Command Prompt
# or: cp .env.example .env      # Linux / WSL / macOS
uvicorn app.main:app --reload
```

Expected development health route:

```text
GET http://127.0.0.1:8000/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Use the URL printed by Vite, usually:

```text
http://localhost:5173
```

## Environment Variables

Create `.env` locally from `.env.example`. Never commit the real `.env` file.

```env
DATABASE_URL=sqlite:///./accountant_app.db
SECRET_KEY=replace_with_a_long_random_value_for_local_development
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_ORIGIN=http://localhost:5173
MAX_UPLOAD_SIZE_MB=10

# Placeholder values only; no real integration is enabled in the MVP.
EMAIL_API_KEY=not_configured
OCR_API_KEY=not_configured
PAYMENT_API_KEY=not_configured
SIGNATURE_API_KEY=not_configured
TAX_AUTHORITY_API_KEY=not_configured
AI_API_KEY=not_configured
```

## Security and Demo-Data Rules

- Never commit `.env`, database files, uploaded files, tokens, secrets, or real client data.
- Store passwords only as strong password hashes.
- Use fictitious data only for screenshots, demos, and GitHub.
- Keep uploaded files private; serve them through an authenticated download endpoint.
- Do not send client documents to external services in the MVP.
- Do not store credit-card information and do not process payments.

See [`SECURITY_PRIVACY.md`](./SECURITY_PRIVACY.md) for mandatory implementation rules.

## Development Workflow

1. Open the project in Cursor.
2. Add all project documentation files before requesting code.
3. Paste the first prompt from `CURSOR_START_PROMPT.md`.
4. Review Cursor's project summary and plan.
5. Approve one phase only.
6. Run and manually test that phase.
7. Review unfamiliar code and ask Cursor to explain it.
8. Commit the working phase with a clear Git message.
9. Continue only after the current phase works.

## Demo and Portfolio Notes

For a strong GitHub/CV presentation, include:

- A concise project description and technology stack.
- Screenshots using only the fictitious sample data in `DEMO_DATA.md`.
- A short demo video or GIF later, if possible.
- Clear mention that the system is an internal MVP and integrations are mock/planned.
- A short section explaining the controlled Cursor workflow.

## Future Direction

After the MVP is stable, possible future work includes a separate public marketing website, client portal, PostgreSQL deployment, real email/OCR integrations, official tax integration, digital signatures, online payments, stronger role management, audit logs, backups, and multilingual UI.
