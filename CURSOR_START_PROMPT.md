\
# Cursor Start Prompt

Use the following message as the **first prompt** in Cursor after these documents are placed in the project root.

```text
Read these files completely before writing or changing any code:

1. README.md
2. PROJECT_REQUIREMENTS.md
3. DATABASE_SCHEMA.md
4. SECURITY_PRIVACY.md
5. UI_UX_GUIDELINES.md
6. DEVELOPMENT_PLAN.md
7. AI_WORKFLOW.md
8. MANUAL_TEST_CHECKLIST.md
9. DEMO_DATA.md

This project is an internal Accountant Office Management System MVP.
It is NOT a public marketing website and NOT a client portal.
Only the accountant or authorized office staff use the system in the MVP.

Do not write code, install packages, create files, or modify documentation yet.

First answer with:

1. A concise project summary.
2. The exact MVP features.
3. The future/mock-only features.
4. The scope boundaries: what must not be built now.
5. Suggested technical stack, including only necessary libraries.
6. Suggested project folder structure.
7. Suggested SQLite + SQLAlchemy database schema, aligned with DATABASE_SCHEMA.md.
8. The recommended phase-by-phase implementation order, aligned with DEVELOPMENT_PLAN.md.
9. Any contradictions, risks, or decisions that need attention.
10. A list of files you expect to create in Phase 1 only.
11. A list of dependencies you would need in Phase 1 only, with a short reason for each.

Then stop and wait for my approval.

Important rules:

- Treat PROJECT_REQUIREMENTS.md as the functional source of truth.
- Follow DATABASE_SCHEMA.md for data and money rules.
- Follow SECURITY_PRIVACY.md for authentication, secrets, file uploads, downloads, and privacy rules.
- Follow UI_UX_GUIDELINES.md for RTL, Hebrew-first layout, responsive behavior, accessibility, and visual design.
- Build one approved phase at a time only.
- Do not build the whole project in one request.
- Do not add features outside the approved phase.
- Do not create a client portal in the MVP.
- Do not use real API keys, real external services, real client data, or real client files.
- Do not store secrets in code or commit .env files.
- Do not use float for monetary values; use Decimal/Numeric.
- Do not expose uploaded files as public static files.
- Do not use Docker, Kubernetes, Redis, Celery, microservices, advanced deployment, or a heavy UI library unless I explicitly approve it.
- Do not add a dependency without explaining why it is needed.
- Do not silently change these requirements; propose changes first and wait for approval.
- Clearly label all future integration modules as Planned, Mock Mode, or Coming Soon.
```

## After Cursor Responds

Before approving code, check that Cursor understood:

- This is an internal accountant office system.
- Clients do not log in during the MVP.
- SQLite is the local MVP database.
- Money uses Decimal/Numeric, not float.
- `OfficeSettings` is part of the schema.
- `document_date` is the source for month/year reports.
- Uploaded files must be private, validated, and downloadable only through an authenticated route.
- Future integrations are mock/planned only.
- Hebrew-first RTL UX is required.
- The project will be built one phase at a time.

## Prompt to Begin an Approved Phase

Use this template after you approve the first plan:

```text
Start Phase <NUMBER> only from DEVELOPMENT_PLAN.md.

Before writing code, restate:
- The phase goal
- The exact definition of done
- Files you will create/change
- Dependencies you will add, if any, and why
- Any important assumption or risk

Wait for my approval after that plan. Do not begin later phases.
```

## Prompt After a Phase Is Implemented

```text
Do not start another phase.

Summarize:
1. Files changed
2. What is now working
3. How to run it
4. Manual tests I should perform
5. Any known limitation
6. Suggested Git commit message
7. Explain any code section that may be difficult for a student developer to understand
```
