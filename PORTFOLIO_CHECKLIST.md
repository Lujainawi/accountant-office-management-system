# Portfolio Publication Checklist

Use this checklist before making the repository public or sharing it on a CV, portfolio site, or job application. Complete each section manually; items are intentionally unchecked.

## Repository hygiene

- [ ] Working tree is clean or only contains intended documentation changes
- [ ] `.env` is not tracked or committed
- [ ] SQLite database files (`*.db`) are not tracked or committed
- [ ] `backend/uploads/` contains no real client files (only empty or local demo files, gitignored)
- [ ] `frontend/dist/`, `node_modules/`, `.venv/`, `.venv312/`, and other generated artifacts are not committed
- [ ] `.gitignore` covers secrets, databases, uploads, and build output

## Secret and privacy review

- [ ] No API keys, passwords, tokens, or `SECRET_KEY` values appear in committed files
- [ ] No real client names, contact details, business IDs, or financial records in the repository
- [ ] Demo and screenshot data use only fictitious values from `DEMO_DATA.md`
- [ ] Error messages and logs in demos do not expose internal paths or stack traces

## Documentation accuracy

- [ ] README describes the project as a local internal MVP, not production-deployed
- [ ] README separates implemented features from mock/planned integrations
- [ ] Setup instructions work on a fresh clone (backend, frontend, first login)
- [ ] Environment variable documentation matches `.env.example`
- [ ] No claims of live external integrations, cloud storage, or legal/tax certification
- [ ] Architecture and limitations documents match the current codebase

## Screenshot review (when added)

- [ ] Screenshots use fictitious demo data only
- [ ] No credentials, `.env`, terminal windows, browser bookmarks, or local file paths visible
- [ ] Mock module screenshots show planned/mock labels clearly
- [ ] Hebrew UI screenshots have English captions in the README
- [ ] Public screenshots use portfolio-safe generic branding only

## Final backend and frontend verification

- [ ] Backend starts without errors (`uvicorn app.main:app --reload`)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Health endpoint responds at `/api/health`
- [ ] Login and logout work with the development admin user
- [ ] Core workflows function: clients, documents, tasks, payments, dashboard, reports, settings
- [ ] Backend test suite passes (`python -m pytest` from `backend/`) — record result in final verification batch
- [ ] Relevant manual checklist items in `MANUAL_TEST_CHECKLIST.md` reviewed for the release baseline

## GitHub presentation

- [ ] README provides a clear English overview for recruiters and developers
- [ ] Documentation index links resolve correctly
- [ ] Screenshots section is populated (after the screenshot batch) or honestly marked as pending
- [ ] Commit history shows meaningful phased development
- [ ] Repository description and topics (if used) match the actual scope

## Public branding permission

- [ ] Portfolio-safe generic branding is configured before public screenshot capture
- [ ] Public screenshots do not show unapproved office names, logos, or branding

## Truthful portfolio claims

- [ ] No production URL or “live demo” claim unless one actually exists
- [ ] No statement that OCR, email, payments, tax authority, or AI integrations are working
- [ ] No claim of full frontend automated test coverage
- [ ] No final backend test count stated until the verification batch records it
- [ ] Project is not described as production-ready for real sensitive client data
