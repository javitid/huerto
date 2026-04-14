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
