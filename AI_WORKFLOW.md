\
# AI-Assisted Development Workflow

## Purpose

This project is developed with Cursor as an AI-assisted development tool.

The goal is not to let AI build the whole project without control. The goal is to use AI as a development assistant while keeping the code understandable, reviewed, tested, and owned by the developer.

## Workflow

1. I prepare the project idea, README, requirements, database schema, security rules, UI guidance, and development plan.
2. Cursor reads the documentation before it writes code.
3. Cursor first summarizes the project and proposes a limited plan for the next phase.
4. I review the plan and approve only one phase at a time.
5. Cursor lists files and dependencies before it changes them.
6. Cursor implements only the approved phase.
7. I run the project locally after each phase.
8. I test the new feature manually using the checklist.
9. I review the generated code and ask Cursor to explain anything unclear.
10. I fix bugs, simplify code, or request corrections when needed.
11. I commit each working phase separately with a clear Git message.
12. I do not continue until the current phase works.

## What Cursor May Help With

Cursor can help with:

- Project structure.
- FastAPI routes and dependencies.
- SQLAlchemy models and SQLite configuration.
- Pydantic schemas and CRUD operations.
- React pages, components, routing, and basic responsive CSS.
- RTL layout implementation.
- Form validation and error handling.
- Document-upload validation logic.
- Tests and test-data setup.
- Refactoring and documentation.
- Explaining code line by line when requested.

## What Cursor Must Not Do

Cursor must not:

- Build the entire project in one request.
- Add features outside the approved phase.
- Build a client portal in the MVP.
- Use real API keys, real external services, or real client data.
- Store real client files in the repository.
- Store secrets in code or plain-text passwords in the database.
- Use `float` for financial amounts.
- Make uploaded documents publicly accessible.
- Add unnecessary architecture, dependencies, Docker, Kubernetes, Redis, Celery, microservices, or advanced deployment.
- Present a mock future feature as if it is fully working.
- Make a requirement change without explaining it and receiving approval.

## Review Questions After Every Phase

After each phase, I check:

- Does the feature work from the UI when relevant?
- Does the related backend route work?
- Does data persist in SQLite when relevant?
- Is the code understandable and appropriately small?
- Are financial values handled with Decimal/Numeric?
- Are validation errors clear and safe?
- Are routes and file downloads protected as required?
- Are unsupported/oversized uploads blocked when uploads are involved?
- Did Cursor add an unnecessary dependency or hidden scope change?
- Are future/mock features clearly labeled?
- Are there no real secrets, real client documents, or database files staged for Git?

## Git Workflow

Recommended commit style:

```text
Add project documentation and MVP scope
Initialize full-stack project structure
Set up FastAPI backend foundation
Build RTL frontend shell and navigation
Configure SQLite and office settings
Implement accountant authentication flow
Implement client management end to end
Build client details workspace
Implement secure document management
Implement internal task tracking
Connect dashboard to live database summaries
Add VAT calculator and office settings UI
Add manual payment tracking
Add monthly internal reports
Add clearly labeled future integration mocks
Improve validation error handling and security checks
Add core tests and regression checklist
Finalize documentation tests and portfolio cleanup
```

## Final Note

AI is used as an assistant, not as a substitute for understanding the project.

Every generated feature must be reviewed, run, tested, and committed only after it works. The final project should show both technical implementation and responsible AI-assisted engineering practice.
