# IA Base Project Instructions

## Purpose

This repository is the reference template for future Angular projects. When asked to "generate the project again", "recreate it", "bootstrap it from scratch", or "use this as the base project", reproduce the current project as faithfully as possible instead of generating a generic Angular app.

The goal is not to make a similar project. The goal is to recreate this one with the same stack, same conventions, same file layout, same tooling, and the same initial user experience unless the user explicitly asks for changes.

This base should be treated as a general-purpose authenticated web app, not a domain-specific product. Avoid hardcoding thematic copy such as farming, huerta, healthcare, retail, etc. unless the user explicitly asks for a verticalized version.

## Non-Negotiable Baseline

When regenerating this project, preserve all of the following unless the user explicitly asks otherwise:

- Angular 21 application using NgModules, not a standalone-only architecture.
- TypeScript strict mode.
- SCSS as the Angular component style format.
- Tailwind CSS available and wired through the global `src/styles.scss`.
- Jest for unit testing.
- Playwright + `playwright-bdd` for end-to-end / acceptance testing.
- A two-screen app with `login` and `dashboard` routes.
- Runtime internationalization with Spanish and English available by default.
- Firebase Authentication integrated in the frontend.
- Google sign-in and anonymous sign-in available from the login screen.
- Route protection for the dashboard using an Angular auth guard.
- A local-only Firebase environment file ignored by git.
- GitHub Pages deployment with Firebase production config injected from GitHub Secrets.
- CI validation with Jest unit tests and Playwright E2E before deployment.
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
- A fake login form using only `username` and `password` fields without real authentication.
- Storing real Firebase values directly in tracked production environment files.

## Required Stack

Use this stack as the default baseline:

- `@angular/*` version family `21.2.x`
- `typescript` `~5.9.3`
- `rxjs` `~7.8.0`
- `zone.js` `~0.15.1`
- `firebase` `10.x`
- Do not add `@angular/fire` unless the user explicitly asks for it. This base currently uses the Firebase JS SDK directly.
- `@angular-builders/jest` `^21.x`
- `jest` `^30.x`
- `jest-preset-angular` `^16.x`
- `jsdom` `^26.x`
- `@types/jest` `^30.x`
- `@playwright/test`
- `playwright-bdd`
- `primeng`
- `primeicons`
- `@angular/cdk`
- `@primeuix/themes`
- `tailwindcss` `^3.4.x`
- `postcss`
- `autoprefixer`
- `ts-node`

If versions need to be updated in the future, prefer keeping versions aligned with the currently installed lockfile. Do not introduce major-version drift without a reason.

## Project Shape

The project should look like this at a high level:

- `src/app/app.module.ts` as the root Angular module.
- `src/app/app-routing.module.ts` with the app routes.
- `src/app/auth/auth.service.ts` for Firebase auth integration.
- `src/app/auth/auth.guard.ts` for protected routes.
- `src/app/login/` with `login.component.ts/html/scss`.
- `src/app/dashboard/` with `dashboard.component.ts/html/scss`.
- `src/app/app.component.ts/html/scss`.
- `src/styles.scss` containing Tailwind directives and global body/html styles.
- `src/environments/environment.ts` with safe placeholders.
- `src/environments/environment.prod.ts` with safe placeholders.
- `src/environments/environment.local.ts` for real local Firebase config and ignored by git.
- `src/environments/environment.local.example.ts` as the local template.
- `.github/workflows/deploy-pages.yml` injecting Firebase config from GitHub Secrets before the production build.
- `.github/workflows/deploy-pages.yml` running unit tests and Playwright before the deploy jobs.
- `tailwind.config.js`
- `postcss.config.js`
- `jest.config.js`
- `playwright.config.ts`
- `src/app/i18n/`
- `src/assets/i18n/es.json`
- `src/assets/i18n/en.json`
- `features/gherkin/login.feature`
- `features/steps/login.steps.ts`

Prefer this routing table:

- `/` redirects to `/login`
- `/login` renders the login page
- `/dashboard` renders the dashboard page and is protected by `AuthGuard`

Routing strategy note:

- Use Angular hash routing (`useHash: true`) for this repository.
- Public URLs in the browser should therefore look like `/#/login` and `/#/dashboard`.
- This is intentional to avoid GitHub Pages returning an HTTP 404 on direct navigation to SPA routes like `/login`, even if a client-side redirect later recovers.

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
- Keep the visual design polished and intentional, but the copy should remain generic enough to serve as a reusable authenticated portal starter.
- All interactive elements must be keyboard accessible by default.
- Use native interactive elements such as `button`, `a`, `input`, and `select` instead of clickable `div` or `span` elements.
- Every clickable control must expose a clearly visible `:focus-visible` state with enough contrast against the background.
- Keyboard users must be able to complete the core flows without requiring a mouse.
- Centralize the shared color palette in `src/styles.scss` via global CSS variables instead of repeating raw color values across component styles.
- Prefer Tailwind classes in templates over component-level SCSS for layout and most visual styling. Use component SCSS only for truly local exceptions.
- If a third-party UI library like PrimeNG needs custom styling, prefer global styles in `src/styles.scss` so the palette and interaction design stay consistent in one place.

## Internationalization Rules

- Keep runtime internationalization enabled for at least Spanish (`es`) and English (`en`).
- Preserve a shared translation layer in `src/app/i18n/` instead of scattering copy decisions across components.
- Store user-facing translations in language files under `src/assets/i18n/`, one JSON file per language.
- Language selection should persist across reloads when practical.
- New user-facing copy should be added through the translation layer, not hardcoded in only one language.
- The global language selector should use PrimeNG and show compact options with flags plus short labels such as `🇪🇸 ES` and `🇺🇸 EN`.

Do not switch the project to plain `css` when recreating it.
Do not remove component `.scss` files from the base template.

## Angular Configuration Requirements

When generating or regenerating `angular.json`, preserve these behaviors:

- Component schematic style defaults to `scss`.
- `inlineStyleLanguage` is `scss`.
- Global styles entry points to `src/styles.scss`.
- Build and serve targets remain based on Angular CLI.
- The app remains module-based with `AppModule`.
- Do not add `defaultProject`; current Angular CLI versions warn on that legacy workspace property.
- Router configuration should keep `useHash: true` for GitHub Pages compatibility.
- Production build sets `baseHref` to `/huerto/` for GitHub Pages deployment in this repository.
- Production build replaces `src/environments/environment.ts` with `src/environments/environment.prod.ts`.
- Development build replaces `src/environments/environment.ts` with `src/environments/environment.local.ts`.
- Jest test target uses `@angular-builders/jest:run` with:
  - `config` set to `jest.config.js`
  - `tsConfig` set to `tsconfig.spec.json`
  - `zoneless` set to `false`

## Authentication Requirements

Authentication is part of the baseline project, not an optional enhancement.

- Use Firebase Authentication in the frontend.
- Implement the auth layer in `src/app/auth/auth.service.ts`.
- Use the Firebase JS SDK directly from `firebase/*` imports unless the user explicitly asks for AngularFire.
- Support Google sign-in via `signInWithPopup(...)`.
- Support anonymous sign-in via `signInAnonymously(...)`.
- Persist sessions in the browser using `browserLocalPersistence`.
- Track auth state with `onAuthStateChanged(...)`.
- Expose auth state as observables for the rest of the app.
- Protect `/dashboard` with an Angular route guard.
- Include a logout action from the dashboard.
- Keep login UX focused on provider-based access, not username/password simulation.

If asked to regenerate the login flow, keep it real and production-shaped. Do not revert to a fake credential check just because it is simpler.

## Firebase Configuration Rules

Preserve this environment strategy:

- `src/environments/environment.ts` contains only placeholder values.
- `src/environments/environment.prod.ts` contains only placeholder values.
- `src/environments/environment.local.ts` contains real local values and must be ignored by git.
- `src/environments/environment.local.example.ts` documents the expected shape for local setup.

The expected Firebase config shape is:

```ts
firebase: {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  appId: '...',
  messagingSenderId: '...',
  storageBucket: '...'
}
```

Do not add service-account credentials, admin SDK secrets, private keys, or other backend-only secrets to the frontend app.

## GitHub Pages and Secret Injection

The repository is expected to support deployment to GitHub Pages using a GitHub Actions workflow.

When regenerating the workflow:

- Keep `.github/workflows/deploy-pages.yml`.
- Run Jest unit tests before the build job.
- Run Playwright end-to-end tests before the build job.
- Do not allow the deploy stage to run unless tests pass.
- Install dependencies with `npm ci`.
- For Playwright in CI, install the required browser explicitly.
- Before end-to-end tests, generate `src/environments/environment.local.ts` from GitHub Secrets so development config is available in CI.
- Before the production build, generate `src/environments/environment.prod.ts` from GitHub Secrets.
- Then run the production build.
- Keep SPA fallback generation by copying `index.html` to `404.html`.
- Keep `.nojekyll` generation.
- Even with SPA fallback, prefer hash routing in this repository so direct route access does not depend on a 404 fallback response from GitHub Pages.

Expected GitHub repository secrets:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_STORAGE_BUCKET`

Important constraint:

- These values should not be committed as real credentials in tracked files.
- They may still be visible in the final browser bundle because this is a frontend web app. That is acceptable for Firebase web config.
- Security must rely on Firebase Auth configuration, authorized domains, and backend/storage rules, not on hiding web config values.

## Testing Requirements

### Unit Tests

- Use Jest as the unit test runner.
- Keep `jest.config.js` configured with `jest-preset-angular`.
- Keep Angular testing on the zone-based path for this project. Do not silently migrate the app or tests to zoneless behavior unless the user asks for that change.
- Prefer the minimal Jest setup needed by the current builder configuration.
- Do not add `setupFilesAfterEnv` that reinitializes Angular testing if the builder already handles it.
- Avoid loading `src/test.ts` through the Jest TypeScript config because it duplicates Angular test environment setup.
- Avoid having Jest execute generated Playwright-BDD output.
- Preserve a basic `AppComponent` unit test as the initial smoke test when applicable.

### Acceptance Tests

- Use `playwright-bdd`.
- Feature files live in `features/gherkin/*.feature`.
- Step definitions live in `features/steps/**/*.ts`.
- `playwright.config.ts` should derive `testDir` from `defineBddConfig(...)`.
- `defineBddConfig(...)` should point to the separated Gherkin and step folders.
- Playwright should run against the local Angular dev server.
- Prefer a provider-independent E2E path for CI stability when possible, such as anonymous access instead of popup-based Google auth.
- Avoid forcing a Chrome channel in Playwright config unless CI explicitly installs and uses it.
- Login-related E2E flows should reflect the real auth-oriented UI, even if external auth providers are mocked or partially stubbed in tests.

If tests are regenerated, keep the behavior equivalent to the current setup.

Before creating any commit, verify that both of these pass in the current workspace:

- unit tests
- Playwright end-to-end tests

Do not create or propose a commit as ready if either suite is failing or has not been run.

## NPM Scripts Baseline

Regenerated projects should include these scripts or direct equivalents:

- `ng`
- `start`
- `build`
- `build:pages`
- `watch`
- `test`
- `test:unit`
- `test:e2e`
- `test:e2e:ui`
- `test:e2e:playwright`
- `playwright:install`

Expected meanings:

- `ng`: run Angular CLI commands
- `start`: run Angular dev server
- `build`: production Angular build
- `build:pages`: production build for GitHub Pages
- `watch`: Angular build in watch mode for development
- `test` / `test:unit`: unit tests
- `test:e2e`: generate BDD specs then run Playwright
- `test:e2e:ui`: same, but with Playwright UI
- `test:e2e:playwright`: run Playwright directly

## Expected Initial App Behavior

The recreated base project should behave like this:

- Opening the app lands on `/login`.
- In deployed GitHub Pages URLs, that route is represented as `/#/login`.
- The login page shows a polished Tailwind-based layout, not a placeholder form.
- The login screen offers provider-based entry points such as `Entrar con Google` and `Continuar como invitado`.
- Login actions call a real auth service instead of checking hardcoded credentials.
- If the user is already authenticated, loading `/login` redirects to `/dashboard`.
- `/dashboard` is protected and requires an authenticated or anonymous Firebase session.
- The dashboard renders a styled landing page, not a blank placeholder.
- The dashboard exposes a logout action.

If exact copy is requested, preserve the current structure, auth flow, and visual direction as closely as practical, but keep the thematic copy generic unless instructed otherwise.

## Regeneration Workflow

When asked to recreate the project from scratch, follow this order:

1. Create the Angular 21 app with SCSS support.
2. Set up NgModules and routing.
3. Install and configure Tailwind, PostCSS, and Autoprefixer using `src/styles.scss`.
4. Install and configure Jest.
5. Install and configure Playwright + `playwright-bdd`.
6. Install and configure Firebase web auth dependencies.
7. Recreate the auth service and auth guard.
8. Recreate the login and dashboard components and templates.
9. Restore the environment strategy with placeholders, local ignored config, and production secret injection.
10. Restore the same npm scripts.
11. Recreate the separated feature structure with Gherkin files in `features/gherkin/` and step code in `features/steps/`.
12. Verify with build, unit tests, and Playwright end-to-end tests.

Do not stop after scaffolding the CLI app if the user asked to regenerate the whole base project.

## File Recreation Guidance

If any of these files are missing during regeneration, recreate them in the baseline style of this repository:

- `package.json`
- `package-lock.json`
- `angular.json`
- `.gitignore`
- `.github/workflows/deploy-pages.yml`
- `tailwind.config.js`
- `postcss.config.js`
- `jest.config.js`
- `src/styles.scss`
- `src/app/app.module.ts`
- `src/app/app-routing.module.ts`
- `src/app/app.component.*`
- `src/app/auth/*`
- `src/app/login/*`
- `src/app/dashboard/*`
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `src/environments/environment.local.example.ts`
- `playwright.config.ts`
- `features/gherkin/login.feature`
- `features/steps/login.steps.ts`

Note:

- `src/environments/environment.local.ts` is intentionally local-only and should be recreated only as an untracked developer file, not as a committed file.

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
- removing Firebase auth and replacing it with a fake form
- committing real environment values into tracked source files

Small fixes are acceptable if they are needed for the project to build or test successfully, but they should preserve the same overall stack and behavior.

## Output Quality Bar

Any recreated version of this project should:

- build successfully
- run locally with `npm start`
- pass unit tests
- pass Playwright end-to-end tests
- preserve the same foundational dependencies
- preserve the same initial app structure
- preserve the authentication baseline
- preserve the environment and deployment strategy
- feel like the same starter project, not a new one

If there is any ambiguity, prefer fidelity to the current repository over generic scaffolding.
