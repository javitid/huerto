# Agents

This project uses a three-agent collaboration split for medium and large tasks, plus an optional coordinator role for task distribution and integration.

## Agents

- `coordinator.md`: distributes work, defines ownership, tracks overlaps, and integrates results.
- `gherkin-playwright.md`: owns Gherkin scenarios, BDD steps, and Playwright-facing E2E flow work.
- `unit-tests.md`: owns Angular unit tests and coverage improvements outside E2E.
- `app-integration.md`: owns application code, functional changes, and integration work across `src/app/**`.

## Shared Rules

- Keep file ownership clear to avoid merge conflicts and duplicated work.
- Do not revert changes made by another agent.
- If a task requires touching another agent's owned files, hand off or coordinate explicitly.
- Treat these files as reusable operating instructions for future parallel work.
- The coordinator is responsible for deciding whether a task should be split across agents or handled by a single owner.
- Treat `npm run lint` as a shared quality gate for changed code, not as an optional cleanup step.

## Handoff Boundaries

- E2E-facing app hooks such as `src/app/testing/e2e-mode.ts`, `src/app/auth/auth.service.ts`, and `src/app/dashboard/data/dashboard-firestore.service.ts` are coordination boundaries.
- `data-testid` attributes, route flows, and user-facing copy used by E2E should be changed carefully and communicated across agents.
- When a task changes production code or templates, the owning agent should expect ESLint feedback on both `*.ts` and Angular `*.html`.
