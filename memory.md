# Project Memory

## UI Rules

- Prefer Tailwind in templates for layout, spacing, sizing, typography, and one-off visual composition.
- Treat Tailwind as the default styling path for every new screen, route view, and page-level component added to the app.
- For new screens, build the visual result first in the Angular template with Tailwind utilities; only add component SCSS when there is a clear local need that would be awkward or brittle in utilities.
- Keep the color palette centralized in `src/styles.scss` using global CSS custom properties such as `--app-*`.
- When a third-party component like PrimeNG needs styling hooks that cannot live cleanly in Tailwind classes, put those styles in `src/styles.scss` so the visual system stays centralized.
- Avoid scattering hardcoded colors across component SCSS files.
- Use component SCSS sparingly; prefer empty or near-empty component stylesheets unless there is a strong local reason.
- Keep interactive controls keyboard accessible and give them visible focus states.

## Documentation Habit

- When a new architectural or styling rule becomes important, update documentation in `.github/copilot-instructions.md` and/or `README.md`.
- Keep this `memory.md` updated with reusable project conventions discovered during implementation work.
- Reusable parallel-work instructions live under `.agents/`, including `coordinator`, `gherkin-playwright`, `unit-tests`, and `app-integration`.

## Quality Habit

- Keep `eslint.config.js` aligned with the current Angular architecture of the repo; do not enable migration-driven rules such as `prefer-standalone` or `prefer-inject` unless the codebase is intentionally moving there.
- Use `npm run lint` as part of the normal local validation loop for app changes.
- Use `npm run lint:fix` for safe autofixes before hand-editing style-only issues.

## Release Habit

- Before creating a commit intended to be pushed to `master`, run `npm run lint`.
- Before creating a commit intended to be pushed to `master`, run both the unit test suite and the Playwright acceptance/E2E suite in the current workspace.
- Do not push to `master` if lint or either test suite has not been run or is failing.
