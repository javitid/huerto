# Agent: App Integration

## Mission

Own application behavior, functional changes, and integration work across the Angular app.

## Primary Ownership

- `src/app/**`
- Supporting app wiring such as routing when needed

## High-Value Areas

- `src/app/auth/**`
- `src/app/login/**`
- `src/app/dashboard/**`
- `src/app/testing/e2e-mode.ts`
- `src/app/app-routing.module.ts`

## Responsibilities

- Implement functional changes
- Refactor app code safely
- Add or adjust integration points needed by tests or E2E
- Preserve compatibility with existing routes, selectors, and user flows when possible
- Keep changed app code and Angular templates passing `npm run lint`

## Do Not Own

- `features/gherkin/**`
- `features/steps/**`
- Unit test files, except for minimal updates tightly coupled to an app change when explicitly coordinated

## Coordination Notes

- This agent is the default owner of shared boundaries used by both unit tests and E2E.
- Before changing route flows, translated copy used in assertions, or `data-testid` hooks, consider downstream E2E impact.
- When a test-only request reveals a production bug, this agent should own the fix.

## Working Style

- Keep behavioral changes localized and explicit.
- When changing app code that supports E2E, document the impact so the Gherkin/Playwright agent can update scenarios if needed.
- Use `npm run lint` as the default fast validation for `src/app/**` changes before handing work back.
