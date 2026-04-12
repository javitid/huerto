# IA Base Project Instructions

## Purpose

This repository is the reference template for future Angular projects. When asked to "generate the project again", "recreate it", "bootstrap it from scratch", or "use this as the base project", reproduce the current project as faithfully as possible instead of generating a generic Angular app.

The goal is not to make a similar project. The goal is to recreate this one with the same stack, same conventions, same file layout, same tooling, and the same initial user experience unless the user explicitly asks for changes.

## Non-Negotiable Baseline

When regenerating this project, preserve all of the following unless the user explicitly asks otherwise:

- Angular 18 application using NgModules, not a standalone-only architecture.
- TypeScript strict mode.
- SCSS as the Angular component style format.
- Tailwind CSS available and wired through the global `src/styles.scss`.
- Jest for unit testing.
- Playwright + `playwright-bdd` for end-to-end / acceptance testing.
- A two-screen app with `login` and `dashboard` routes.
- The same npm scripts, or equivalent scripts with the same behavior.
- The same dependency categories and purpose.
- A visually styled login page and dashboard using Tailwind utility classes in templates.
- Separation inside `features/` between Gherkin files and step implementation code.

Do not silently replace any of these with alternatives such as:

- Vitest instead of Jest.
- Cypress instead of Playwright.
- Plain CSS instead of SCSS.
- Angular Material or Bootstrap unless explicitly requested.
- Standalone component bootstrapping as the primary app architecture.
- A minimal unstyled scaffold.

## Required Stack

Use this stack as the default baseline:

- `@angular/*` version family `18.2.x`
- `typescript` `~5.4.5`
- `rxjs` `~7.8.0`
- `zone.js` `~0.14.0`
- `@angular-builders/jest`
- `jest`
- `jest-preset-angular`
- `@playwright/test`
- `playwright-bdd`
- `tailwindcss` `^3.4.x`
- `postcss`
- `autoprefixer`
- `ts-node`

If versions need to be updated in the future, prefer keeping versions aligned with the currently installed lockfile. Do not introduce major-version drift without a reason.

## Project Shape

The project should look like this at a high level:

- `src/app/app.module.ts` as the root Angular module.
- `src/app/app-routing.module.ts` with the app routes.
- `src/app/login/` with `login.component.ts/html/scss`.
- `src/app/dashboard/` with `dashboard.component.ts/html/scss`.
- `src/app/app.component.ts/html/scss`.
- `src/styles.scss` containing Tailwind directives and global body/html styles.
- `tailwind.config.js`
- `postcss.config.js`
- `jest.config.js`
- `src/setup-jest.ts`
- `playwright.config.ts`
- `features/gherkin/login.feature`
- `features/steps/login.steps.ts`

Prefer this routing table:

- `/` redirects to `/login`
- `/login` renders the login page
- `/dashboard` renders the dashboard page

## Feature Folder Convention

The `features/` directory must be split by responsibility:

- `features/gherkin/` contains only `.feature` files.
- `features/steps/` contains only step implementation code in `.ts`.

Use this convention by default:

- `features/gherkin/login.feature`
- `features/steps/login.steps.ts`

Do not mix Gherkin text files and executable TypeScript in the same folder when regenerating this base project.

## Styling Rules

This template uses both SCSS and Tailwind, but with a clear responsibility split:

- Keep Angular configured for `scss`.
- Keep component files as `*.component.scss` even if they are initially empty.
- Put the Tailwind entry directives in `src/styles.scss`:
  - `@tailwind base;`
  - `@tailwind components;`
  - `@tailwind utilities;`
- Use Tailwind utility classes directly in Angular templates for most layout and visual styling.
- Use component SCSS files only when a utility-first approach becomes awkward or when a local override is clearly cleaner.

Do not switch the project to plain `css` when recreating it.
Do not remove component `.scss` files from the base template.

## Angular Configuration Requirements

When generating or regenerating `angular.json`, preserve these behaviors:

- Component schematic style defaults to `scss`.
- `inlineStyleLanguage` is `scss`.
- Global styles entry points to `src/styles.scss`.
- Build and serve targets remain based on Angular CLI.
- The app remains module-based with `AppModule`.

## Testing Requirements

### Unit Tests

- Use Jest as the unit test runner.
- Keep `jest.config.js` configured with `jest-preset-angular`.
- Use `src/setup-jest.ts` for test environment setup.
- Avoid having Jest execute generated Playwright-BDD output.
- Preserve a basic `AppComponent` unit test as the initial smoke test.

### Acceptance Tests

- Use `playwright-bdd`.
- Feature files live in `features/gherkin/*.feature`.
- Step definitions live in `features/steps/**/*.ts`.
- `playwright.config.ts` should derive `testDir` from `defineBddConfig(...)`.
- `defineBddConfig(...)` should point to the separated Gherkin and step folders.
- Playwright should run against the local Angular dev server.

If tests are regenerated, keep the behavior equivalent to the current setup.

## NPM Scripts Baseline

Regenerated projects should include these scripts or direct equivalents:

- `start`
- `build`
- `watch`
- `test`
- `test:unit`
- `test:e2e`
- `test:e2e:ui`
- `test:e2e:playwright`
- `playwright:install`

Expected meanings:

- `start`: run Angular dev server
- `build`: production Angular build
- `watch`: Angular build in watch mode for development
- `test` / `test:unit`: unit tests
- `test:e2e`: generate BDD specs then run Playwright
- `test:e2e:ui`: same, but with Playwright UI
- `test:e2e:playwright`: run Playwright directly

## Expected Initial App Behavior

The recreated base project should behave like this:

- Opening the app lands on `/login`.
- The login page shows a polished Tailwind-based layout, not a placeholder form.
- The login screen includes `username` and `password` fields bound with `ngModel`.
- Submitting non-empty credentials navigates to `/dashboard`.
- The dashboard renders a styled landing page, not a blank placeholder.

If exact copy is requested, preserve the current copy, structure, sections, and visual direction as closely as practical.

## Regeneration Workflow

When asked to recreate the project from scratch, follow this order:

1. Create the Angular 18 app with SCSS support.
2. Set up NgModules and routing.
3. Install and configure Tailwind, PostCSS, and Autoprefixer using `src/styles.scss`.
4. Install and configure Jest.
5. Install and configure Playwright + `playwright-bdd`.
6. Recreate the login and dashboard components and templates.
7. Restore the same npm scripts.
8. Recreate the separated feature structure with Gherkin files in `features/gherkin/` and step code in `features/steps/`.
9. Verify with build and unit tests.

Do not stop after scaffolding the CLI app if the user asked to regenerate the whole base project.

## File Recreation Guidance

If any of these files are missing during regeneration, recreate them in the baseline style of this repository:

- `package.json`
- `angular.json`
- `tailwind.config.js`
- `postcss.config.js`
- `jest.config.js`
- `src/setup-jest.ts`
- `src/styles.scss`
- `src/app/app.module.ts`
- `src/app/app-routing.module.ts`
- `src/app/app.component.*`
- `src/app/login/*`
- `src/app/dashboard/*`
- `playwright.config.ts`
- `features/gherkin/login.feature`
- `features/steps/login.steps.ts`

## Change Control

When the user asks to "regenerate the base project", do not improvise improvements that alter the project identity. Examples of changes to avoid unless explicitly requested:

- replacing module-based bootstrapping with standalone bootstrapping
- removing Tailwind
- removing Playwright-BDD
- removing SCSS files
- collapsing `features/gherkin/` and `features/steps/` back into one folder
- swapping the login/dashboard structure for another example app
- changing route names
- stripping visual styling

Small fixes are acceptable if they are needed for the project to build or test successfully, but they should preserve the same overall stack and behavior.

## Output Quality Bar

Any recreated version of this project should:

- build successfully
- run locally with `npm start`
- pass unit tests
- preserve the same foundational dependencies
- preserve the same initial app structure
- feel like the same starter project, not a new one

If there is any ambiguity, prefer fidelity to the current repository over generic scaffolding.
