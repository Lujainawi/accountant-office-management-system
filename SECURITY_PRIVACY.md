\
# Accountant Office Management System — Security and Privacy Requirements

## 1. Purpose

This document defines the minimum security and privacy rules for the local MVP.

The project handles information that could become sensitive in a real accountant office. The MVP must use fictitious data only and must not be described as production-ready. These rules keep the codebase safe, understandable, and ready for later hardening.

## 2. Core Principles

1. Protect access to internal data.
2. Treat uploaded files as untrusted.
3. Keep secrets out of source control.
4. Minimize collected data.
5. Never use real client data in demos or GitHub.
6. Do not connect to real external services in the MVP.
7. Do not expose implementation details in errors or API responses.

## 3. Authentication and Authorization

### Required MVP behavior

- Passwords must be hashed with a maintained password-hashing library; never store plain text passwords.
- All internal routes except health/login require authentication.
- The frontend must redirect unauthenticated users to login.
- `GET /api/auth/me` must return only safe user information.
- Login errors must not state whether an email exists.
- Logout must clear the authentication cookie/session safely.
- Use a strong `SECRET_KEY` loaded from environment variables.
- In deployed environments, store authentication tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies; do not use `localStorage` for tokens.
- Configure CORS to permit only the configured frontend origin; do not use `*` together with credentials.

### Not required in the MVP

- Full role/permission matrix.
- Password-reset email flow.
- MFA.
- Account lockout implementation.
- Enterprise SSO.

These may be planned later but must not be faked as implemented.

## 4. Secrets and Configuration

### Must never be committed

```text
.env
*.db
accountant_app.db
backend/uploads/*
real API keys
access tokens
cookies/session exports
real client files
real customer data
```

### Required files

- `.env.example` with placeholder values only.
- `.gitignore` that excludes secrets, database files, generated uploads, Python caches, frontend build files, and `node_modules`.

Recommended `.gitignore` entries:

```text
.env
.env.*
!.env.example
__pycache__/
*.py[cod]
.pytest_cache/
.venv/
accountant_app.db
*.db
backend/uploads/
node_modules/
dist/
build/
coverage/
```

`backend/uploads/` is private local storage; its contents are gitignored and uploaded files must not be committed.

## 5. File Upload and Download Security

### Upload requirements

- Require authentication for upload.
- Allow only PDF, PNG, JPG, JPEG, DOCX, and XLSX.
- Validate the extension and the detected MIME type; never trust only the user-provided file name.
- Enforce `MAX_UPLOAD_SIZE_MB` before saving.
- Generate a random server-side storage name, for example UUID-based.
- Preserve the original filename only as display metadata.
- Keep uploads in a private backend folder that is not served as public static content.
- Do not accept executables, scripts, archives, or unknown MIME types.
- Reject invalid uploads with a clear but non-sensitive error message.
- Do not perform OCR, AI processing, or external file transmission in the MVP.

### Download requirements

- Require authentication before a file download.
- Check that the requested document exists and belongs to an accessible client record.
- Use the database record to resolve the server file; never accept arbitrary path input.
- Return a safe download response without exposing local absolute paths.
- Handle a missing stored file gracefully and log a safe internal message.

## 6. Data Validation and Error Handling

- Validate all input in Pydantic schemas on the backend.
- Validate IDs, required text, email format, enum values, dates, numeric ranges, and foreign-key relationships.
- Validate amounts as non-negative `Decimal` values where appropriate.
- Recalculate VAT totals server-side; do not trust totals submitted by the frontend.
- Return appropriate HTTP statuses such as `400`, `401`, `403`, `404`, `409`, and `422` with safe human-readable messages.
- Do not return stack traces, file paths, password hashes, secret keys, database connection strings, or raw third-party errors to the UI.
- Log errors without logging passwords, auth tokens, full document contents, or secret values.

## 7. Privacy and Demo Data

- Use only fictitious names, emails, phone numbers, business IDs, document values, and files in the repository.
- Do not upload real invoices, receipts, bank documents, client contact details, or tax documents.
- Redact any accidental real data before screenshots, screen recordings, and Git commits.
- Mark mock OCR/AI results as sample data.
- Use `DEMO_DATA.md` as the safe source for presentation data.

## 8. External Integrations

The following must remain mock/planned in the MVP:

- Email providers.
- OCR providers.
- Tax authority/government services.
- Digital signature providers.
- Payment providers.
- AI model providers.

Rules:

- Do not make real network calls to these providers.
- Do not use real API keys.
- Use environment placeholder names only.
- Mock service responses must visibly identify themselves as mock data.
- Include TODO comments explaining what would be required before real integration.

## 9. Deployment and Production Boundaries

The local MVP can run on a developer machine. Before real deployment or real sensitive data use, the project would require, at minimum:

- HTTPS.
- Production database and backup/restore strategy.
- Database migrations.
- Strong secret management.
- More complete role-based authorization.
- Audit logs and data-retention decisions.
- Monitoring and secure error logging.
- Dependency updates and vulnerability review.
- Privacy/legal review relevant to the deployment environment.
- File-malware scanning and secure storage strategy.
- Rate limiting and brute-force protection for login.

Do not claim these are implemented unless they actually are.

## 10. Security Definition of Done

Before marking a phase complete, confirm:

- Secrets and database files are ignored by Git.
- Passwords are never stored or returned in plain text.
- Protected routes reject unauthenticated requests.
- Unsupported or oversized file uploads are rejected.
- Downloads require authentication.
- API errors do not expose sensitive technical information.
- Screenshots and demo content use fictitious data only.
- Mock integrations make no real external calls.
